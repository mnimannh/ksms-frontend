<template>
  <transition name="ag-fade">
    <div v-if="visible" class="ag-backdrop" @click.self="$emit('close')">
      <div class="ag-modal">

        <div class="ag-header">
          <div class="ag-header-left">
            <div class="ag-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
            <div>
              <h2 class="ag-title">Auto-Generate Schedule</h2>
              <p class="ag-sub">System will assign shifts fairly based on hours balance</p>
            </div>
          </div>
          <button class="ag-btn-close" @click="$emit('close')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="ag-body">

          <!-- Month & Year -->
          <div class="ag-field-row">
            <div class="ag-field">
              <label class="ag-label">Month <span class="ag-req">*</span></label>
              <select v-model.number="form.month" class="ag-select">
                <option v-for="(m, i) in months" :key="i" :value="i + 1">{{ m }}</option>
              </select>
            </div>
            <div class="ag-field">
              <label class="ag-label">Year <span class="ag-req">*</span></label>
              <select v-model.number="form.year" class="ag-select">
                <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>
            <div class="ag-field">
              <label class="ag-label">Staff per Slot</label>
              <select v-model.number="form.staffPerSlot" class="ag-select">
                <option :value="1">1 staff</option>
                <option :value="2">2 staff</option>
                <option :value="3">3 staff</option>
              </select>
            </div>
          </div>

          <!-- Shift Hours -->
          <p class="ag-section-label">Shift Hours</p>
          <div class="ag-field-row">
            <div class="ag-field">
              <label class="ag-label"><span class="ag-dot ag-dot-morning"></span> Morning Start</label>
              <input v-model="form.morningStart" type="time" class="ag-input" />
            </div>
            <div class="ag-field">
              <label class="ag-label">Morning End</label>
              <input v-model="form.morningEnd" type="time" class="ag-input" />
            </div>
          </div>
          <div class="ag-field-row">
            <div class="ag-field">
              <label class="ag-label"><span class="ag-dot ag-dot-evening"></span> Evening Start</label>
              <input v-model="form.eveningStart" type="time" class="ag-input" />
            </div>
            <div class="ag-field">
              <label class="ag-label">Evening End</label>
              <input v-model="form.eveningEnd" type="time" class="ag-input" />
            </div>
          </div>

          <!-- Background Loading Indicator for Holidays -->
          <div v-if="holidaysLoading" class="ag-h-loading-status">
            <span class="ag-spinner-sm"></span> Syncing Selangor public holidays...
          </div>

          <!-- Hours preview -->
          <div class="ag-preview">
            <div class="ag-preview-item">
              <span class="ag-preview-label">Morning duration</span>
              <span class="ag-preview-val">{{ morningHours }}h</span>
            </div>
            <div class="ag-preview-sep"></div>
            <div class="ag-preview-item">
              <span class="ag-preview-label">Evening duration</span>
              <span class="ag-preview-val">{{ eveningHours }}h</span>
            </div>
            <div class="ag-preview-sep"></div>
            <div class="ag-preview-item">
              <span class="ag-preview-label">Est. hours / staff</span>
              <span class="ag-preview-val ag-accent">~{{ estimatedHoursPerStaff }}h</span>
            </div>
          </div>

          <!-- Result summary -->
          <div v-if="result" class="ag-result">
            <div class="ag-result-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Draft generated — <strong>{{ result.totalAssignments }}</strong> shifts created</span>
            </div>
            <div class="ag-result-hours">
              <div v-for="(hrs, name) in result.hoursSummary" :key="name" class="ag-rh-row">
                <span class="ag-rh-name">{{ name }}</span>
                <div class="ag-rh-track">
                  <div class="ag-rh-bar" :style="`width:${Math.min((hrs / maxHours) * 100, 100)}%`"></div>
                </div>
                <span class="ag-rh-val">{{ hrs }}h</span>
              </div>
            </div>
            <p class="ag-result-hint">Review the draft on the calendar, then publish when ready.</p>
          </div>

          <!-- Error -->
          <div v-if="error" class="ag-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ error }}
          </div>

        </div>

        <div class="ag-footer">
          <button class="ag-btn-cancel" @click="$emit('close')">{{ result ? 'Close' : 'Cancel' }}</button>
          <button v-if="!result" class="ag-btn-generate" @click="generate" :disabled="loading || holidaysLoading">
            <span v-if="loading" class="ag-spinner"></span>
            <template v-else>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              Generate Draft
            </template>
          </button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script>
import API_BASE_URL from '@/services/api.js'

export default {
  name: 'ShiftAutoGenerateModal',
  emits: ['close', 'generated'],
  props: {
    visible: { type: Boolean, default: false },
  },

  data() {
    const now = new Date()
    return {
      form: {
        month:        now.getMonth() + 1,
        year:         now.getFullYear(),
        staffPerSlot: 2,
        morningStart: '08:00',
        morningEnd:   '13:00',
        eveningStart: '14:00',
        eveningEnd:   '18:00',
        skipWeekends: true, // Re-added to force backend to exclude Sat/Sun
        blockedDates: [],   // Re-added to hold Selangor holiday dates fetched from your custom API
      },
      months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
      years:   [now.getFullYear(), now.getFullYear() + 1],
      loading:         false,
      holidaysLoading: false,
      error:           '',
      result:          null,
    }
  },

  computed: {
    morningHours()          { return this.diffHours(this.form.morningStart, this.form.morningEnd) },
    eveningHours()          { return this.diffHours(this.form.eveningStart, this.form.eveningEnd) },
    estimatedHoursPerStaff(){ return '?' },
    maxHours() {
      if (!this.result) return 1
      return Math.max(...Object.values(this.result.hoursSummary), 1)
    },
  },

  watch: {
    visible(v) {
      if (v) {
        this.result = null
        this.error  = ''
        this.loadHolidays(this.form.year)
      }
    },
    'form.year'(y) { this.loadHolidays(y) },
  },

  methods: {
async loadHolidays(year) {
      this.holidaysLoading = true
      try {
        const res = await fetch(`https://sabah-holiday.dydxsoft.my/api/selangor/${year}.json`)
        if (!res.ok) throw new Error(`API status ${res.status}`)
        
        const data = await res.json()
        
        if (Array.isArray(data)) {
          // Months lookup mapping directory to translate API strings to padded indices
          const monthMap = { 
            Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
            Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' 
          }

          this.form.blockedDates = data.map(h => {
            if (!h.date) return null
            
            // Splits "Jan 01" into ["Jan", "01"]
            const [monthStr, dayStr] = h.date.trim().split(/\s+/)
            const monthNum = monthMap[monthStr]
            
            if (!monthNum || !dayStr) return null
            
            // Returns formatted array string format: "2026-01-01"
            return `${year}-${monthNum}-${dayStr.padStart(2, '0')}`
          }).filter(Boolean) // Discards any structural anomalies safely
          
          console.log('[Holidays Synced!]:', this.form.blockedDates)
        }
      } catch (err) {
        console.error('[Holidays API Error]:', err.message)
        this.form.blockedDates = []
      } finally {
        this.holidaysLoading = false
      }
    },

    diffHours(start, end) {
      if (!start || !end) return 0
      const [sh, sm] = start.split(':').map(Number)
      const [eh, em] = end.split(':').map(Number)
      return Math.round(((eh * 60 + em) - (sh * 60 + sm)) / 60 * 10) / 10
    },

    async generate() {
      this.error   = ''
      this.loading = true
      try {
        const token = localStorage.getItem('userToken')
        const res = await fetch(`${API_BASE_URL}/api/shifts/auto-generate`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body:    JSON.stringify({ ...this.form }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Generation failed')
        this.result = data
        this.$emit('generated')
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
/* Backdrop */
.ag-backdrop {
  position: fixed; inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.ag-fade-enter-active, .ag-fade-leave-active { transition: opacity .2s ease; }
.ag-fade-enter-from,  .ag-fade-leave-to      { opacity: 0; }

/* Modal box */
.ag-modal {
  background: #fff;
  border-radius: 16px;
  width: 540px; max-width: 95vw; max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2);
  font-family: 'DM Sans', sans-serif;
}

/* Header */
.ag-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 22px 24px 16px; border-bottom: 1px solid #f1f5f9;
  position: sticky; top: 0; background: #fff; z-index: 1;
}
.ag-header-left { display: flex; align-items: center; gap: 14px; }
.ag-icon {
  width: 42px; height: 42px; border-radius: 11px;
  background: #eef2ff; color: #6366f1; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.ag-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
.ag-sub   { font-size: 12px; color: #94a3b8; }
.ag-btn-close {
  width: 30px; height: 30px; border-radius: 7px; border: none;
  background: #f1f5f9; color: #64748b; cursor: pointer; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.ag-btn-close:hover { background: #e2e8f0; }

/* Body */
.ag-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }

.ag-section-label {
  font-size: 11px; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .08em;
}

.ag-field-row { display: flex; gap: 12px; }
.ag-field     { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.ag-label {
  font-size: 12px; font-weight: 600; color: #475569;
  text-transform: uppercase; letter-spacing: .05em;
  display: flex; align-items: center; gap: 6px;
}
.ag-req { color: #ef4444; }

.ag-select, .ag-input {
  padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px;
  font-size: 14px; font-family: 'DM Sans', sans-serif; color: #1e293b;
  outline: none; transition: border-color .15s; background: #fff; width: 100%;
  box-sizing: border-box;
}
.ag-select:focus, .ag-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, .1);
}

.ag-dot          { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.ag-dot-morning  { background: #f59e0b; }
.ag-dot-evening  { background: #6366f1; }

/* API Status Indicator Styles */
.ag-h-loading-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #4f46e5;
  background: #f5f3ff;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px dashed #c084fc;
}
.ag-spinner-sm {
  width: 12px; height: 12px;
  border: 2px solid rgba(99, 102, 241, .2);
  border-top-color: #6366f1; border-radius: 50%;
  animation: ag-spin .65s linear infinite;
}

/* Hours preview */
.ag-preview {
  display: flex; align-items: center;
  background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 10px;
  padding: 12px 16px;
}
.ag-preview-item  { display: flex; flex-direction: column; gap: 3px; flex: 1; }
.ag-preview-label { font-size: 11px; color: #94a3b8; }
.ag-preview-val   { font-size: 18px; font-weight: 700; color: #0f172a; letter-spacing: -.03em; }
.ag-preview-val.ag-accent { color: #6366f1; }
.ag-accent        { color: #6366f1; }
.ag-preview-sep   { width: 1px; height: 32px; background: #e2e8f0; margin: 0 16px; flex-shrink: 0; }

/* Result box */
.ag-result {
  background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px;
  padding: 16px 18px; display: flex; flex-direction: column; gap: 12px;
}
.ag-result-header { display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 500; color: #166534; }
.ag-result-hours  { display: flex; flex-direction: column; gap: 7px; }
.ag-rh-row   { display: flex; align-items: center; gap: 10px; }
.ag-rh-name  { font-size: 12.5px; color: #1e293b; font-weight: 500; min-width: 100px; }
.ag-rh-track { flex: 1; height: 6px; background: #dcfce7; border-radius: 99px; overflow: hidden; }
.ag-rh-bar   { height: 100%; background: #22c55e; border-radius: 99px; }
.ag-rh-val   { font-size: 12px; color: #15803d; font-family: 'DM Mono', monospace; min-width: 32px; text-align: right; font-weight: 600; }
.ag-result-hint { font-size: 12px; color: #4ade80; }

/* Error */
.ag-error {
  display: flex; align-items: flex-start; gap: 10px;
  background: #fff7f7; border: 1px solid #fecaca; border-radius: 9px;
  padding: 12px 14px; font-size: 13px; color: #b91c1c; line-height: 1.45;
}

/* Footer */
.ag-footer {
  padding: 16px 24px; border-top: 1px solid #f1f5f9;
  display: flex; justify-content: flex-end; gap: 8px;
  position: sticky; bottom: 0; background: #fff;
}
.ag-btn-cancel {
  padding: 9px 18px; border: 1px solid #e2e8f0; border-radius: 8px;
  background: #fff; font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 500; color: #64748b; cursor: pointer;
}
.ag-btn-cancel:hover { background: #f8fafc; }

.ag-btn-generate {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 20px; border: none; border-radius: 8px;
  background: #6366f1; color: #fff; font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: background .15s;
}
.ag-btn-generate:hover:not(:disabled) { background: #4f46e5; }
.ag-btn-generate:disabled { opacity: .6; cursor: not-allowed; }

.ag-spinner {
  width: 15px; height: 15px;
  border: 2px solid rgba(255, 255, 255, .3);
  border-top-color: #fff; border-radius: 50%;
  animation: ag-spin .65s linear infinite;
}
@keyframes ag-spin { to { transform: rotate(360deg); } }
</style>