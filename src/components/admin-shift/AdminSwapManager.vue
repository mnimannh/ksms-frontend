<template>
  <div class="swap-manager-panel">
    <div class="swap-panel-header">
      <div>
        <h3 class="panel-section-title">Teammate Shift Exchange Protocols</h3>
        <p class="panel-section-sub">Review, track, and authorize shift trades across your team.</p>
      </div>
      <button class="btn-panel-close" @click.prevent="$emit('close')">✕</button>
    </div>

    <div class="swap-filter-bar">
      <div class="swap-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          class="swap-tab-btn"
          :class="{ active: activeTab === tab.id }"
          @click.prevent="changeTab(tab.id)"
        >
          {{ tab.label }}
          <span v-if="tab.id === 'pending_admin' && pendingAdminCount > 0" class="tab-badge">
            {{ pendingAdminCount }}
          </span>
        </button>
      </div>

      <div class="swap-month-picker-container">
        <label for="swap-month" class="picker-label">Shift Month:</label>
        <div class="custom-month-wrapper">
          <input 
            id="swap-month"
            type="month" 
            v-model="monthFilter" 
            @change="currentPage = 1"
            class="month-input-modern"
          />
          <span class="calendar-custom-icon">📅</span>
        </div>
      </div>
    </div>

    <div v-if="loading" class="swap-panel-loader">
      <span class="spinner"></span> Polling systemic trade registries...
    </div>

    <div v-else-if="filteredSwaps.length === 0" class="swap-panel-empty">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
      </svg>
      <p>No shift trade distributions found matching these operational criteria.</p>
    </div>

    <div v-else class="swap-cards-grid">
      <div 
        v-for="request in paginatedSwaps" 
        :key="request.id" 
        class="swap-flow-card"
        :class="{ 'card-archived': activeTab === 'archived', 'card-collapsed': !isExpanded(request.id) }"
      >
        <div class="swap-card-top" @click="toggleExpand(request.id)">
          <div class="top-left-meta">
            <span class="toggle-arrow" :class="{ 'arrow-rotated': isExpanded(request.id) }">▼</span>
            <span class="swap-time-stamp">Requested {{ formatRelativeTime(request.created_at) }}</span>
            
            <span v-if="!isExpanded(request.id)" class="collapsed-preview-summary">
              <strong>{{ request.requester_name }}</strong> ⇄ <strong>{{ request.target_name }}</strong>
            </span>
          </div>
          <span :class="getStatusClass(request)">{{ formatStatusLabel(request) }}</span>
        </div>

        <div v-show="isExpanded(request.id)" class="collapsible-card-body">
          <div class="swap-exchange-wrapper">
            <div class="exchange-profile-box">
              <span class="profile-role-tag">Requester</span>
              <p class="profile-user-name">{{ request.requester_name }}</p>
              <div class="profile-shift-details" :class="request.shift_type?.toLowerCase()">
                <span class="shift-type-pill">{{ request.shift_type }}</span>
                <p class="shift-time-text">{{ formatShiftTime(request.shift_start, request.shift_end) }}</p>
              </div>
            </div>

            <div class="exchange-direction-indicator">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M17 1l4 4-4 4M21 5H9M7 23l-4-4 4-4M3 19h12"/>
              </svg>
            </div>

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

          <div class="swap-card-actions" v-if="activeTab === 'pending_admin'">
            <template v-if="!confirmingAction || confirmingAction.requestId !== request.id">
              <input 
                type="text" 
                v-model="swapNotes[request.id]" 
                placeholder="Provide an internal administration note (optional)..." 
                class="swap-note-input"
              />
              <div class="swap-action-buttons">
                <button type="button" class="btn-swap-deny" :disabled="submitting" @click.prevent="promptConfirmation(request.id, 'reject')">
                  Deny Trade
                </button>
                <button type="button" class="btn-swap-approve" :disabled="submitting" @click.prevent="promptConfirmation(request.id, 'approve')">
                  Approve & Update Schedule
                </button>
              </div>
            </template>

            <template v-else>
              <div class="swap-inline-confirm-box" :class="'confirm-' + confirmingAction.actionType">
                <p class="confirm-message">
                  Are you sure you want to <strong>{{ confirmingAction.actionType === 'approve' ? 'APPROVE' : 'DENY' }}</strong> this shift trade?
                </p>
                <div class="swap-action-buttons">
                  <button type="button" class="btn-confirm-cancel" :disabled="submitting" @click.prevent="cancelConfirmation">
                    Cancel
                  </button>
                  <button 
                    type="button"
                    :class="confirmingAction.actionType === 'approve' ? 'btn-swap-approve' : 'btn-swap-deny-filled'" 
                    :disabled="submitting" 
                    @click.prevent="submitAction"
                  >
                    <span v-if="submitting">Processing...</span>
                    <span v-else>Yes, Confirm {{ confirmingAction.actionType === 'approve' ? 'Approval' : 'Denial' }}</span>
                  </button>
                </div>
              </div>
            </template>
          </div>

          <div class="swap-card-audit-note" v-else-if="request.admin_notes || request.staff_notes">
            <p v-if="request.staff_notes"><strong>Staff Note:</strong> "{{ request.staff_notes }}"</p>
            <p v-if="request.admin_notes"><strong>Admin Log Note:</strong> "{{ request.admin_notes }}"</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="totalPages > 1 && !loading" class="swap-pagination-footer">
      <button 
        class="pagination-nav-btn" 
        :disabled="currentPage === 1" 
        @click.prevent="currentPage--"
      >
        Previous
      </button>
      <div class="pagination-pages-list">
        <button 
          v-for="page in totalPages" 
          :key="page"
          class="pagination-page-btn"
          :class="{ active: currentPage === page }"
          @click.prevent="currentPage = page"
        >
          {{ page }}
        </button>
      </div>
      <button 
        class="pagination-nav-btn" 
        :disabled="currentPage === totalPages" 
        @click.prevent="currentPage++"
      >
        Next
      </button>
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
      monthFilter: new Date().toISOString().slice(0, 7), // Format Framework: YYYY-MM
      swapRequests: [],
      swapNotes: {},
      expandedRequests: {}, // Layout View Control State Map object
      currentPage: 1,
      itemsPerPage: 5, // Compact density allocation metric
      loading: false,
      submitting: false,
      confirmingAction: null,
      tabs: [
        { id: 'pending_admin',    label: 'Pending Admin' },
        { id: 'staff_processing',  label: 'Staff Pipeline' },
        { id: 'archived',          label: 'Archive History' }
      ]
    };
  },
  computed: {
    pendingAdminCount() {
      return this.swapRequests.filter(r => r.status === 'accepted').length;
    },
    filteredSwaps() {
      return this.swapRequests.filter(request => {
        if (this.activeTab === 'pending_admin') {
          if (request.status !== 'accepted') return false;
        } else if (this.activeTab === 'staff_processing') {
          if (request.status !== 'pending') return false;
        } else if (this.activeTab === 'archived') {
          const finishedStates = ['approved', 'rejected', 'declined', 'cancelled'];
          if (!finishedStates.includes(request.status)) return false;
        }

        if (!request.shift_start) return false;
        return request.shift_start.startsWith(this.monthFilter);
      });
    },
    totalPages() {
      return Math.ceil(this.filteredSwaps.length / this.itemsPerPage) || 1;
    },
    paginatedSwaps() {
      const startOffset = (this.currentPage - 1) * this.itemsPerPage;
      const endOffset = startOffset + this.itemsPerPage;
      return this.filteredSwaps.slice(startOffset, endOffset);
    }
  },
  watch: {
    // Whenever layout targets shift, auto-expand first item element to preserve visual focus cleanly
    filteredSwaps: {
      handler(newVal) {
        this.expandedRequests = {};
        if (newVal.length > 0) {
          this.$set ? this.$set(this.expandedRequests, newVal[0].id, true) : (this.expandedRequests[newVal[0].id] = true);
        }
      },
      immediate: true
    }
  },
  async created() {
    await this.fetchSwaps();
  },
  methods: {
    async fetchSwaps() {
      this.loading = true;
      try {
        const res = await authFetch(`${API_BASE_URL}/api/swaps/admin-all`);
        if (!res.ok) throw new Error("Could not parse comprehensive swap array registries.");
        this.swapRequests = await res.json();
      } catch (err) {
        console.error("Error matching backend swap models:", err);
      } finally {
        this.loading = false;
      }
    },
    changeTab(tabId) {
      this.activeTab = tabId;
      this.currentPage = 1;
    },
    toggleExpand(id) {
      if (this.expandedRequests[id]) {
        this.$set ? this.$set(this.expandedRequests, id, false) : (this.expandedRequests[id] = false);
      } else {
        this.$set ? this.$set(this.expandedRequests, id, true) : (this.expandedRequests[id] = true);
      }
    },
    isExpanded(id) {
      return this.expandedRequests[id] !== false; 
    },
    promptConfirmation(requestId, actionType) {
      this.confirmingAction = { requestId, actionType };
    },
    cancelConfirmation() {
      this.confirmingAction = null;
    },
    async submitAction() {
      if (!this.confirmingAction) return;

      const { requestId, actionType } = this.confirmingAction;
      const note = this.swapNotes[requestId] || '';

      this.submitting = true;
      try {
        const res = await authFetch(`${API_BASE_URL}/api/swaps/${requestId}/${actionType}`, {
          method: 'PATCH',
          body: JSON.stringify({ adminNote: note })
        });

        if (!res.ok) throw new Error(`Failed execution during backend authorization updates.`);
        
        delete this.swapNotes[requestId];
        this.confirmingAction = null; 
        await this.fetchSwaps();
        this.$emit('refresh-schedule'); 
      } catch (err) {
        alert(err.message);
      } finally {
        this.submitting = false;
      }
    },
    getStatusClass(r) {
      return {
        'status-pill-pending': r.status === 'pending',
        'status-pill-accepted': r.status === 'accepted',
        'status-pill-approved': r.status === 'approved',
        'status-pill-denied': r.status === 'rejected' || r.status === 'declined',
        'status-pill-cancelled': r.status === 'cancelled'
      };
    },
    formatStatusLabel(r) {
      const maps = {
        'pending': 'Awaiting Partner Accept',
        'accepted': 'Awaiting Admin Action',
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
  background: #ffffff; 
  border: 1px solid #e2e8f0; 
  border-radius: 12px;
  padding: 16px; 
  margin-bottom: 16px; 
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
}

.swap-panel-header { 
  display: flex; 
  justify-content: space-between; 
  align-items: flex-start; 
  margin-bottom: 14px; 
}

.panel-section-title { 
  font-size: 14px; 
  font-weight: 600; 
  color: #0f172a; 
  margin: 0 0 2px 0; 
}

.panel-section-sub { 
  font-size: 11.5px; 
  color: #64748b; 
  margin: 0; 
}

.btn-panel-close { 
  background: #f1f5f9; 
  border: none; 
  width: 22px; 
  height: 22px; 
  border-radius: 50%; 
  color: #64748b; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 9px; 
}

.btn-panel-close:hover { 
  background: #e2e8f0; 
  color: #0f172a; 
}

/* Tab Filter and Calendar Picker Bar Alignment */
.swap-filter-bar { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 14px; 
  gap: 12px; 
  flex-wrap: wrap; 
}

.swap-tabs { 
  display: flex; 
  gap: 4px; 
  background: #f1f5f9; 
  padding: 3px; 
  border-radius: 6px; 
}

.swap-tab-btn { 
  font-family: 'DM Sans', sans-serif; 
  font-size: 11.5px; 
  font-weight: 600; 
  border: none; 
  background: transparent; 
  color: #64748b; 
  padding: 5px 10px; 
  border-radius: 5px; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  gap: 4px; 
  transition: all 0.1s ease; 
}

.swap-tab-btn.active { 
  background: #ffffff; 
  color: #0f172a; 
  box-shadow: 0 1px 2px rgba(0,0,0,0.06); 
}

.tab-badge { 
  background: #ef4444; 
  color: white; 
  font-size: 9px; 
  padding: 1px 4px; 
  border-radius: 6px; 
}

/* Revamped Calendar / Month Picker Design System Component UI */
.swap-month-picker-container { 
  display: flex; 
  align-items: center; 
  gap: 8px; 
}

.picker-label { 
  font-family: 'DM Sans', sans-serif; 
  font-size: 12px; 
  color: #475569; 
  font-weight: 500; 
}

.custom-month-wrapper { 
  position: relative; 
  display: inline-block; 
}

.month-input-modern { 
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #1e293b;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 6px 32px 6px 12px; 
  border-radius: 6px;
  outline: none;
  cursor: pointer;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);
  transition: border-color 0.15s, box-shadow 0.15s;
  appearance: none; 
  -webkit-appearance: none;
}

.month-input-modern:focus { 
  border-color: #3b82f6; 
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.calendar-custom-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  pointer-events: none; 
  color: #64748b;
}

/* Fallback states UI templates placement */
.swap-panel-loader { 
  padding: 30px; 
  text-align: center; 
  color: #64748b; 
  font-size: 12px; 
}

.swap-panel-empty { 
  padding: 30px; 
  text-align: center; 
  color: #94a3b8; 
  font-size: 12.5px; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  gap: 6px; 
}

/* Grid & Data Card Structural Modules */
.swap-cards-grid { 
  display: flex; 
  flex-direction: column; 
  gap: 8px; 
}

.swap-flow-card { 
  background: #f8fafc; 
  border: 1px solid #e2e8f0; 
  border-radius: 8px; 
  padding: 12px 14px; 
  transition: background-color 0.2s, box-shadow 0.2s;
}

.swap-flow-card.card-collapsed {
  cursor: pointer;
}

.swap-flow-card.card-collapsed:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.swap-flow-card.card-archived { 
  opacity: 0.95; 
  background: #fafafa; 
}

.swap-card-top { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  user-select: none;
}

.top-left-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.toggle-arrow {
  font-size: 8px;
  color: #64748b;
  transition: transform 0.2s ease;
  transform: rotate(-90deg);
}

.toggle-arrow.arrow-rotated {
  transform: rotate(0deg);
}

.swap-time-stamp { 
  font-family: 'DM Mono', monospace; 
  font-size: 10.5px; 
  color: #94a3b8; 
  white-space: nowrap;
}

.collapsed-preview-summary {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  color: #334155;
  margin-left: 8px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}

.collapsible-card-body {
  margin-top: 10px;
  animation: slideDown 0.15s ease-out;
}

/* Status Badging Blocks UI metrics */
[class^="status-pill-"] { 
  font-size: 10px; 
  font-weight: 600; 
  padding: 2px 6px; 
  border-radius: 4px; 
  border: 1px solid; 
  white-space: nowrap;
}
.status-pill-pending { background: #fef3c7; color: #d97706; border-color: #fde68a; }
.status-pill-accepted { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }
.status-pill-approved { background: #e0f2fe; color: #0369a1; border-color: #bae6fd; }
.status-pill-denied { background: #fef2f2; color: #b91c1c; border-color: #fca5a5; }
.status-pill-cancelled { background: #f1f5f9; color: #475569; border-color: #e2e8f0; }

/* Grid Layout Framework Internal wrapper profiles */
.swap-exchange-wrapper { 
  display: grid; 
  grid-template-columns: 1fr auto 1fr; 
  gap: 12px; 
  align-items: center; 
  background: #ffffff; 
  padding: 10px 12px; 
  border-radius: 6px; 
  border: 1px solid #f1f5f9; 
}

.exchange-profile-box { display: flex; flex-direction: column; min-width: 0; }
.profile-role-tag { font-family: 'DM Mono', monospace; font-size: 9px; text-transform: uppercase; color: #94a3b8; margin-bottom: 2px; }
.profile-user-name { font-size: 13px; font-weight: 600; color: #0f172a; margin: 0 0 4px 0; text-overflow: ellipsis; overflow: hidden; }

.profile-shift-details { padding: 6px 8px; border-radius: 4px; display: flex; flex-direction: column; gap: 1px; }
.profile-shift-details.morning { background: #fffbeb; border-left: 3px solid #d97706; }
.profile-shift-details.evening { background: #f3e8ff; border-left: 3px solid #7c3aed; }
.profile-shift-details.dropped { background: #f1f5f9; border-left: 3px solid #94a3b8; }

.shift-type-pill { font-family: 'DM Mono', monospace; font-size: 9px; font-weight: 700; color: #334155; }
.shift-time-text { font-size: 11px; color: #475569; font-weight: 500; }
.exchange-direction-indicator { color: #6366f1; background: #eef2ff; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

/* Interactive Controls and Administration Input Block elements */
.swap-card-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
.swap-note-input { font-family: 'DM Sans', sans-serif; font-size: 12px; padding: 6px 10px; border-radius: 5px; border: 1px solid #e2e8f0; outline: none; background: #ffffff; }
.swap-note-input:focus { border-color: #6366f1; }

.swap-inline-confirm-box { padding: 10px; border-radius: 6px; display: flex; flex-direction: column; gap: 8px; }
.swap-inline-confirm-box.confirm-approve { background: #f0fdf4; border: 1px dashed #16a34a; }
.swap-inline-confirm-box.confirm-reject { background: #fef2f2; border: 1px dashed #dc2626; }
.confirm-message { font-family: 'DM Sans', sans-serif; font-size: 12px; color: #1e293b; margin: 0; }

.swap-action-buttons { display: flex; justify-content: flex-end; gap: 6px; }
.btn-confirm-cancel { font-family: 'DM Sans', sans-serif; font-size: 11.5px; font-weight: 500; color: #475569; background: #ffffff; border: 1px solid #cbd5e1; padding: 5px 10px; border-radius: 5px; cursor: pointer; }
.btn-confirm-cancel:hover:not(:disabled) { background: #f8fafc; }

.btn-swap-deny { font-family: 'DM Sans', sans-serif; font-size: 11.5px; font-weight: 600; color: #dc2626; background: #fff; border: 1px solid #fca5a5; padding: 5px 10px; border-radius: 5px; cursor: pointer; }
.btn-swap-deny:hover:not(:disabled) { background: #fef2f2; }

.btn-swap-deny-filled { font-family: 'DM Sans', sans-serif; font-size: 11.5px; font-weight: 600; color: #ffffff; background: #dc2626; border: none; padding: 5px 12px; border-radius: 5px; cursor: pointer; }
.btn-swap-deny-filled:hover:not(:disabled) { background: #b91c1c; }

.btn-swap-approve { font-family: 'DM Sans', sans-serif; font-size: 11.5px; font-weight: 600; color: #ffffff; background: #16a34a; border: none; padding: 5px 12px; border-radius: 5px; cursor: pointer; }
.btn-swap-approve:hover:not(:disabled) { background: #15803d; }
button:disabled { opacity: 0.5; cursor: not-allowed; }

.swap-card-audit-note { margin-top: 10px; padding: 8px; background: #ffffff; border-radius: 5px; border: 1px dashed #e2e8f0; font-size: 11.5px; color: #475569; display: flex; flex-direction: column; gap: 2px; }

/* Dedicated Dashboard Pagination System Footer layout styling */
.swap-pagination-footer { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-top: 14px; 
  padding-top: 12px; 
  border-top: 1px solid #e2e8f0; 
}

.pagination-nav-btn { 
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #475569;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.1s;
}

.pagination-nav-btn:hover:not(:disabled) { 
  background: #f8fafc; 
}

.pagination-nav-btn:disabled { 
  opacity: 0.4; 
  cursor: not-allowed; 
}

.pagination-pages-list { 
  display: flex; 
  gap: 4px; 
}

.pagination-page-btn { 
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  background: transparent;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-page-btn:hover { 
  background: #f1f5f9; 
  color: #0f172a; 
}

.pagination-page-btn.active { 
  background: #3b82f6; 
  color: #ffffff; 
}

/* Operational Animation Keyframes declarations */
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>