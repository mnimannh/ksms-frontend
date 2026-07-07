<template>
  <div class="app-layout">
    <AdminSidebar />

    <main class="page">

      <div class="topbar">
        <div class="topbar-left">
          <p class="topbar-date">{{ today }}</p>
          <div class="title-wrap">
            <h1 class="topbar-title">Load Cell <span class="accent">Management</span></h1>
            <span v-if="isPolling" class="live-indicator"><span class="live-dot"></span> Live</span>
          </div>
        </div>
        <div class="topbar-right">
          <button class="btn-ghost" @click="showGuide = !showGuide">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            Setup Guide
          </button>
          <button class="btn-register" @click="openModal('add')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Register Sensor
          </button>
        </div>
      </div>

      <!-- Setup Guide Banner -->
      <transition name="slide">
        <div class="setup-guide" v-if="showGuide">
          <div class="guide-header" @click="showGuide = false">
            <div class="guide-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              How to setup a Load Cell
            </div>
            <button class="btn-close-guide">✕</button>
          </div>
          <div class="guide-steps">
            <div class="step">
              <div class="step-num">1</div>
              <p><strong>Set Unit Weight</strong><br/>Go to Inventory and edit a variant. Set its 'Unit Weight (g)' and 'Threshold'.</p>
            </div>
            <div class="step">
              <div class="step-num">2</div>
              <p><strong>Register Sensor</strong><br/>Click 'Register Sensor' here. Enter the UID (e.g. <code>ESP32-LC-01</code>) and Empty Weight.</p>
            </div>
            <div class="step">
              <div class="step-num">3</div>
              <p><strong>Assign & Power On</strong><br/>Click the link icon in the table to assign a variant, then power on the ESP32.</p>
            </div>
          </div>
        </div>
      </transition>

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
                <th class="col-num">Unit Weight</th>
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
                <td class="col-num td-mono">
                  <span v-if="lc.variant_unit_weight">{{ Number(lc.variant_unit_weight).toFixed(2) }}g</span>
                  <span v-else-if="lc.unit_weight">{{ Number(lc.unit_weight).toFixed(2) }}g</span>
                  <span v-else class="td-muted">—</span>
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
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal-container">
          <header class="modal-header">
            <div class="modal-title-group">
              <span class="modal-eyebrow">{{ modalMode === 'edit' ? 'Edit' : 'New' }} Sensor</span>
              <h2>{{ modalMode === 'edit' ? 'Edit Sensor' : 'Register Sensor' }}</h2>
            </div>
            <button class="close-btn" @click="showModal = false">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </button>
          </header>
          
          <form @submit.prevent="submitSensor" class="modal-form">
            <div class="form-row">
              <div class="form-group">
                <label>Sensor UID</label>
                <input v-model="form.sensor_uid" type="text" class="input-uppercase" placeholder="E.G. LC-001 OR ESP32-A4B2C1" maxlength="100" required @input="form.sensor_uid = form.sensor_uid.toUpperCase()" />
                <p v-if="formErrors.sensor_uid" class="field-error">{{ formErrors.sensor_uid }}</p>
              </div>
            </div>
            <div class="form-row two-col">
              <div class="form-group">
                <label>Empty Weight (g)</label>
                <input v-model.number="form.empty_weight" type="number" min="0" step="0.01" placeholder="0" class="input-normal" />
                <span class="field-hint">Weight of empty container</span>
              </div>
              <div class="form-group">
                <label>Unit Weight (g)</label>
                <input v-model.number="form.unit_weight" type="number" min="0" step="0.01" placeholder="0.00" class="input-normal" required />
                <span class="field-hint">Weight of single unit</span>
                <p v-if="formErrors.unit_weight" class="field-error">{{ formErrors.unit_weight }}</p>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Calibration Factor</label>
                <input v-model.number="form.calibration_factor" type="number" step="0.0001" placeholder="e.g. 2038.5" class="input-normal" />
                <span class="field-hint">Hardware-specific calibration (optional)</span>
              </div>
            </div>
            <div class="form-row" v-if="modalMode === 'add'">
              <div class="form-group">
                <label>Assign to Variant (optional)</label>
                <div class="select-wrapper">
                  <select v-model="form.assign_variant_id">
                    <option :value="null">Do not assign yet</option>
                    <option v-for="v in availableVariants" :key="v.id" :value="v.id">
                      {{ v.product_name }} · {{ v.variant_name }}
                    </option>
                  </select>
                  <svg class="select-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <div class="form-divider"></div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="showModal = false">Cancel</button>
              <button type="submit" class="btn-save">
                {{ modalMode === 'edit' ? 'Save Changes' : 'Register Sensor' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Assign Modal -->
    <Teleport to="body">
      <div v-if="showAssignModal" class="modal-overlay" @click.self="showAssignModal = false">
        <div class="modal-container">
          <header class="modal-header">
            <div class="modal-title-group">
              <span class="modal-eyebrow">ASSIGN SENSOR</span>
              <h2>Assign to Variant</h2>
            </div>
            <button class="close-btn" @click="showAssignModal = false">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </button>
          </header>
          
          <form @submit.prevent="doAssign" class="modal-form">
            <div class="assign-sensor-info">
              <span class="assign-label">Sensor</span>
              <span class="uid-chip">{{ assignTarget?.sensor_uid }}</span>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Select Variant</label>
                <div class="select-wrapper">
                  <select v-model="assignVariantId" required>
                    <option :value="null" disabled>Choose a variant…</option>
                    <option v-for="v in availableVariants" :key="v.id" :value="v.id">
                      {{ v.product_name }} · {{ v.variant_name }} ({{ v.barcode }})
                    </option>
                  </select>
                  <svg class="select-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <div v-if="selectedAssignVariant" class="assign-variant-details" style="margin-top:-6px; margin-bottom:18px;">
              <div class="avd-row">
                <span class="avd-label">Unit Weight:</span>
                <span class="avd-val" :class="{'avd-err': !selectedAssignVariant.unit_weight}">
                  {{ selectedAssignVariant.unit_weight ? selectedAssignVariant.unit_weight + 'g' : 'Not set!' }}
                </span>
              </div>
              <div class="avd-row">
                <span class="avd-label">Threshold:</span>
                <span class="avd-val">{{ selectedAssignVariant.threshold || '0' }} units</span>
              </div>
              <p v-if="!selectedAssignVariant.unit_weight" class="field-hint" style="color:#ef4444; margin-top:6px;">
                ⚠️ This variant has no unit weight. Quantity calculation will not work. Please set it in Inventory first, or use the sensor's fallback unit weight.
              </p>
            </div>
            
            <p v-if="availableVariants.length === 0" class="field-hint" style="color:#f59e0b; margin-bottom:18px;">No variants available — all are already assigned to load cells</p>

            <div class="form-divider"></div>

            <div class="form-actions">
              <button type="button" class="btn-cancel" @click="showAssignModal = false">Cancel</button>
              <button type="submit" class="btn-save" :disabled="!assignVariantId">Assign</button>
            </div>
          </form>
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

      // State
      showGuide: false,
      isPolling: false,
      pollInterval: null,
    }
  },

  computed: {
    selectedAssignVariant() {
      if (!this.assignVariantId) return null;
      return this.availableVariants.find(v => v.id === this.assignVariantId);
    },
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

    startPolling() {
      this.isPolling = true;
      this.pollInterval = setInterval(async () => {
        if (document.visibilityState === 'visible') {
          await this.fetchLoadCells();
          if (this.showLogs && this.logSensor) {
            await this.refreshLogs();
          }
        }
      }, 5000); // 5 seconds
    },

    stopPolling() {
      this.isPolling = false;
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
        this.pollInterval = null;
      }
    },

    async fetchAvailableVariants() {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/load-cells/available-variants`)
        this.availableVariants = data
      } catch (e) { console.error(e) }
    },

    // ── Register / Edit Modal ───────────────────────────────────
    async openModal(mode, lc = null) {
      this.modalMode = mode
      this.modalTarget = lc
      this.formErrors = {}
      if (mode === 'edit' && lc) {
        this.form = {
          sensor_uid: lc.sensor_uid,
          empty_weight: lc.empty_weight || 0,
          unit_weight: lc.unit_weight || '',
          calibration_factor: lc.calibration_factor || '',
          assign_variant_id: null
        }
      } else {
        this.form = { sensor_uid: '', empty_weight: 0, unit_weight: '', calibration_factor: '', assign_variant_id: null }
        await this.fetchAvailableVariants()
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
          const res = await axios.post(`${API_BASE_URL}/api/load-cells`, this.form)
          if (this.form.assign_variant_id) {
            await axios.patch(`${API_BASE_URL}/api/load-cells/${res.data.id}/assign`, {
              variant_id: this.form.assign_variant_id
            })
            this.showToast('Sensor registered and assigned')
          } else {
            this.showToast('Sensor registered')
          }
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
    async refreshLogs() {
      if (!this.logSensor) return;
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/load-cells/${this.logSensor.id}/logs?limit=30`)
        this.logs = data
      } catch (e) { console.error(e) }
    },

    async viewLogs(lc) {
      this.logSensor = lc
      await this.refreshLogs()
      this.showLogs = true
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
    this.startPolling()
  },

  unmounted() {
    this.stopPolling()
  },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');

/* ── Modals ────────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(10, 12, 18, 0.45);
  backdrop-filter: blur(4px);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
  animation: fadeIn 0.15s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal-container {
  background: #fff; width: 460px;
  border-radius: 14px; overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06);
  animation: slideUp 0.2s cubic-bezier(0.34, 1.3, 0.64, 1);
  position: relative;
}
@keyframes slideUp {
  from { transform: translateY(16px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

/* Header */
.modal-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 24px 28px 20px;
  border-bottom: 1px solid #f3f4f6;
}
.modal-eyebrow {
  display: block; font-size: 10.5px; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: #9ca3af; margin-bottom: 3px;
}
.modal-header h2 { font-size: 18px; font-weight: 600; color: #111827; margin: 0; letter-spacing: -0.02em; }
.close-btn {
  background: #f3f4f6; border: none; width: 30px; height: 30px;
  border-radius: 50%; cursor: pointer; display: flex;
  align-items: center; justify-content: center;
  color: #6b7280; flex-shrink: 0; margin-top: 2px;
  transition: background 0.15s, color 0.15s;
}
.close-btn:hover { background: #e5e7eb; color: #111827; }

/* Form */
.modal-form { padding: 24px 28px; }
.form-row { margin-bottom: 18px; }
.form-row.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
label { font-size: 12px; font-weight: 600; color: #374151; letter-spacing: 0.02em; }

input[type="text"], input[type="number"] {
  font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: #111827;
  background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;
  padding: 9px 13px; outline: none; width: 100%; box-sizing: border-box;
  transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
}
input[type="text"]:focus, input[type="number"]:focus {
  border-color: #111827; background: #fff;
  box-shadow: 0 0 0 3px rgba(17,24,39,0.07);
}
input::placeholder { color: #c4c9d4; }
.input-uppercase { text-transform: uppercase; font-family: 'DM Mono', monospace !important; }

/* Select */
.select-wrapper { position: relative; }
select {
  font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: #111827;
  background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;
  padding: 9px 36px 9px 13px; outline: none; width: 100%;
  appearance: none; cursor: pointer; transition: border-color 0.18s; box-sizing: border-box;
}
select:focus { border-color: #111827; background: #fff; box-shadow: 0 0 0 3px rgba(17,24,39,0.07); }
.select-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #9ca3af; }

.field-hint { font-size: 11px; color: #9ca3af; font-weight: 400; margin-top: 2px; }
.field-error { font-size: 11.5px; color: #dc2626; margin-top: 2px;}
.form-divider { height: 1px; background: #f3f4f6; margin: 20px 0; }
.form-actions { display: flex; justify-content: flex-end; gap: 10px; }
.btn-cancel {
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
  color: #6b7280; background: #f3f4f6; border: none;
  padding: 9px 18px; border-radius: 8px; cursor: pointer; transition: background 0.15s;
}
.btn-cancel:hover { background: #e5e7eb; color: #374151; }
.btn-save {
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
  color: #fff; background: #10b981; border: none;
  padding: 9px 20px; border-radius: 8px; cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  transition: background 0.15s, transform 0.12s;
}
.btn-save:hover:not(:disabled) { background: #059669; transform: translateY(-1px); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }

/* Assign Info */
.assign-sensor-info {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; background: #f8fafc; border-radius: 8px;
  border: 1px solid #e5e7eb; margin-bottom: 18px;
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

/* Setup Guide */
.setup-guide {
  background: #fff; border: 1px solid #c7d2fe; border-radius: 12px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08); overflow: hidden;
  margin-bottom: 6px;
}
.guide-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: #eef2ff; cursor: pointer;
}
.guide-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 600; color: #4338ca;
}
.btn-close-guide {
  background: transparent; border: none; color: #6366f1;
  font-size: 16px; cursor: pointer; padding: 4px;
}
.guide-steps {
  display: grid; grid-template-columns: repeat(1, 1fr); gap: 16px;
  padding: 16px;
}
.step {
  display: flex; gap: 12px; align-items: flex-start;
}
.step-num {
  width: 24px; height: 24px; border-radius: 50%;
  background: #6366f1; color: #fff; font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.step p { font-size: 13px; color: #475569; line-height: 1.5; margin: 0; }
.step p strong { color: #1e293b; }
.step p code { background: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-family: monospace; }

/* Live indicator */
.title-wrap { display: flex; align-items: center; gap: 12px; }
.live-indicator {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 8px; border-radius: 6px;
  background: #f0fdf4; border: 1px solid #bbf7d0;
  font-size: 11px; font-weight: 600; color: #16a34a;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.live-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #16a34a; animation: blink 1.5s infinite;
}
@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }

/* Assign Variant Details */
.assign-variant-details {
  margin-top: 8px; padding: 12px; background: #f8fafc;
  border-radius: 8px; border: 1px solid #e2e8f0;
}
.avd-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 12.5px; padding: 4px 0;
}
.avd-label { color: #64748b; }
.avd-val { font-weight: 600; color: #334155; }
.avd-val.avd-err { color: #ef4444; }

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
  .guide-steps { grid-template-columns: repeat(3, 1fr); }
}
</style>
