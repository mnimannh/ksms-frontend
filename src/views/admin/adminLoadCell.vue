<template>
  <div class="app-layout">
    <AdminSidebar />

    <main class="page">

      <div class="topbar">
        <div class="topbar-left">
          <p class="topbar-date">{{ today }}</p>
          <h1 class="topbar-title">Load Cell <span class="accent">Management</span></h1>
        </div>
        <div class="topbar-right">
          <button class="btn-register" @click="openModal('add')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Register Sensor
          </button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-row">
        <div class="summary-card">
          <div class="summary-icon" style="background:#eef2ff; color:#6366f1">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="10" rx="2"/><line x1="12" y1="7" x2="12" y2="3"/><line x1="7" y1="7" x2="7" y2="5"/><line x1="17" y1="7" x2="17" y2="5"/></svg>
          </div>
          <div>
            <p class="summary-val">{{ loadCells.length }}</p>
            <p class="summary-label">Total Sensors</p>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon" style="background:#f0fdf4; color:#10b981">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <p class="summary-val">{{ activeSensors }}</p>
            <p class="summary-label">Active</p>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon" style="background:#fefce8; color:#eab308">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div>
            <p class="summary-val">{{ unassignedSensors }}</p>
            <p class="summary-label">Unassigned</p>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon" style="background:#fef2f2; color:#ef4444">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div>
            <p class="summary-val">{{ belowThresholdCount }}</p>
            <p class="summary-label">Below Threshold</p>
          </div>
        </div>
      </div>

      <!-- Sensor Table Panel -->
      <div class="panel">
        <div class="panel-head">
          <div>
            <p class="panel-title">Registered Sensors</p>
            <p class="panel-sub">{{ loadCells.length }} sensor{{ loadCells.length !== 1 ? 's' : '' }} registered</p>
          </div>
          <div class="head-right">
            <select v-model="statusFilter" class="filter-select">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="unassigned">Unassigned</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div class="table-wrap">
          <table class="lc-table">
            <thead>
              <tr>
                <th class="col-no">#</th>
                <th>Sensor UID</th>
                <th>Assigned Variant</th>
                <th>Status</th>
                <th class="col-num">Latest Weight</th>
                <th class="col-num">Calc. Qty</th>
                <th class="col-num">Threshold</th>
                <th>Last Seen</th>
                <th class="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(lc, i) in filteredCells" :key="lc.id" class="table-row" :class="{ 'row-offline': isOffline(lc) }">
                <td class="col-no td-muted">{{ i + 1 }}</td>
                <td>
                  <span class="uid-chip">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="10" rx="2"/><line x1="12" y1="7" x2="12" y2="3"/></svg>
                    {{ lc.sensor_uid }}
                  </span>
                </td>
                <td>
                  <span v-if="lc.variant_name" class="variant-chip">
                    {{ lc.product_name }} · {{ lc.variant_name }}
                  </span>
                  <span v-else class="td-muted">—</span>
                </td>
                <td>
                  <span class="status-indicator" :class="'st-' + lc.status">
                    <span class="status-dot"></span>
                    <span class="status-text">{{ statusLabel(lc) }}</span>
                  </span>
                </td>
                <td class="col-num td-mono">{{ lc.latest_weight != null ? Number(lc.latest_weight).toFixed(2) + 'g' : '—' }}</td>
                <td class="col-num">
                  <span v-if="lc.variant_id" class="qty-wrap">
                    <span class="qty-val" :class="{ 'qty-low': lc.calculated_quantity > 0 && lc.calculated_quantity < lc.variant_threshold, 'qty-out': lc.calculated_quantity === 0 }">{{ lc.calculated_quantity }}</span>
                    <span class="qty-threshold">/ {{ lc.variant_threshold }}</span>
                  </span>
                  <span v-else class="td-muted">—</span>
                </td>
                <td class="col-num">
                  <span v-if="lc.variant_threshold != null">{{ lc.variant_threshold }}</span>
                  <span v-else class="td-muted">—</span>
                </td>
                <td>
                  <span v-if="lc.last_seen" class="last-seen" :class="{ offline: isOffline(lc) }">
                    {{ timeAgo(lc.last_seen) }}
                  </span>
                  <span v-else class="td-muted">Never</span>
                </td>
                <td class="col-actions">
                  <div class="action-group">
                    <button v-if="!lc.variant_id" class="action-btn assign" @click="openAssignModal(lc)" title="Assign Variant">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                    </button>
                    <button v-if="lc.variant_id" class="action-btn unassign" @click="confirmUnassign(lc)" title="Unassign">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                    <button class="action-btn" @click="viewLogs(lc)" title="View Logs">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    </button>
                    <button class="action-btn" @click="openModal('edit', lc)" title="Edit">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="action-btn danger" @click="confirmDelete(lc)" title="Delete">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredCells.length === 0">
                <td colspan="9" class="td-empty">
                  <div class="empty-state">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5"><rect x="2" y="7" width="20" height="10" rx="2"/><line x1="12" y1="7" x2="12" y2="3"/><line x1="7" y1="7" x2="7" y2="5"/><line x1="17" y1="7" x2="17" y2="5"/></svg>
                    <p>No sensors found</p>
                    <p class="empty-hint">Register a load cell sensor to start automated stock tracking</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Weight Log Panel (expandable) -->
      <transition name="slide">
        <div v-if="showLogs && logSensor" class="panel log-panel">
          <div class="panel-head">
            <div>
              <p class="panel-title">
                Weight History
                <span class="inv-badge">{{ logSensor.sensor_uid }}</span>
              </p>
              <p class="panel-sub">Last {{ logs.length }} readings</p>
            </div>
            <button class="btn-close-log" @click="showLogs = false">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="log-table-wrap">
            <table class="lc-table log-table">
              <thead>
                <tr>
                  <th class="col-no">#</th>
                  <th>Timestamp</th>
                  <th class="col-num">Weight (g)</th>
                  <th class="col-num">Quantity</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(log, i) in logs" :key="log.id" class="table-row">
                  <td class="col-no td-muted">{{ i + 1 }}</td>
                  <td>{{ formatDate(log.recorded_at) }}</td>
                  <td class="col-num td-mono">{{ Number(log.weight).toFixed(2) }}g</td>
                  <td class="col-num">
                    <span class="qty-val">{{ log.quantity }}</span>
                  </td>
                </tr>
                <tr v-if="logs.length === 0">
                  <td colspan="4" class="td-empty">No readings yet</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </transition>
    </main>

    <!-- Register / Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="lc-modal-backdrop" @click.self="showModal = false">
        <div class="lc-modal">
          <div class="lc-modal-header">
            <h2 class="lc-modal-title">{{ modalMode === 'edit' ? 'Edit Sensor' : 'Register Sensor' }}</h2>
            <button class="lc-modal-close" @click="showModal = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="lc-modal-body">
            <div class="field">
              <label class="field-label">Sensor UID <span class="req">*</span></label>
              <input v-model="form.sensor_uid" class="field-input mono-input" placeholder="e.g. LC-001 or ESP32-A4B2C1" maxlength="100" />
              <p v-if="formErrors.sensor_uid" class="field-error">{{ formErrors.sensor_uid }}</p>
            </div>
            <div class="field-row">
              <div class="field">
                <label class="field-label">Empty Weight (g)</label>
                <input v-model.number="form.empty_weight" type="number" min="0" step="0.01" class="field-input" placeholder="0.00" />
                <p class="field-hint">Weight of the empty container/shelf</p>
              </div>
              <div class="field">
                <label class="field-label">Unit Weight (g) <span class="req">*</span></label>
                <input v-model.number="form.unit_weight" type="number" min="0" step="0.01" class="field-input" placeholder="0.00" />
                <p class="field-hint">Weight of a single product unit</p>
                <p v-if="formErrors.unit_weight" class="field-error">{{ formErrors.unit_weight }}</p>
              </div>
            </div>
            <div class="field">
              <label class="field-label">Calibration Factor</label>
              <input v-model.number="form.calibration_factor" type="number" step="0.0001" class="field-input" placeholder="e.g. 2038.5" />
              <p class="field-hint">Hardware-specific calibration value (optional)</p>
            </div>
          </div>
          <div class="lc-modal-footer">
            <button class="btn-ghost" @click="showModal = false">Cancel</button>
            <button class="btn-primary" @click="submitSensor">
              {{ modalMode === 'edit' ? 'Save Changes' : 'Register' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Assign Modal -->
    <Teleport to="body">
      <div v-if="showAssignModal" class="lc-modal-backdrop" @click.self="showAssignModal = false">
        <div class="lc-modal">
          <div class="lc-modal-header">
            <h2 class="lc-modal-title">Assign to Variant</h2>
            <button class="lc-modal-close" @click="showAssignModal = false">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="lc-modal-body">
            <div class="assign-sensor-info">
              <span class="assign-label">Sensor</span>
              <span class="uid-chip">{{ assignTarget?.sensor_uid }}</span>
            </div>
            <div class="field">
              <label class="field-label">Select Variant <span class="req">*</span></label>
              <select v-model="assignVariantId" class="field-input">
                <option :value="null" disabled>Choose a variant…</option>
                <option v-for="v in availableVariants" :key="v.id" :value="v.id">
                  {{ v.product_name }} · {{ v.variant_name }} ({{ v.barcode }})
                </option>
              </select>
              <p v-if="availableVariants.length === 0" class="field-hint" style="color:#f59e0b">No variants available — all are already assigned to load cells</p>
            </div>
          </div>
          <div class="lc-modal-footer">
            <button class="btn-ghost" @click="showAssignModal = false">Cancel</button>
            <button class="btn-primary" :disabled="!assignVariantId" @click="doAssign">Assign</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete / Unassign Confirm -->
    <div v-if="showConfirm" class="lc-modal-backdrop" @click.self="showConfirm = false">
      <div class="confirm-modal">
        <div class="confirm-icon-wrap" :class="confirmType === 'delete' ? 'icon-danger' : 'icon-warn'">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h3 class="confirm-title">{{ confirmType === 'delete' ? 'Delete Sensor?' : 'Unassign Variant?' }}</h3>
        <p class="confirm-sub">
          <template v-if="confirmType === 'delete'">
            <strong>{{ confirmTarget?.sensor_uid }}</strong> will be permanently removed.
            <span v-if="confirmTarget?.variant_id">The linked variant will switch back to manual tracking.</span>
          </template>
          <template v-else>
            <strong>{{ confirmTarget?.variant_name }}</strong> will be unlinked from <strong>{{ confirmTarget?.sensor_uid }}</strong> and switch back to manual stock tracking.
          </template>
        </p>
        <div class="confirm-btns">
          <button class="btn-ghost" @click="showConfirm = false">Cancel</button>
          <button class="btn-danger" @click="executeConfirm">{{ confirmType === 'delete' ? 'Delete' : 'Unassign' }}</button>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast.show" class="toast">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        {{ toast.message }}
      </div>
    </transition>
  </div>
</template>

<script>
import API_BASE_URL from "@/services/api";
import AdminSidebar from '@/components/sidebar/adminSidebar.vue'
import axios from 'axios'

export default {
  name: 'AdminLoadCell',
  components: { AdminSidebar },

  data() {
    const now = new Date()
    return {
      today: now.toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      loadCells: [],
      availableVariants: [],
      logs: [],
      statusFilter: '',

      // Modal state
      showModal: false,
      modalMode: 'add',
      modalTarget: null,
      form: { sensor_uid: '', empty_weight: 0, unit_weight: '', calibration_factor: '' },
      formErrors: {},

      // Assign modal
      showAssignModal: false,
      assignTarget: null,
      assignVariantId: null,

      // Confirm modal
      showConfirm: false,
      confirmType: '',
      confirmTarget: null,

      // Logs panel
      showLogs: false,
      logSensor: null,

      // Toast
      toast: { show: false, message: '' },
    }
  },

  computed: {
    activeSensors() { return this.loadCells.filter(lc => lc.status === 'active').length },
    unassignedSensors() { return this.loadCells.filter(lc => lc.status === 'unassigned').length },
    belowThresholdCount() {
      return this.loadCells.filter(lc =>
        lc.variant_id && lc.calculated_quantity < lc.variant_threshold
      ).length
    },
    filteredCells() {
      if (!this.statusFilter) return this.loadCells
      return this.loadCells.filter(lc => lc.status === this.statusFilter)
    },
  },

  methods: {
    // ── Fetches ──────────────────────────────────────────────────
    async fetchLoadCells() {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/load-cells`)
        this.loadCells = data
      } catch (e) { console.error(e) }
    },

    async fetchAvailableVariants() {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/load-cells/available-variants`)
        this.availableVariants = data
      } catch (e) { console.error(e) }
    },

    // ── Register / Edit Modal ───────────────────────────────────
    openModal(mode, lc = null) {
      this.modalMode = mode
      this.modalTarget = lc
      this.formErrors = {}
      if (mode === 'edit' && lc) {
        this.form = {
          sensor_uid: lc.sensor_uid,
          empty_weight: lc.empty_weight || 0,
          unit_weight: lc.unit_weight || '',
          calibration_factor: lc.calibration_factor || '',
        }
      } else {
        this.form = { sensor_uid: '', empty_weight: 0, unit_weight: '', calibration_factor: '' }
      }
      this.showModal = true
    },

    async submitSensor() {
      this.formErrors = {}
      if (!this.form.sensor_uid.trim()) this.formErrors.sensor_uid = 'Sensor UID is required'
      if (!this.form.unit_weight || this.form.unit_weight <= 0) this.formErrors.unit_weight = 'Unit weight must be > 0'
      if (Object.keys(this.formErrors).length) return

      try {
        if (this.modalMode === 'add') {
          await axios.post(`${API_BASE_URL}/api/load-cells`, this.form)
          this.showToast('Sensor registered')
        } else {
          await axios.put(`${API_BASE_URL}/api/load-cells/${this.modalTarget.id}`, this.form)
          this.showToast('Sensor updated')
        }
        this.showModal = false
        await this.fetchLoadCells()
      } catch (e) {
        if (e.response?.status === 409) {
          this.formErrors.sensor_uid = 'A sensor with this UID already exists'
        } else {
          console.error(e)
        }
      }
    },

    // ── Assign / Unassign ───────────────────────────────────────
    async openAssignModal(lc) {
      this.assignTarget = lc
      this.assignVariantId = null
      await this.fetchAvailableVariants()
      this.showAssignModal = true
    },

    async doAssign() {
      if (!this.assignVariantId) return
      try {
        await axios.patch(`${API_BASE_URL}/api/load-cells/${this.assignTarget.id}/assign`, {
          variant_id: this.assignVariantId
        })
        this.showAssignModal = false
        this.showToast('Sensor assigned to variant')
        await this.fetchLoadCells()
      } catch (e) { console.error(e) }
    },

    confirmUnassign(lc) {
      this.confirmType = 'unassign'
      this.confirmTarget = lc
      this.showConfirm = true
    },

    // ── Delete ──────────────────────────────────────────────────
    confirmDelete(lc) {
      this.confirmType = 'delete'
      this.confirmTarget = lc
      this.showConfirm = true
    },

    async executeConfirm() {
      try {
        if (this.confirmType === 'delete') {
          await axios.delete(`${API_BASE_URL}/api/load-cells/${this.confirmTarget.id}`)
          this.showToast('Sensor deleted')
        } else {
          await axios.patch(`${API_BASE_URL}/api/load-cells/${this.confirmTarget.id}/unassign`)
          this.showToast('Variant unassigned')
        }
        this.showConfirm = false
        await this.fetchLoadCells()
      } catch (e) { console.error(e) }
    },

    // ── Logs ────────────────────────────────────────────────────
    async viewLogs(lc) {
      this.logSensor = lc
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/load-cells/${lc.id}/logs?limit=30`)
        this.logs = data
        this.showLogs = true
      } catch (e) { console.error(e) }
    },

    // ── Helpers ─────────────────────────────────────────────────
    statusLabel(lc) {
      if (lc.status === 'active' && this.isOffline(lc)) return 'Offline'
      return lc.status.charAt(0).toUpperCase() + lc.status.slice(1)
    },

    isOffline(lc) {
      if (!lc.last_seen || lc.status !== 'active') return false
      return (Date.now() - new Date(lc.last_seen).getTime()) > 5 * 60 * 1000 // 5 min
    },

    timeAgo(dateStr) {
      const diff = Date.now() - new Date(dateStr).getTime()
      const mins = Math.floor(diff / 60000)
      if (mins < 1) return 'Just now'
      if (mins < 60) return `${mins}m ago`
      const hrs = Math.floor(mins / 60)
      if (hrs < 24) return `${hrs}h ago`
      const days = Math.floor(hrs / 24)
      return `${days}d ago`
    },

    formatDate(dateStr) {
      return new Date(dateStr).toLocaleString('en-MY', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      })
    },

    showToast(message) {
      this.toast = { show: true, message }
      setTimeout(() => { this.toast.show = false }, 3000)
    },
  },

  mounted() {
    this.fetchLoadCells()
  },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');

/* ── Modals ────────────────────────────────────────────── */
.lc-modal-backdrop {
  position: fixed; inset: 0; z-index: 10000;
  background: rgba(15, 23, 42, 0.3);
  display: flex; align-items: center; justify-content: center;
  padding: 20px; backdrop-filter: blur(1px);
}
.lc-modal {
  position: relative; z-index: 10001;
  background: #ffffff; border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
  width: 100%; max-width: 500px;
  animation: popIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes popIn {
  from { opacity: 0; transform: scale(0.97) translateY(8px); }
  to   { opacity: 1; transform: scale(1)    translateY(0); }
}

.lc-modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid #f1f5f9;
}
.lc-modal-title { font-size: 15px; font-weight: 600; color: #0f172a; }
.lc-modal-close {
  width: 28px; height: 28px; border-radius: 6px; border: none;
  background: #f1f5f9; color: #64748b; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .12s;
}
.lc-modal-close:hover { background: #e2e8f0; color: #0f172a; }
.lc-modal-body  { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.lc-modal-footer {
  padding: 14px 20px; border-top: 1px solid #f1f5f9;
  display: flex; justify-content: flex-end; gap: 8px;
}

/* Fields */
.field       { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.field-row   { display: flex; gap: 12px; }
.field-label { font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: .05em; }
.req         { color: #dc2626; }
.field-input {
  padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px;
  font-size: 13px; font-family: 'DM Sans', sans-serif; color: #334155;
  outline: none; transition: border-color 0.12s; background: #ffffff; width: 100%;
  box-sizing: border-box;
}
.field-input:focus { border-color: #6366f1; }
.mono-input { font-family: 'DM Mono', monospace; letter-spacing: .02em; }
.field-hint  { font-size: 11px; color: #94a3b8; }
.field-error { font-size: 11.5px; color: #dc2626; }

/* Assign */
.assign-sensor-info {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; background: #f8fafc; border-radius: 8px;
  border: 1px solid #f1f5f9;
}
.assign-label { font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: .05em; }
</style>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.app-layout {
  display: flex; min-height: 100vh;
  background: #f6f7fb; font-family: 'DM Sans', sans-serif; color: #1e293b;
}

.page {
  flex: 1; padding: 20px 16px 40px;
  display: flex; flex-direction: column; gap: 16px; overflow-x: hidden;
}

/* Topbar */
.topbar { display: flex; flex-direction: column; gap: 10px; }
.topbar-date  { font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
.topbar-title { font-size: 22px; font-weight: 600; letter-spacing: -.025em; color: #0f172a; }
.topbar-title .accent { color: #6366f1; }
.topbar-right { display: flex; align-items: center; gap: 10px; }

.btn-register {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; border: none; border-radius: 8px;
  background: #6366f1; color: #ffffff;
  font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 600;
  cursor: pointer; transition: background .15s;
}
.btn-register:hover { background: #4f46e5; }

/* Summary */
.summary-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.summary-card {
  background: #fff; border: 1px solid #f1f5f9; border-radius: 14px;
  padding: 14px 16px; display: flex; align-items: center; gap: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04); animation: fadeUp .35s ease both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.summary-icon {
  width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.summary-val   { font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -.03em; line-height: 1; margin-bottom: 3px; }
.summary-label { font-size: 11px; color: #94a3b8; }

/* Panel */
.panel {
  background: #fff; border: 1px solid #f1f5f9;
  border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.04); overflow: hidden;
}
.panel-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 16px 12px; border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap; gap: 10px;
}
.panel-title { font-size: 13.5px; font-weight: 600; color: #0f172a; display: flex; align-items: center; gap: 8px; }
.panel-sub { font-size: 11.5px; color: #64748b; margin-top: 4px; }
.head-right { display: flex; align-items: center; gap: 8px; }
.filter-select {
  padding: 6px 10px; border: 1px solid #e2e8f0; border-radius: 6px;
  background: #ffffff; font-size: 12px;
  font-family: 'DM Sans', sans-serif; color: #475569;
  outline: none; cursor: pointer; transition: border-color 0.12s;
}
.filter-select:focus { border-color: #6366f1; }
.inv-badge {
  font-size: 11px; font-weight: 500;
  padding: 2px 8px; border-radius: 4px;
  background: #eef2ff; color: #6366f1;
  border: 1px solid #c7d2fe;
  font-family: 'DM Mono', monospace;
}

/* Table */
.table-wrap { overflow-x: auto; }
.lc-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.lc-table thead th {
  padding: 9px 14px; text-align: left;
  font-size: 10.5px; font-weight: 600; color: #64748b;
  text-transform: uppercase; letter-spacing: .05em;
  border-bottom: 1px solid #e2e8f0; white-space: nowrap;
  background: #ffffff; position: sticky; top: 0; z-index: 1;
}
.col-no     { width: 36px; }
.col-num    { text-align: right !important; }
.col-actions{ width: 160px; text-align: center !important; }

.table-row { border-bottom: 1px solid #f1f5f9; transition: background .1s; }
.table-row:hover { background: #fafbff; }
.table-row.row-offline { opacity: .7; }
.table-row:last-child { border-bottom: none; }

.lc-table tbody td { padding: 12px 14px; vertical-align: middle; }
.td-muted   { color: #cbd5e1; font-family: 'DM Mono', monospace; font-size: 11px; }
.td-mono    { font-family: 'DM Mono', monospace; font-size: 12px; }
.td-empty   { text-align: center; padding: 40px !important; color: #cbd5e1; font-size: 13px; }

.empty-state {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
}
.empty-hint { font-size: 12px; color: #94a3b8; }

/* UID chip */
.uid-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 8px; border-radius: 5px;
  background: #eef2ff; border: 1px solid #c7d2fe;
  font-family: 'DM Mono', monospace; font-size: 11.5px; color: #4338ca;
  white-space: nowrap;
}

/* Variant chip */
.variant-chip {
  font-size: 12px; font-weight: 500; color: #334155;
  padding: 3px 8px; border-radius: 4px;
  background: #f8fafc; border: 1px solid #e2e8f0;
  white-space: nowrap;
}

/* Status */
.status-indicator { display: inline-flex; align-items: center; gap: 6px; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; background: #cbd5e1; display: inline-block; }
.status-text { font-size: 12px; font-weight: 500; color: #475569; }
.st-active .status-dot  { background: #10b981; }
.st-active .status-text { color: #15803d; }
.st-unassigned .status-dot  { background: #f59e0b; }
.st-unassigned .status-text { color: #b45309; }
.st-inactive .status-dot  { background: #ef4444; }
.st-inactive .status-text { color: #b91c1c; }

/* Offline override for active sensors that stopped reporting */
.row-offline .st-active .status-dot { background: #ef4444; animation: pulse 1.4s ease infinite; }
.row-offline .st-active .status-text { color: #b91c1c; }
@keyframes pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,.5); }
  50%     { box-shadow: 0 0 0 4px rgba(239,68,68,0); }
}

/* Qty */
.qty-wrap     { display: inline-flex; align-items: baseline; gap: 2px; }
.qty-val      { font-family: 'DM Mono', monospace; font-size: 12.5px; font-weight: 500; color: #334155; }
.qty-val.qty-low { color: #b45309; }
.qty-val.qty-out { color: #dc2626; }
.qty-threshold { font-size: 10.5px; color: #94a3b8; }

/* Last seen */
.last-seen { font-size: 12px; color: #64748b; }
.last-seen.offline { color: #dc2626; font-weight: 600; }

/* Actions */
.action-group { display: flex; justify-content: center; gap: 4px; }
.action-btn {
  width: 26px; height: 26px; border-radius: 6px;
  border: 1px solid #e2e8f0; background: #ffffff;
  color: #64748b; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .12s;
}
.action-btn:hover { border-color: #0f172a; color: #0f172a; }
.action-btn.danger:hover { border-color: #dc2626; color: #dc2626; background: #fef2f2; }
.action-btn.assign:hover { border-color: #6366f1; color: #6366f1; background: #eef2ff; }
.action-btn.unassign:hover { border-color: #f59e0b; color: #f59e0b; background: #fffbeb; }

/* Log panel */
.log-panel { margin-top: 0; }
.log-table-wrap { max-height: 360px; overflow-y: auto; }
.btn-close-log {
  width: 28px; height: 28px; border-radius: 6px; border: 1px solid #e2e8f0;
  background: #fff; color: #64748b; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all .12s;
}
.btn-close-log:hover { border-color: #0f172a; color: #0f172a; }

.slide-enter-active, .slide-leave-active { transition: all .25s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(12px); }

/* Modals are styled globally to support Teleport */

/* Confirm Modal */
.confirm-modal {
  background: #ffffff; border-radius: 12px;
  width: 100%; max-width: 380px;
  padding: 24px 24px 20px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
  display: flex; flex-direction: column; align-items: center;
  text-align: center; gap: 12px;
  animation: popIn .18s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid #e2e8f0;
}
.confirm-icon-wrap {
  width: 40px; height: 40px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 2px;
}
.icon-danger { background: #fef2f2; color: #dc2626; }
.icon-warn   { background: #fffbeb; color: #f59e0b; }
.confirm-title { font-size: 16px; font-weight: 600; color: #0f172a; }
.confirm-sub   { font-size: 13px; color: #64748b; line-height: 1.5; }
.confirm-btns  { display: flex; gap: 8px; margin-top: 8px; }

/* Buttons */
.btn-ghost {
  padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 6px;
  background: #ffffff; font-size: 13px; font-family: 'DM Sans', sans-serif;
  font-weight: 500; color: #64748b; cursor: pointer; transition: all .12s;
}
.btn-ghost:hover { background: #f8fafc; border-color: #cbd5e1; color: #334155; }
.btn-primary {
  padding: 8px 18px; border: none; border-radius: 6px;
  background: #6366f1; color: #ffffff;
  font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 500;
  cursor: pointer; transition: background .12s;
}
.btn-primary:hover { background: #4f46e5; }
.btn-primary:disabled { opacity: .45; cursor: not-allowed; }
.btn-danger {
  padding: 8px 16px; border: none; border-radius: 6px;
  background: #dc2626; color: #ffffff;
  font-size: 13px; font-family: 'DM Sans', sans-serif;
  font-weight: 500; cursor: pointer; transition: background .12s;
}
.btn-danger:hover { background: #b91c1c; }

/* Toast */
.toast {
  position: fixed; bottom: 16px; left: 16px; right: 16px;
  display: flex; align-items: center; gap: 10px;
  background: #1e293b; color: #fff;
  padding: 13px 16px; border-radius: 12px;
  font-size: 13px; font-weight: 500;
  box-shadow: 0 8px 24px rgba(0,0,0,.18); z-index: 99999;
}
.toast-enter-active, .toast-leave-active { transition: all .25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }

/* ── Responsive ── */
@media (min-width: 600px) {
  .page { padding: 24px 24px 44px; gap: 18px; }
  .topbar { flex-direction: row; align-items: flex-end; justify-content: space-between; }
  .topbar-title { font-size: 24px; }
  .summary-row { gap: 12px; }
  .summary-card { padding: 16px 18px; gap: 14px; }
  .summary-icon { width: 42px; height: 42px; border-radius: 11px; }
  .summary-val { font-size: 24px; }
  .summary-label { font-size: 12px; }
  .toast { left: auto; right: 20px; width: auto; }
}

@media (min-width: 900px) {
  .page { padding: 32px 36px 48px; gap: 20px; }
  .topbar-title { font-size: 26px; }
  .summary-row { grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .summary-card { padding: 18px 20px; }
  .summary-val { font-size: 26px; }
  .toast { bottom: 28px; right: 28px; }
}
</style>
