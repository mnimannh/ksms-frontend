<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
        <div class="bulk-modal">

          <!-- Header -->
          <div class="modal-header">
            <div>
              <p class="modal-title">Set Hourly Rate</p>
              <p class="modal-sub">Apply to selected staff members</p>
            </div>
            <button class="btn-close" @click="$emit('close')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Rate inputs -->
          <div class="form-section">
            <div class="form-row">
              <div class="field">
                <label>Rate (RM/hr)</label>
                <div class="input-wrap">
                  <span class="input-prefix">RM</span>
                  <input type="number" v-model="form.rate" min="0" step="0.50" placeholder="0.00" class="rate-input" />
                </div>
              </div>
              <div class="field">
                <label>Effective From</label>
                <input type="date" v-model="form.effective_from" class="date-input" />
              </div>
            </div>
          </div>

          <!-- Staff list -->
          <div class="staff-section">
            <div class="staff-section-header">
              <span class="sel-count">{{ selectedIds.size }} of {{ staffList.length }} selected</span>
              <div class="sel-links">
                <button class="sel-link" @click="selectAll">All</button>
                <span>·</span>
                <button class="sel-link" @click="selectNone">None</button>
              </div>
            </div>

            <div class="staff-list">
              <label v-for="s in staffList" :key="s.id" class="staff-row" :class="{ on: selectedIds.has(s.id) }">
                <input type="checkbox" class="cb" :checked="selectedIds.has(s.id)" @change="toggle(s.id)" />
                <div class="avatar" :style="`background:${avatarColor(s.fullName)}`">{{ s.fullName[0].toUpperCase() }}</div>
                <div class="staff-info">
                  <p class="staff-name">{{ s.fullName }}</p>
                  <p class="staff-cur">{{ currentRates[s.id] ? `RM ${Number(currentRates[s.id]).toFixed(2)}/hr` : 'No rate set' }}</p>
                </div>
                <svg v-if="selectedIds.has(s.id)" class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </label>
              <p v-if="staffList.length === 0" class="empty">No staff found.</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button class="btn-cancel" @click="$emit('close')">Cancel</button>
            <button class="btn-apply" :disabled="!form.rate || !form.effective_from || saving || selectedIds.size === 0" @click="applySelected">
              <svg v-if="saving" class="spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              {{ saving ? `Saving… ${doneCount}/${selectedIds.size}` : `Apply to ${selectedIds.size} Staff` }}
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import axios from 'axios'
import API_BASE_URL from '@/services/api'

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#06b6d4','#8b5cf6','#ec4899','#14b8a6']

export default {
  name: 'BulkRateModal',
  props: {
    visible:   { type: Boolean, required: true },
    staffList: { type: Array,   required: true },
  },
  emits: ['close', 'saved'],

  data() {
    return {
      form: { rate: '', effective_from: new Date().toISOString().slice(0, 10) },
      currentRates: {},
      selectedIds:  new Set(),
      saving:       false,
      doneCount:    0,
    }
  },

  watch: {
    visible(val) {
      if (val) {
        this.form.rate = ''
        this.form.effective_from = new Date().toISOString().slice(0, 10)
        this.doneCount = 0
        this.selectedIds = new Set(this.staffList.map(s => s.id))
        this.fetchCurrentRates()
      }
    },
  },

  methods: {
    avatarColor(name) { return COLORS[name.charCodeAt(0) % COLORS.length] },
    selectAll()  { this.selectedIds = new Set(this.staffList.map(s => s.id)) },
    selectNone() { this.selectedIds = new Set() },
    toggle(id) {
      const next = new Set(this.selectedIds)
      next.has(id) ? next.delete(id) : next.add(id)
      this.selectedIds = next
    },

    async fetchCurrentRates() {
      const results = await Promise.allSettled(
        this.staffList.map(s => axios.get(`${API_BASE_URL}/api/hourly-rates/${s.id}`))
      )
      const map = {}
      results.forEach((r, i) => {
        if (r.status === 'fulfilled' && r.value.data?.length)
          map[this.staffList[i].id] = r.value.data[0].rate
      })
      this.currentRates = map
    },

    async applySelected() {
      if (!this.form.rate || !this.form.effective_from || !this.selectedIds.size) return
      this.saving = true
      this.doneCount = 0
      const targets = this.staffList.filter(s => this.selectedIds.has(s.id))
      try {
        for (const s of targets) {
          await axios.post(`${API_BASE_URL}/api/hourly-rates`, {
            userID: s.id, rate: this.form.rate, effective_from: this.form.effective_from,
          })
          this.doneCount++
        }
        this.$emit('saved')
        this.$emit('close')
      } catch (err) {
        console.error('Bulk rate save failed', err)
      } finally {
        this.saving = false
      }
    },
  },
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(15,23,42,0.4); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1100; padding: 16px;
}

.bulk-modal {
  background: #fff; border-radius: 16px;
  width: 100%; max-width: 460px; max-height: 88vh;
  box-shadow: 0 20px 60px rgba(15,23,42,0.16);
  display: flex; flex-direction: column;
  font-family: 'DM Sans', sans-serif;
}

/* Header */
.modal-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 20px 22px 16px; flex-shrink: 0;
}
.modal-title { font-size: 15px; font-weight: 700; color: #0f172a; }
.modal-sub   { font-size: 12px; color: #94a3b8; margin-top: 2px; }
.btn-close {
  width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
  border: 1px solid #f1f5f9; background: #f8fafc; color: #94a3b8;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all .12s;
}
.btn-close:hover { background: #fee2e2; border-color: #fca5a5; color: #ef4444; }

/* Form */
.form-section {
  padding: 0 22px 16px; flex-shrink: 0;
  border-bottom: 1px solid #f1f5f9;
}
.form-row { display: flex; gap: 10px; }
.field { flex: 1; display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .07em; }

.input-wrap { position: relative; }
.input-prefix {
  position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
  font-size: 13px; font-weight: 600; color: #94a3b8; pointer-events: none;
}
.rate-input {
  width: 100%; padding: 9px 10px 9px 30px;
  border: 1px solid #e2e8f0; border-radius: 9px;
  font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700; color: #0f172a;
  background: #f8fafc; outline: none; transition: border-color .15s, box-shadow .15s;
}
.rate-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); background: #fff; }
.date-input {
  width: 100%; padding: 9px 10px;
  border: 1px solid #e2e8f0; border-radius: 9px;
  font-family: 'DM Sans', sans-serif; font-size: 13px; color: #0f172a;
  background: #f8fafc; outline: none; cursor: pointer; transition: border-color .15s;
}
.date-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); background: #fff; }

/* Staff list */
.staff-section {
  flex: 1; min-height: 0; display: flex; flex-direction: column;
  padding: 14px 22px 4px;
}
.staff-section-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; flex-shrink: 0;
}
.sel-count { font-size: 12px; color: #94a3b8; }
.sel-links { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #cbd5e1; }
.sel-link {
  background: none; border: none; padding: 0;
  font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
  color: #6366f1; cursor: pointer;
}
.sel-link:hover { text-decoration: underline; }

.staff-list {
  overflow-y: auto; display: flex; flex-direction: column; gap: 4px;
}
.staff-list::-webkit-scrollbar { width: 3px; }
.staff-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

.staff-row {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: 10px;
  border: 1px solid transparent;
  cursor: pointer; transition: background .1s, border-color .1s;
  user-select: none;
}
.staff-row:hover { background: #f8fafc; }
.staff-row.on { background: #f5f3ff; border-color: #e0e7ff; }

/* Checkbox */
.cb {
  appearance: none; -webkit-appearance: none;
  width: 16px; height: 16px; border-radius: 5px; flex-shrink: 0;
  border: 1.5px solid #d1d5db; background: #fff; cursor: pointer;
  position: relative; transition: all .12s;
}
.cb:checked { background: #6366f1; border-color: #6366f1; }
.cb:checked::after {
  content: ''; position: absolute;
  left: 4px; top: 1px; width: 5px; height: 9px;
  border: 2px solid #fff; border-top: none; border-left: none;
  transform: rotate(45deg);
}

.avatar {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #fff;
}
.staff-info { flex: 1; min-width: 0; }
.staff-name { font-size: 13px; font-weight: 600; color: #0f172a; }
.staff-cur  { font-size: 11.5px; color: #94a3b8; margin-top: 1px; }

.check-icon { flex-shrink: 0; opacity: .8; }
.empty { text-align: center; padding: 20px; color: #cbd5e1; font-size: 13px; }

/* Footer */
.modal-footer {
  display: flex; align-items: center; justify-content: flex-end; gap: 8px;
  padding: 14px 22px; border-top: 1px solid #f1f5f9; flex-shrink: 0;
}
.btn-cancel {
  padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 9px;
  background: #fff; font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 500; color: #64748b; cursor: pointer;
}
.btn-cancel:hover { background: #f8fafc; }
.btn-apply {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 18px; border: none; border-radius: 9px;
  background: #6366f1; color: #fff;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: background .15s, transform .1s;
}
.btn-apply:hover:not(:disabled) { background: #4f46e5; transform: translateY(-1px); }
.btn-apply:disabled { opacity: .45; cursor: not-allowed; }

.spin { animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .bulk-modal,
.modal-fade-leave-active .bulk-modal { transition: transform .2s ease; }
.modal-fade-enter-from .bulk-modal,
.modal-fade-leave-to   .bulk-modal { transform: scale(0.97) translateY(6px); }
</style>
