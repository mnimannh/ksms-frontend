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
              <p class="ag-sub">System validates rules against strict cooperative labor thresholds</p>
            </div>
          </div>
          <button class="ag-btn-close" @click="$emit('close')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="ag-body">

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
              <label class="ag-label">Staff per Slot <span class="ag-badge-auto">RULE</span></label>
              <div class="ag-locked-input-wrapper">
                <select :value="form.staffPerSlot" class="ag-select ag-select-disabled" disabled>
                  <option :value="2">2 staff (Standard Coverage)</option>
                </select>
              </div>
            </div>
          </div>

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

          <div v-if="holidaysLoading" class="ag-h-loading-status">
            <span class="ag-spinner-sm"></span> Syncing Selangor public holidays...
          </div>

          <div class="ag-meta-info-row">
            <div class="ag-meta-pill">Available Roster: <strong>{{ totalStaff }} staff</strong></div>
            <div class="ag-meta-pill">Active Days: <strong>{{ activeWorkdaysCount }} days</strong></div>
            <div class="ag-meta-pill">Total Required Hours: <strong>{{ totalRequiredHours }}h</strong></div>
          </div>

          <div class="ag-preview">
            <div class="ag-preview-main-grid">
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
                <span class="ag-preview-val" :class="hoursStatusClass">~{{ estimatedHoursPerStaff }}h</span>
                <span class="ag-status-text-hint" :class="hoursStatusClass">({{ statusMessageText }})</span>
              </div>
            </div>

            <div class="ag-recommendation-box" :class="recommendationBoxClass">
              <div class="ag-rec-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-top:1px;">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <span>System Roster Analysis:</span>
              </div>
              <p class="ag-rec-text">{{ recommendationTextAdvice }}</p>
            </div>
          </div>

          <div v-if="result" class="ag-result">
            <div class="ag-result-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Draft generated — <strong>{{ result.totalAssignments }}</strong> shifts created</span>
            </div>
            <div class="ag-result-hours">
              <div v-for="(hrs, name) in result.hoursSummary" :key="name" class="ag-rh-row">
                <span class="ag-rh-name">{{ name }}</span>
                <div class="ag-rh-track">
                  <div class="ag-rh-bar" :style="`width:${Math.min((hrs / 100) * 100, 100)}%`"></div>
                </div>
                <span class="ag-rh-val">{{ hrs }}h</span>
              </div>
            </div>
          </div>

          <div v-if="error" class="ag-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ error }}
          </div>

        </div>

        <div class="ag-footer">
          <button class="ag-btn-cancel" @click="$emit('close')">{{ result ? 'Close' : 'Cancel' }}</button>
          <button v-if="!result" class="ag-btn-generate" @click="generate" :disabled="loading || holidaysLoading || isSeverelyUnderstaffed">
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

// STRICT COOPERATIVE HOUR RULE MATRICES
const MIN_HOURS_RULE = 40;  // Normal minimum shift base floor
const MAX_HOURS_RULE = 100; // Hard limit for high capacity workers ("Rajin")

export default {
  name: 'ShiftAutoGenerateModal',
  emits: ['close', 'generated'],
  props: {
    visible: { type: Boolean, default: false },
    totalStaff: { type: Number, default: 7 } 
  },

  data() {
    const now = new Date()
    return {
      form: {
        month:        now.getMonth() + 1,
        year:         now.getFullYear(),
        staffPerSlot: 2, // Hardcoded to 2 staff members per slot baseline
        minHours:     MIN_HOURS_RULE,
        maxHours:     MAX_HOURS_RULE,
        morningStart: '08:00',
        morningEnd:   '13:00',
        eveningStart: '14:00',
        eveningEnd:   '18:00',
        skipWeekends: true, 
        blockedDates: [],   
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
    morningHours() { return this.diffHours(this.form.morningStart, this.form.morningEnd) },
    eveningHours() { return this.diffHours(this.form.eveningStart, this.form.eveningEnd) },
    dailyHours()   { return this.morningHours + this.eveningHours },

    activeWorkdaysCount() {
      const totalDays = new Date(this.form.year, this.form.month, 0).getDate()
      let count = 0

      for (let day = 1; day <= totalDays; day++) {
        const dateObj = new Date(this.form.year, this.form.month - 1, day)
        const dayOfWeek = dateObj.getDay()

        const mm = String(this.form.month).padStart(2, '0')
        const dd = String(day).padStart(2, '0')
        const dateString = `${this.form.year}-${mm}-${dd}`

        const isWeekend = this.form.skipWeekends && (dayOfWeek === 0 || dayOfWeek === 6)
        const isHoliday = this.form.blockedDates.includes(dateString)

        if (!isWeekend && !isHoliday) {
          count++
        }
      }
      return count
    },

    totalRequiredHours() {
      return this.activeWorkdaysCount * this.dailyHours * this.form.staffPerSlot
    },

    estimatedHoursPerStaff() {
      if (!this.totalStaff) return 0
      return Math.round(this.totalRequiredHours / this.totalStaff)
    },

    // Check if the current workload strains the team past the 100-hour ceiling
    isSeverelyUnderstaffed() {
      return this.estimatedHoursPerStaff > MAX_HOURS_RULE
    },

    // Calculates exactly how many more staff are required to hit the target workloads
    requiredAdditionalStaffCount() {
      if (!this.isSeverelyUnderstaffed) return 0
      
      // Calculate staff needed to bring down workload to the ideal high bracket limit (e.g. 85 hours)
      const idealStaffVolume = Math.ceil(this.totalRequiredHours / 85)
      const shortfall = idealStaffVolume - this.totalStaff
      return shortfall > 0 ? shortfall : 1
    },

    hoursStatusClass() {
      const hrs = this.estimatedHoursPerStaff
      if (hrs > MAX_HOURS_RULE) return 'ag-status-danger'
      if (hrs < MIN_HOURS_RULE) return 'ag-status-warning'
      return 'ag-status-optimal'
    },

    statusMessageText() {
      const hrs = this.estimatedHoursPerStaff
      if (hrs > MAX_HOURS_RULE) return 'Understaffed Crisis'
      if (hrs < MIN_HOURS_RULE) return 'Excess Capacity'
      return 'Balanced Workload'
    },

    recommendationTextAdvice() {
      const hrs = this.estimatedHoursPerStaff
      
      if (this.isSeverelyUnderstaffed) {
        return `UNDERSTAFFED WARNING: Your active roster size (${this.totalStaff} staff) is insufficient to support operations this month. Spreading this schedule across current staff forces an average of ${hrs}h per person, breaching the 100h absolute cap. To protect the cooperative from burnout without stretching hours, you must recruit or assign at least ${this.requiredAdditionalStaffCount} more staff member(s) before generation can proceed.`
      }
      
      if (hrs < MIN_HOURS_RULE) {
        return `LOW TOTAL DEMAND: The workforce availability outweighs shift requirements. Average workload will drop to ~${hrs}h per person, slipping into the very light bracket (20–30 hours). The system will still populate shifts evenly up to the floor limit.`
      }

      // Breakdown of matching bracket recommendation
      let tierInfo = "Normal distribution (40–60 hours)";
      if (hrs >= 70) tierInfo = "High commitment rotation (70–100 hours)";

      return `ROSTER CLEAR: Available team size is optimized for a 2 staff-per-shift requirement. The monthly schedule lines up beautifully within the ${tierInfo}. Execution ready.`
    },

    recommendationBoxClass() {
      if (this.isSeverelyUnderstaffed) return 'ag-rec-danger'
      if (this.estimatedHoursPerStaff < MIN_HOURS_RULE) return 'ag-rec-warning'
      return 'ag-rec-optimal'
    }
  },

  watch: {
    visible(v) {
      if (v) {
        this.result = null
        this.error  = ''
        this.loadHolidays(this.form.year)
      }
    },
    'form.year'(y) { this.loadHolidays(y) }
  },

  methods: {
    async loadHolidays(year) {
      this.holidaysLoading = true
      try {
        const res = await fetch(`https://sabah-holiday.dydxsoft.my/api/selangor/${year}.json`)
        if (!res.ok) throw new Error(`API status ${res.status}`)
        const data = await res.json()
        
        if (Array.isArray(data)) {
          const monthMap = { 
            Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
            Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' 
          }
          this.form.blockedDates = data.map(h => {
            if (!h.date) return null
            const [monthStr, dayStr] = h.date.trim().split(/\s+/)
            const monthNum = monthMap[monthStr]
            if (!monthNum || !dayStr) return null
            return `${year}-${monthNum}-${dayStr.padStart(2, '0')}`
          }).filter(Boolean)
        }
      } catch (err) {
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
        const token = localStorage.getItem('userToken') || localStorage.getItem('token')
        const res = await fetch(`${API_BASE_URL}/api/shifts/auto-generate`, {
          method:  'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${token}` 
          },
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
.ag-backdrop {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.ag-fade-enter-active, .ag-fade-leave-active { transition: opacity .2s ease; }
.ag-fade-enter-from,  .ag-fade-leave-to      { opacity: 0; }

.ag-modal {
  background: #fff; border-radius: 16px; width: 540px; max-width: 95vw; max-height: 90vh;
  overflow-y: auto; box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2); font-family: 'DM Sans', sans-serif;
}
.ag-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 22px 24px 16px; border-bottom: 1px solid #f1f5f9; position: sticky; top: 0; background: #fff; z-index: 1;
}
.ag-header-left { display: flex; align-items: center; gap: 14px; }
.ag-icon {
  width: 42px; height: 42px; border-radius: 11px; background: #eef2ff; color: #6366f1;
  display: flex; align-items: center; justify-content: center;
}
.ag-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
.ag-sub   { font-size: 12px; color: #94a3b8; }
.ag-btn-close {
  width: 30px; height: 30px; border-radius: 7px; border: none; background: #f1f5f9; color: #64748b; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.ag-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
.ag-section-label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .08em; margin-top: 4px; }
.ag-field-row { display: flex; gap: 12px; }
.ag-field     { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.ag-label { font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: .05em; display: flex; align-items: center; gap: 6px; }
.ag-req { color: #ef4444; }
.ag-select, .ag-input {
  padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; color: #1e293b; outline: none; width: 100%; box-sizing: border-box;
}
.ag-select-disabled { background: #f8fafc !important; color: #64748b !important; border-style: dashed !important; cursor: not-allowed; }
.ag-badge-auto { background: #f1f5f9; color: #475569; font-size: 9px; padding: 2px 5px; border-radius: 4px; font-weight: 800; }

.ag-dot          { width: 8px; height: 8px; border-radius: 50%; }
.ag-dot-morning  { background: #f59e0b; }
.ag-dot-evening  { background: #6366f1; }

.ag-meta-info-row { display: flex; gap: 10px; flex-wrap: wrap; }
.ag-meta-pill { background: #f1f5f9; font-size: 11px; color: #475569; padding: 6px 12px; border-radius: 6px; }

.ag-h-loading-status { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #4f46e5; background: #f5f3ff; padding: 8px 12px; border-radius: 8px; }
.ag-spinner-sm { width: 12px; height: 12px; border: 2px solid rgba(99, 102, 241, .2); border-top-color: #6366f1; border-radius: 50%; animation: ag-spin .65s linear infinite; }

.ag-preview { display: flex; flex-direction: column; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px; padding: 16px; gap: 14px; }
.ag-preview-main-grid { display: flex; align-items: center; width: 100%; }
.ag-preview-item  { display: flex; flex-direction: column; gap: 3px; flex: 1; }
.ag-preview-label { font-size: 11px; color: #94a3b8; }
.ag-preview-val   { font-size: 18px; font-weight: 700; color: #0f172a; }
.ag-status-text-hint { font-size: 10px; font-weight: 600; text-transform: uppercase; margin-top: 2px; }

.ag-recommendation-box { padding: 12px 14px; border-radius: 8px; font-size: 12px; line-height: 1.5; display: flex; flex-direction: column; gap: 4px; }
.ag-rec-title { display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: 11px; text-transform: uppercase; }
.ag-rec-optimal { background: #f0fdf4; border: 1px solid #dcfce7; color: #166534; }
.ag-rec-warning { background: #fffbeb; border: 1px solid #fef3c7; color: #92400e; }
.ag-rec-danger  { background: #fff5f5; border: 1px solid #fee2e2; color: #991b1b; }

.ag-status-optimal { color: #10b981 !important; }
.ag-status-warning { color: #f59e0b !important; }
.ag-status-danger  { color: #ef4444 !important; }
.ag-preview-sep   { width: 1px; height: 32px; background: #e2e8f0; margin: 0 16px; }

.ag-result { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; }
.ag-result-header { display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 500; color: #166534; }
.ag-result-hours  { display: flex; flex-direction: column; gap: 7px; }
.ag-rh-row   { display: flex; align-items: center; gap: 10px; }
.ag-rh-name  { font-size: 12.5px; color: #1e293b; min-width: 100px; }
.ag-rh-track { flex: 1; height: 6px; background: #dcfce7; border-radius: 99px; overflow: hidden; }
.ag-rh-bar   { height: 100%; background: #22c55e; }
.ag-rh-val   { font-size: 12px; color: #15803d; font-family: 'DM Mono', monospace; font-weight: 600; }

.ag-error { display: flex; align-items: flex-start; gap: 10px; background: #fff7f7; border: 1px solid #fecaca; padding: 12px 14px; font-size: 13px; color: #b91c1c; }
.ag-footer { padding: 16px 24px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 8px; position: sticky; bottom: 0; background: #fff; }
.ag-btn-cancel { padding: 9px 18px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; font-size: 13px; color: #64748b; cursor: pointer; }
.ag-btn-generate { display: inline-flex; align-items: center; gap: 7px; padding: 9px 20px; border: none; border-radius: 8px; background: #6366f1; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; }
.ag-btn-generate:disabled { background: #cbd5e1; color: #94a3b8; cursor: not-allowed; }

.ag-spinner { width: 15px; height: 15px; border: 2px solid rgba(255, 255, 255, .3); border-top-color: #fff; border-radius: 50%; animation: ag-spin .65s linear infinite; }
@keyframes ag-spin { to { transform: rotate(360deg); } }
</style>