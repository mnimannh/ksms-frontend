<template>
  <div class="swap-manager-panel">
    <!-- Panel Header Controls -->
    <div class="swap-panel-header">
      <div>
        <h3 class="panel-section-title">Teammate Shift Exchange Protocols</h3>
        <p class="panel-section-sub">Review, track, and authorize shift trades across your team.</p>
      </div>
      <button class="btn-panel-close" @click="$emit('close')">✕</button>
    </div>

    <!-- Filter Bar: Tabs & Month Picker -->
    <div class="swap-filter-bar">
      <div class="swap-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="swap-tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
          <span v-if="tab.id === 'pending_admin' && pendingAdminCount > 0" class="tab-badge">
            {{ pendingAdminCount }}
          </span>
        </button>
      </div>

      <div class="swap-month-picker">
        <label for="swap-month">Shift Month:</label>
        <input 
          id="swap-month"
          type="month" 
          v-model="monthFilter" 
          class="month-input"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="swap-panel-loader">
      <span class="spinner"></span> Polling systemic trade registries...
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredSwaps.length === 0" class="swap-panel-empty">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
      </svg>
      <p>No shift trade distributions found matching these operational criteria.</p>
    </div>

    <!-- Request Cards Feed List -->
    <div v-else class="swap-cards-grid">
      <div 
        v-for="request in filteredSwaps" 
        :key="request.id" 
        class="swap-flow-card"
        :class="{ 'card-archived': activeTab === 'archived' }"
      >
        <div class="swap-card-top">
          <span class="swap-time-stamp">Requested {{ formatRelativeTime(request.created_at) }}</span>
          <span :class="getStatusClass(request)">{{ formatStatusLabel(request) }}</span>
        </div>

        <div class="swap-exchange-wrapper">
          <!-- Requester Profile Block -->
          <div class="exchange-profile-box">
            <span class="profile-role-tag">Requester</span>
            <p class="profile-user-name">{{ request.requester_name }}</p>
            <div class="profile-shift-details" :class="request.shift_type?.toLowerCase()">
              <span class="shift-type-pill">{{ request.shift_type }}</span>
              <p class="shift-time-text">{{ formatShiftTime(request.shift_start, request.shift_end) }}</p>
            </div>
          </div>

          <div class="exchange-direction-indicator">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M17 1l4 4-4 4M21 5H9M7 23l-4-4 4-4M3 19h12"/>
            </svg>
          </div>

          <!-- Target Profile Block -->
          <div class="exchange-profile-box">
            <span class="profile-role-tag">Target Teammate</span>
            <p class="profile-user-name">{{ request.target_name }}</p>
            <div class="profile-shift-details" :class="request.target_shift_type?.toLowerCase() || 'dropped'">
              <span class="shift-type-pill">{{ request.target_shift_type || 'Drop Shift' }}</span>
              <p class="shift-time-text">
                {{ request.target_shift_id ? formatShiftTime(request.target_shift_start, request.target_shift_end) : 'Giving away shift completely' }}
              </p>
            </div>
          </div>
        </div>

        <!-- System Actions Block (Conditionally Rendered by Active Status Tab Context) -->
        <div class="swap-card-actions" v-if="activeTab === 'pending_admin'">
          <input 
            type="text" 
            v-model="swapNotes[request.id]" 
            placeholder="Provide an internal administration note (optional)..." 
            class="swap-note-input"
          />
          <div class="swap-action-buttons">
            <button class="btn-swap-deny" :disabled="submitting" @click="submitAction(request.id, 'reject')">
              Deny Trade
            </button>
            <button class="btn-swap-approve" :disabled="submitting" @click="submitAction(request.id, 'approve')">
              Approve & Update Schedule
            </button>
          </div>
        </div>

        <!-- Archival Audit Logs Note Output View -->
        <div class="swap-card-audit-note" v-else-if="request.admin_notes || request.staff_notes">
          <p v-if="request.staff_notes"><strong>Staff Note:</strong> "{{ request.staff_notes }}"</p>
          <p v-if="request.admin_notes"><strong>Admin Log Note:</strong> "{{ request.admin_notes }}"</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import API_BASE_URL from '@/services/api.js';

function authFetch(url, options = {}) {
  const token = localStorage.getItem('userToken') || localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
  return fetch(url, { ...options, headers });
}

export default {
  name: 'AdminSwapManager',
  emits: ['close', 'refresh-schedule'],
  data() {
    return {
      activeTab: 'pending_admin',
      monthFilter: new Date().toISOString().slice(0, 7), // Format: YYYY-MM
      swapRequests: [],
      swapNotes: {},
      loading: false,
      submitting: false,
      tabs: [
        { id: 'pending_admin',     label: 'Pending Admin' },
        { id: 'staff_processing',  label: 'Staff Pipeline' },
        { id: 'archived',          label: 'Archive History' }
      ]
    };
  },
  computed: {
    pendingAdminCount() {
      return this.swapRequests.filter(r => r.status === 'approved_by_staff').length;
    },
    filteredSwaps() {
      return this.swapRequests.filter(request => {
        // 1. Structural Lifecycle Filter Map Stage
        if (this.activeTab === 'pending_admin') {
          if (request.status !== 'approved_by_staff') return false;
        } else if (this.activeTab === 'staff_processing') {
          if (request.status !== 'pending_staff') return false;
        } else if (this.activeTab === 'archived') {
          const finishedStates = ['approved', 'rejected', 'declined', 'cancelled'];
          if (!finishedStates.includes(request.status)) return false;
        }

        // 2. Month Selector Filter Map Stage (Evaluates based on start time of the target shift)
        if (!request.shift_start) return false;
        return request.shift_start.startsWith(this.monthFilter);
      });
    }
  },
  async created() {
    await this.fetchSwaps();
  },
  methods: {
    async fetchSwaps() {
      this.loading = true;
      try {
        // Pulls all raw data from your centralized trade state endpoint
        const res = await authFetch(`${API_BASE_URL}/api/swaps/admin-all`);
        if (!res.ok) throw new Error("Could not parse comprehensive swap array registries.");
        this.swapRequests = await res.json();
      } catch (err) {
        console.error("Error matching backend swap models:", err);
      } finally {
        this.loading = false;
      }
    },
    async submitAction(requestId, actionType) {
      const note = this.swapNotes[requestId] || '';
      const confirmMsg = `Are you sure you want to ${actionType} this shift exchange request?`;
      if (!confirm(confirmMsg)) return;

      this.submitting = true;
      try {
        const res = await authFetch(`${API_BASE_URL}/api/swaps/${requestId}/${actionType}`, {
          method: 'PATCH',
          body: JSON.stringify({ adminNote: note })
        });

        if (!res.ok) throw new Error(`Failed execution during backend authorization updates.`);
        
        delete this.swapNotes[requestId];
        await this.fetchSwaps();
        this.$emit('refresh-schedule'); // Alerts parent to run fetchAll() to update structural logs/calendars
      } catch (err) {
        alert(err.message);
      } finally {
        this.submitting = false;
      }
    },
    getStatusClass(r) {
      return {
        'status-pill-pending': r.status === 'pending_staff',
        'status-pill-accepted': r.status === 'approved_by_staff',
        'status-pill-approved': r.status === 'approved',
        'status-pill-denied': r.status === 'rejected' || r.status === 'declined',
        'status-pill-cancelled': r.status === 'cancelled'
      };
    },
    formatStatusLabel(r) {
      const maps = {
        'pending_staff': 'Awaiting Partner Accept',
        'approved_by_staff': 'Awaiting Admin Action',
        'approved': 'Approved & Executed',
        'rejected': 'Admin Denied',
        'declined': 'Partner Declined',
        'cancelled': 'Withdrawn by Staff'
      };
      return maps[r.status] || r.status;
    },
    formatRelativeTime(dateTimeStr) {
      const parsed = new Date(dateTimeStr);
      const diffMs = new Date() - parsed;
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return parsed.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' });
    },
    formatShiftTime(start, end) {
      if (!start) return '';
      const startDate = new Date(start).toLocaleDateString('en-MY', { weekday: 'short', month: 'short', day: 'numeric' });
      const startTime = new Date(start).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' });
      const endTime = new Date(end).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' });
      return `${startDate} (${startTime} - ${endTime})`;
    }
  }
};
</script>

<style scoped>
.swap-manager-panel {
  background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px;
  padding: 20px; margin-bottom: 22px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}
.swap-panel-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
.panel-section-title { font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 3px; }
.panel-section-sub { font-size: 12.5px; color: #64748b; }
.btn-panel-close { background: #f1f5f9; border: none; width: 24px; height: 24px; border-radius: 50%; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 10px; }
.btn-panel-close:hover { background: #e2e8f0; color: #0f172a; }

/* Filter Configuration Bar Styling */
.swap-filter-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 16px; flex-wrap: wrap; }
.swap-tabs { display: flex; gap: 6px; background: #f1f5f9; padding: 4px; border-radius: 8px; }
.swap-tab-btn { font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; border: none; background: transparent; color: #64748b; padding: 6px 12px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.15s; }
.swap-tab-btn.active { background: #ffffff; color: #0f172a; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }

.tab-badge { background: #ef4444; color: white; font-size: 10px; padding: 1px 5px; border-radius: 8px; font-family: monospace; }

.swap-month-picker { display: flex; align-items: center; gap: 8px; font-family: 'DM Sans', sans-serif; font-size: 12.5px; color: #475569; font-weight: 500; }
.month-input { border: 1px solid #e2e8f0; padding: 5px 10px; border-radius: 6px; font-family: inherit; font-size: 12.5px; color: #0f172a; outline: none; }
.month-input:focus { border-color: #6366f1; }

/* Structural Content Card Feeds */
.swap-panel-loader { padding: 40px; text-align: center; color: #64748b; font-size: 13px; font-family: 'DM Mono', monospace; }
.swap-panel-empty { padding: 40px; text-align: center; color: #94a3b8; font-size: 13.5px; display: flex; flex-direction: column; align-items: center; gap: 8px; }

.swap-cards-grid { display: flex; flex-direction: column; gap: 14px; }
.swap-flow-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }
.swap-flow-card.card-archived { opacity: 0.9; background: #fafafa; }

.swap-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.swap-time-stamp { font-family: 'DM Mono', monospace; font-size: 11px; color: #94a3b8; }

/* Status Pill Mapping Profiles */
[class^="status-pill-"] { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 6px; border: 1px solid; }
.status-pill-pending { background: #fef3c7; color: #d97706; border-color: #fde68a; }
.status-pill-accepted { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }
.status-pill-approved { background: #e0f2fe; color: #0369a1; border-color: #bae6fd; }
.status-pill-denied { background: #fef2f2; color: #b91c1c; border-color: #fca5a5; }
.status-pill-cancelled { background: #f1f5f9; color: #475569; border-color: #e2e8f0; }

.swap-exchange-wrapper { display: grid; grid-template-columns: 1fr auto 1fr; gap: 16px; align-items: center; background: #ffffff; padding: 14px; border-radius: 8px; border: 1px solid #f1f5f9; }
.exchange-profile-box { display: flex; flex-direction: column; }
.profile-role-tag { font-family: 'DM Mono', monospace; font-size: 10px; text-transform: uppercase; color: #94a3b8; margin-bottom: 2px; }
.profile-user-name { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 6px; }

.profile-shift-details { padding: 8px 10px; border-radius: 6px; display: flex; flex-direction: column; gap: 2px; }
.profile-shift-details.morning { background: #fffbeb; border-left: 3px solid #d97706; }
.profile-shift-details.evening { background: #f3e8ff; border-left: 3px solid #7c3aed; }
.profile-shift-details.dropped { background: #f1f5f9; border-left: 3px solid #94a3b8; }

.shift-type-pill { font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 700; color: #334155; }
.shift-time-text { font-size: 12px; color: #475569; font-weight: 500; }
.exchange-direction-indicator { color: #6366f1; background: #eef2ff; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

.swap-card-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.swap-note-input { font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0; outline: none; background: #ffffff; }
.swap-note-input:focus { border-color: #6366f1; }

.swap-action-buttons { display: flex; justify-content: flex-end; gap: 8px; }
.btn-swap-deny { font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 600; color: #dc2626; background: #fff; border: 1px solid #fca5a5; padding: 7px 14px; border-radius: 6px; cursor: pointer; }
.btn-swap-deny:hover:not(:disabled) { background: #fef2f2; }
.btn-swap-approve { font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 600; color: #ffffff; background: #16a34a; border: none; padding: 7px 16px; border-radius: 6px; cursor: pointer; }
.btn-swap-approve:hover:not(:disabled) { background: #15803d; }
button:disabled { opacity: 0.5; cursor: not-allowed; }

.swap-card-audit-note { margin-top: 12px; padding: 10px; background: #ffffff; border-radius: 6px; border: 1px dashed #e2e8f0; font-size: 12px; color: #475569; display: flex; flex-direction: column; gap: 4px; }
</style>