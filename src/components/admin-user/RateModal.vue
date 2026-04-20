<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
        <div class="rate-modal">

          <!-- Header -->
          <div class="modal-header">
            <div class="header-info">
              <div class="user-avatar" :style="`background:${avatarColor(user.fullName)}`">
                {{ user.fullName.charAt(0).toUpperCase() }}
              </div>
              <div>
                <p class="modal-title">Hourly Rate</p>
                <p class="modal-sub">{{ user.fullName }}</p>
              </div>
            </div>
            <button class="btn-close" @click="$emit('close')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Current rate banner -->
          <div class="current-rate-banner" v-if="currentRate">
            <div class="banner-left">
              <span class="banner-label">Current Rate</span>
              <span class="banner-rate">RM {{ Number(currentRate.rate).toFixed(2) }} <span class="banner-unit">/ hr</span></span>
            </div>
            <span class="banner-since">Effective {{ formatDate(currentRate.effective_from) }}</span>
          </div>
          <div class="current-rate-banner no-rate" v-else>
            <span class="banner-label">No rate set yet</span>
          </div>

          <!-- Set new rate form -->
          <div class="form-section">
            <p class="section-title">Set New Rate</p>
            <div class="form-row">
              <div class="field">
                <label>Hourly Rate (RM)</label>
                <div class="input-wrap">
                  <span class="input-prefix">RM</span>
                  <input
                    type="number"
                    v-model="form.rate"
                    min="0"
                    step="0.50"
                    placeholder="0.00"
                    class="rate-input"
                  />
                </div>
              </div>
              <div class="field">
                <label>Effective From</label>
                <input type="date" v-model="form.effective_from" class="date-input" />
              </div>
            </div>
            <button class="btn-save" @click="save" :disabled="!form.rate || !form.effective_from || saving">
              <svg v-if="saving" class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              {{ saving ? 'Saving…' : 'Save Rate' }}
            </button>
          </div>

          <!-- Rate history -->
          <div class="history-section" v-if="rates.length > 0">
            <p class="section-title">Rate History</p>
            <div class="history-list">
              <div v-for="r in rates" :key="r.id" class="history-row">
                <div class="history-left">
                  <span class="history-rate">RM {{ Number(r.rate).toFixed(2) }}/hr</span>
                  <span class="history-date">Effective {{ formatDate(r.effective_from) }}</span>
                </div>
                <button class="btn-delete" @click="deleteRate(r.id)" title="Remove">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import axios from 'axios';
import API_BASE_URL from '@/services/api';

const AVATAR_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#06b6d4','#8b5cf6','#ec4899','#14b8a6'];

export default {
  name: 'RateModal',
  props: {
    visible: { type: Boolean, required: true },
    user:    { type: Object,  required: true },
  },
  emits: ['close'],

  data() {
    return {
      rates:  [],
      saving: false,
      form: {
        rate: '',
        effective_from: new Date().toISOString().slice(0, 10),
      },
    };
  },

  computed: {
    currentRate() {
      return this.rates.length ? this.rates[0] : null;
    },
  },

  mounted() {
    if (this.visible) this.fetchRates();
  },

  watch: {
    visible(val) {
      if (val) this.fetchRates();
    },
  },

  methods: {
    avatarColor(name) {
      return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
    },
    formatDate(d) {
      if (!d) return '—';
      return new Date(d).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
    },
    async fetchRates() {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/hourly-rates/${this.user.id}`);
        this.rates = res.data;
      } catch (err) {
        console.error('Failed to fetch rates', err);
      }
    },
    async save() {
      if (!this.form.rate || !this.form.effective_from) return;
      this.saving = true;
      try {
        await axios.post(`${API_BASE_URL}/api/hourly-rates`, {
          userID: this.user.id,
          rate: this.form.rate,
          effective_from: this.form.effective_from,
        });
        this.form.rate = '';
        this.form.effective_from = new Date().toISOString().slice(0, 10);
        await this.fetchRates();
      } catch (err) {
        console.error('Failed to save rate', err);
      } finally {
        this.saving = false;
      }
    },
    async deleteRate(id) {
      try {
        await axios.delete(`${API_BASE_URL}/api/hourly-rates/${id}`);
        this.rates = this.rates.filter(r => r.id !== id);
      } catch (err) {
        console.error('Failed to delete rate', err);
      }
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(15,23,42,0.45);
  backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1100; padding: 16px;
}

.rate-modal {
  background: #fff;
  border-radius: 16px;
  width: 100%; max-width: 440px;
  box-shadow: 0 24px 64px rgba(15,23,42,0.18);
  overflow: hidden;
  font-family: 'DM Sans', sans-serif;
}

/* Header */
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 22px;
  border-bottom: 1px solid #f1f5f9;
}
.header-info { display: flex; align-items: center; gap: 12px; }
.user-avatar {
  width: 38px; height: 38px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; color: #fff; flex-shrink: 0;
}
.modal-title { font-size: 15px; font-weight: 700; color: #0f172a; letter-spacing: -.02em; }
.modal-sub   { font-size: 12px; color: #94a3b8; margin-top: 1px; }
.btn-close {
  width: 28px; height: 28px; border-radius: 8px;
  border: 1px solid #f1f5f9; background: #f8fafc;
  color: #64748b; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .12s;
}
.btn-close:hover { background: #fee2e2; border-color: #fca5a5; color: #ef4444; }

/* Current rate banner */
.current-rate-banner {
  display: flex; align-items: center; justify-content: space-between;
  margin: 16px 22px;
  padding: 14px 16px;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  border-radius: 12px;
}
.current-rate-banner.no-rate { background: #f8fafc; border-color: #e2e8f0; }
.banner-left { display: flex; flex-direction: column; gap: 2px; }
.banner-label { font-size: 11px; font-weight: 600; color: #6366f1; text-transform: uppercase; letter-spacing: .07em; }
.no-rate .banner-label { color: #94a3b8; }
.banner-rate  { font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -.03em; line-height: 1.2; }
.banner-unit  { font-size: 13px; font-weight: 400; color: #64748b; }
.banner-since { font-size: 11.5px; color: #6366f1; font-weight: 500; }

/* Form */
.form-section {
  padding: 0 22px 16px;
  display: flex; flex-direction: column; gap: 12px;
}
.section-title {
  font-size: 11px; font-weight: 600; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .08em;
}
.form-row { display: flex; gap: 10px; }
.field { display: flex; flex-direction: column; gap: 5px; flex: 1; }
.field label {
  font-size: 11.5px; font-weight: 600; color: #475569;
}

.input-wrap { position: relative; display: flex; align-items: center; }
.input-prefix {
  position: absolute; left: 10px;
  font-size: 13px; font-weight: 600; color: #94a3b8; pointer-events: none;
}
.rate-input {
  width: 100%; padding: 9px 10px 9px 32px;
  border: 1px solid #e2e8f0; border-radius: 9px;
  font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;
  color: #0f172a; background: #f8fafc; outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.rate-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); background: #fff; }

.date-input {
  width: 100%; padding: 9px 10px;
  border: 1px solid #e2e8f0; border-radius: 9px;
  font-family: 'DM Sans', sans-serif; font-size: 13px;
  color: #0f172a; background: #f8fafc; outline: none;
  transition: border-color .15s, box-shadow .15s; cursor: pointer;
}
.date-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); background: #fff; }

.btn-save {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  background: #6366f1; color: #fff; border: none;
  border-radius: 9px; padding: 10px 20px;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: background .15s, transform .1s, box-shadow .15s;
  align-self: flex-end;
}
.btn-save:hover:not(:disabled) { background: #4f46e5; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,.3); }
.btn-save:disabled { opacity: .5; cursor: not-allowed; }

/* History */
.history-section {
  padding: 0 22px 20px;
  display: flex; flex-direction: column; gap: 10px;
  border-top: 1px solid #f1f5f9;
  padding-top: 16px;
}
.history-list { display: flex; flex-direction: column; gap: 6px; max-height: 180px; overflow-y: auto; }
.history-list::-webkit-scrollbar { width: 3px; }
.history-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

.history-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 12px;
  background: #f8fafc; border: 1px solid #f1f5f9;
  border-radius: 8px;
}
.history-left { display: flex; flex-direction: column; gap: 2px; }
.history-rate { font-size: 13px; font-weight: 600; color: #1e293b; }
.history-date { font-size: 11px; color: #94a3b8; }
.btn-delete {
  background: transparent; border: none; color: #cbd5e1;
  cursor: pointer; padding: 4px; border-radius: 6px;
  display: flex; align-items: center; transition: color .12s, background .12s;
}
.btn-delete:hover { color: #ef4444; background: #fee2e2; }

/* Spinner */
.spin { animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Transition */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .rate-modal,
.modal-fade-leave-active .rate-modal { transition: transform .2s ease; }
.modal-fade-enter-from .rate-modal,
.modal-fade-leave-to   .rate-modal { transform: scale(0.96) translateY(8px); }
</style>
