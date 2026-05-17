<template>
  <div class="admin-layout">
    <AdminSidebar class="sidebar" />

    <main class="page-container">
      <div class="page-content">

        <div class="top-header">
          <div class="header-text">
            <span class="eyebrow">{{ todayLabel }}</span>
            <h1 class="main-title">Shift <span class="accent">Assignment</span></h1>
          </div>
          <div class="header-actions">
            <button 
              class="btn-swap-toggle" 
              :class="{ 'has-alerts': pendingSwapsCount > 0, active: showSwapPanel }"
              @click="showSwapPanel = !showSwapPanel"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
              <span>Swap Requests</span>
              <span v-if="pendingSwapsCount > 0" class="swap-badge-count">{{ pendingSwapsCount }}</span>
            </button>

            <div class="filter-tabs">
              <button
                v-for="f in filters"
                :key="f.key"
                class="filter-tab"
                :class="{ active: activeFilter === f.key }"
                @click="activeFilter = f.key"
              >{{ f.label }}</button>
            </div>
            <button class="btn-auto" @click="showAutoGenModal = true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              Auto-Generate
            </button>
            <button class="btn-assign" @click="openAssignModal()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Assign Shift
            </button>
            <span class="live-dot" />
          </div>
        </div>

        <transition name="slide-down">
          <div v-if="showSwapPanel" class="swap-requests-panel">
            <div class="swap-panel-header">
              <div>
                <h3 class="panel-section-title">Teammate Shift Exchange Approvals</h3>
                <p class="panel-section-sub">Review incoming trading arrangements that have been accepted by both staff members and are awaiting administration authorization.</p>
              </div>
              <button class="btn-panel-close" @click="showSwapPanel = false">✕</button>
            </div>

            <div v-if="loadingSwaps" class="swap-panel-loader">
              <span class="spinner"></span> Loading pending swap protocols...
            </div>

            <div v-else-if="swapRequests.length === 0" class="swap-panel-empty">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
              <p>No active shift swap requests require administration approval at this time.</p>
            </div>

            <div v-else class="swap-cards-grid">
              <div v-for="request in swapRequests" :key="request.id" class="swap-flow-card">
                <div class="swap-card-top">
                  <span class="swap-time-stamp">Requested {{ formatRelativeTime(request.created_at) }}</span>
                  <span class="status-pill-accepted">Accepted by Staff</span>
                </div>

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
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 1l4 4-4 4M21 5H9M7 23l-4-4 4-4M3 19h12"/></svg>
                  </div>

                  <div class="exchange-profile-box">
                    <span class="profile-role-tag">Target Teammate</span>
                    <p class="profile-user-name">{{ request.target_name }}</p>
                    <div class="profile-shift-details" :class="request.target_shift_type?.toLowerCase()">
                      <span class="shift-type-pill">{{ request.target_shift_type || 'Drop Shift' }}</span>
                      <p class="shift-time-text">
                        {{ request.target_shift_id ? formatShiftTime(request.target_shift_start, request.target_shift_end) : 'Giving away shift completely' }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="swap-card-actions">
                  <input 
                    type="text" 
                    v-model="swapNotes[request.id]" 
                    placeholder="Provide an internal administration note (optional)..." 
                    class="swap-note-input"
                  />
                  <div class="swap-action-buttons">
                    <button class="btn-swap-deny" @click="handleAdminSwapAction(request.id, 'reject')">
                      Deny Trade
                    </button>
                    <button class="btn-swap-approve" @click="handleAdminSwapAction(request.id, 'approve')">
                      Approve & Update Schedule
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <ShiftKpiStrip :shifts="shifts" :attendance="attendance" />

        <div v-if="hasDraft" class="draft-banner">
          <div class="draft-banner-left">
            <span class="draft-pill">DRAFT</span>
            <div>
              <p class="draft-title">Schedule draft is ready for review</p>
              <p class="draft-sub">{{ draftCount }} shifts generated — review the calendar below, then publish when satisfied.</p>
            </div>
          </div>
          <div class="draft-banner-actions">
            <button class="btn-discard" @click="draftActionModal = { visible: true, mode: 'discard', loading: false }">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
              Discard Draft
            </button>
            <button class="btn-publish" @click="draftActionModal = { visible: true, mode: 'publish', loading: false }">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              Publish Schedule
            </button>
          </div>
        </div>

        <div class="main-grid">
          <ShiftCalendarPanel
            :calendar-events="calendarEvents"
            :staff-list="staffList"
            @event-click="onCalendarEventClick"
            @date-click="onCalendarDateClick"
            @filter-user="calendarUserFilter = $event"
          />
          <ShiftAttendancePanel
            :logs="filteredAttendanceLogs"
            @select-log="selectedLog = $event"
          />
        </div>

        <ShiftTable
          :rows="filteredTableRows"
          v-model:searchQuery="searchQuery"
          @edit-shift="openAssignModal($event)"
          @view-log="onViewLog"
          @delete-shift="deleteShift"
        />

      </div>
    </main>

    <ShiftAutoGenerateModal
      :visible="showAutoGenModal"
      @close="showAutoGenModal = false"
      @generated="onDraftGenerated"
    />

    <ShiftDraftActionModal
      :visible="draftActionModal.visible"
      :mode="draftActionModal.mode"
      :count="draftCount"
      :month-label="draftMonthLabel"
      :loading="draftActionModal.loading"
      @close="draftActionModal.visible = false"
      @confirm="onDraftActionConfirm"
    />

    <ShiftAssignModal
      :visible="showAssignModal"
      :is-editing="!!editingShift"
      :staff-list="staffList"
      :form="form"
      :conflict-error="shiftConflictError"
      @close="showAssignModal = false; shiftConflictError = ''"
      @save="saveShift"
    />

    <ShiftDetailDrawer
      :log="selectedLog"
      @close="selectedLog = null"
      @delete="deleteShift"
    />
  </div>
</template>

<script>
import AdminSidebar              from '@/components/sidebar/AdminSidebar.vue';
import ShiftKpiStrip             from '@/components/admin-shift/ShiftKpiStrip.vue';
import ShiftCalendarPanel        from '@/components/admin-shift/ShiftCalendarPanel.vue';
import ShiftAttendancePanel      from '@/components/admin-shift/ShiftAttendancePanel.vue';
import ShiftTable                from '@/components/admin-shift/ShiftTable.vue';
import ShiftAssignModal          from '@/components/admin-shift/ShiftAssignModal.vue';
import ShiftDetailDrawer         from '@/components/admin-shift/ShiftDetailDrawer.vue';
import ShiftAutoGenerateModal    from '@/components/admin-shift/ShiftAutoGenerateModal.vue';
import ShiftDraftActionModal     from '@/components/admin-shift/ShiftDraftActionModal.vue';
import API_BASE_URL              from '@/services/api.js';

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
  name: 'ShiftAssignment',
  components: {
    AdminSidebar, ShiftKpiStrip, ShiftCalendarPanel,
    ShiftAttendancePanel, ShiftTable, ShiftAssignModal, ShiftDetailDrawer,
    ShiftAutoGenerateModal, ShiftDraftActionModal,
  },

  data() {
    return {
      staffList:       [],
      shifts:          [],
      attendance:      [],
      loading:         false,
      error:           null,
      calendarUserFilter: null,

      // Swap Interactive Management Properties
      showSwapPanel:   false,
      loadingSwaps:    false,
      swapRequests:    [],
      swapNotes:       {}, // Stores key-value input strings indexed by request ID

      activeFilter:    'all',
      searchQuery:     '',
      showAssignModal:    false,
      showAutoGenModal:   false,
      draftActionModal:   { visible: false, mode: 'publish', loading: false },
      editingShift:       null,
      selectedLog:        null,
      shiftConflictError: '',

      filters: [
        { key: 'all',       label: 'All'       },
        { key: 'pending',   label: 'Pending'   },
        { key: 'completed', label: 'Completed' },
        { key: 'late',      label: 'Late'      },
        { key: 'missed',    label: 'Missed'    },
      ],

      form: {
        userID:    null,
        shiftType: 'Morning',
        startTime: '',
        endTime:   '',
        notes:     '',
      },
    };
  },

  computed: {
    todayLabel() {
      return new Date().toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    },
    hasDraft()   { return this.shifts.some(s => s.status === 'draft'); },
    draftCount() { return this.shifts.filter(s => s.status === 'draft').length; },
    pendingSwapsCount() { return this.swapRequests.length; },
    draftMonth() {
      const d = this.shifts.find(s => s.status === 'draft');
      if (!d) return null;
      return d.startTime.slice(0, 7);
    },
    draftMonthLabel() {
      if (!this.draftMonth) return '';
      const [y, m] = this.draftMonth.split('-');
      return new Date(y, m - 1).toLocaleDateString('en-MY', { month: 'long', year: 'numeric' });
    },
    enrichedRows() {
      return this.shifts.map(s => {
        const staff = this.staffList.find(u => u.id === s.userID);
        const log   = this.attendance.find(a => a.shiftID === s.id);
        return {
          ...s,
          staffName:        staff ? staff.fullName : `User #${s.userID}`,
          checkIn:          log?.checkIn  ?? null,
          checkOut:         log?.checkOut ?? null,
          attendanceStatus: log?.status   ?? 'Pending',
          logNotes:         log?.notes    ?? null,
        };
      });
    },

    enrichedLogs() {
      return this.attendance.map(a => {
        const staff = this.staffList.find(u => u.id === a.userID);
        const shift = this.shifts.find(s => s.id === a.shiftID);
        return {
          ...a,
          staffName:  staff ? staff.fullName  : `User #${a.userID}`,
          shiftType:  shift ? shift.shiftType : '—',
          shiftStart: shift?.startTime ?? null,
          shiftEnd:   shift?.endTime   ?? null,
        };
      });
    },

    filteredAttendanceLogs() {
      if (this.activeFilter === 'all') return this.enrichedLogs;
      return this.enrichedLogs.filter(
        l => l.status.toLowerCase() === this.activeFilter
      );
    },

    filteredTableRows() {
      const q = this.searchQuery.toLowerCase();
      return this.enrichedRows.filter(r =>
        r.staffName.toLowerCase().includes(q)        ||
        r.shiftType.toLowerCase().includes(q)        ||
        (r.assignedByName || '').toLowerCase().includes(q)
      );
    },

    calendarEvents() {
      const statusColors = {
        Completed: '#16a34a',
        Late:      '#d97706',
        Missed:    '#dc2626',
        Pending:   '#64748b',
      };
      const rows = this.calendarUserFilter
        ? this.enrichedRows.filter(r => r.userID === this.calendarUserFilter)
        : this.enrichedRows;
      return rows.map(row => ({
        id:            row.id,
        title:         `${row.staffName}`,
        start:         row.startTime,
        end:           row.endTime,
        classNames:    [`cal-event-${row.shiftType.toLowerCase()}`],
        borderColor:   statusColors[row.attendanceStatus] ?? '#64748b',
        extendedProps: row,
      }));
    },
  },

  async created() {
    await this.fetchAll();
    await this.fetchPendingAdminSwaps();
  },

  methods: {
    // ── Swap Management API Actions ────────────────────────────────────────
async fetchPendingAdminSwaps() {
  this.loadingSwaps = true;
  try {
    // Change this URL line to hit the specific admin endpoint:
    const res = await authFetch(`${API_BASE_URL}/api/swaps/pending-admin`);
    if (!res.ok) throw new Error("Could not parse swap payload details");
    
    // Simply capture the array directly—the backend already filtered it to status = 'accepted'
    this.swapRequests = await res.json(); 
  } catch (err) {
    console.error("Error reading systemic swap states:", err);
  } finally {
    this.loadingSwaps = false;
  }
},

    async handleAdminSwapAction(requestId, actionType) {
      const note = this.swapNotes[requestId] || '';
      const confirmation = confirm(`Are you sure you want to ${actionType} this shift exchange request?`);
      if (!confirmation) return;

      try {
        this.loading = true;
        const res = await authFetch(`${API_BASE_URL}/api/swaps/${requestId}/${actionType}`, {
          method: 'PATCH',
          body: JSON.stringify({ adminNote: note })
        });

        if (!res.ok) throw new Error(`Failed to perform system transaction structural sequence: ${actionType}`);
        
        alert(`Shift swap successfully ${actionType}ed!`);
        delete this.swapNotes[requestId];
        
        // Re-sync components down layout data pipelines
        await this.fetchPendingAdminSwaps();
        await this.fetchAll();
      } catch (err) {
        alert(err.message);
      } finally {
        this.loading = false;
      }
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
    },

    // ── Auto-generate / Draft / Publish ─────────────────────────────────────
    onDraftGenerated() {
      this.showAutoGenModal = false;
      this.fetchAll();
    },

    async onDraftActionConfirm() {
      if (!this.draftMonth) return;
      this.draftActionModal.loading = true;
      try {
        if (this.draftActionModal.mode === 'publish') {
          const res = await authFetch(`${API_BASE_URL}/api/shifts/publish`, {
            method: 'POST',
            body: JSON.stringify({ month: this.draftMonth }),
          });
          if (!res.ok) throw new Error('Failed to publish');
        } else {
          const res = await authFetch(`${API_BASE_URL}/api/shifts/draft`, {
            method: 'DELETE',
            body: JSON.stringify({ month: this.draftMonth }),
          });
          if (!res.ok) throw new Error('Failed to discard');
        }
        this.draftActionModal.visible = false;
        await this.fetchAll();
      } catch (err) {
        this.error = err.message;
        this.draftActionModal.loading = false;
      }
    },

    // ── Data fetching ────────────────────────────────────────────────────────
    async fetchAll() {
      this.loading = true;
      this.error   = null;
      try {
        const [staffRes, shiftsRes, attendanceRes] = await Promise.all([
          authFetch(`${API_BASE_URL}/api/users`),
          authFetch(`${API_BASE_URL}/api/shifts`),
          authFetch(`${API_BASE_URL}/api/attendance`),
        ]);

        if (!staffRes.ok || !shiftsRes.ok || !attendanceRes.ok) {
          throw new Error('One or more API requests failed');
        }

        this.staffList  = (await staffRes.json()).filter(u => u.role === 'staff' && u.status === 'active');
        this.shifts     = await shiftsRes.json();
        this.attendance = await attendanceRes.json();

        if (this.staffList.length && !this.form.userID) {
          this.form.userID = this.staffList[0].id;
        }
      } catch (err) {
        this.error = err.message;
        console.error('fetchAll error:', err);
      } finally {
        this.loading = false;
      }
    },

    // ── Modal ────────────────────────────────────────────────────────────────
    openAssignModal(shift = null) {
      this.shiftConflictError = '';
      this.editingShift = shift;
      this.form = shift
        ? {
            userID:    shift.userID,
            shiftType: shift.shiftType,
            startTime: shift.startTime.slice(0, 16),
            endTime:   shift.endTime.slice(0, 16),
            notes:     shift.notes || '',
          }
        : {
            userID:    this.staffList[0]?.id ?? null,
            shiftType: 'Morning',
            startTime: '',
            endTime:   '',
            notes:     '',
          };
      this.showAssignModal = true;
    },

    async saveShift(formData) {
      this.shiftConflictError = '';
      const newDate = formData.startTime.slice(0, 10);
      const conflict = this.shifts.find(s =>
        s.userID === formData.userID &&
        s.startTime.slice(0, 10) === newDate &&
        (!this.editingShift || s.id !== this.editingShift.id)
      );
      if (conflict) {
        const staff = this.staffList.find(u => u.id === formData.userID);
        const name  = staff ? staff.fullName : 'This staff member';
        this.shiftConflictError = `${name} already has a shift on this date.`;
        return;
      }

      const payload = {
        userID:     formData.userID,
        assignedBy: 1, 
        shiftType:  formData.shiftType,
        startTime:  formData.startTime + ':00',
        endTime:    formData.endTime    + ':00',
        notes:      formData.notes,
      };

      try {
        if (this.editingShift) {
          const res = await authFetch(`${API_BASE_URL}/api/shifts/${this.editingShift.id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error('Failed to update shift');

          const idx = this.shifts.findIndex(s => s.id === this.editingShift.id);
          if (idx !== -1) {
            this.shifts[idx] = { ...this.shifts[idx], ...payload };
          }

        } else {
          const res = await authFetch(`${API_BASE_URL}/api/shifts`, {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error('Failed to create shift');

          const { id: newShiftId } = await res.json();

          const attRes = await authFetch(`${API_BASE_URL}/api/attendance`, {
            method: 'POST',
            body: JSON.stringify({
              shiftID:  newShiftId,
              userID:   formData.userID,
              checkIn:  null,
              checkOut: null,
              status:   'Pending',
              notes:    null,
            }),
          });
          if (!attRes.ok) throw new Error('Shift created but attendance seed failed');

          await this.fetchAll();
        }
      } catch (err) {
        console.error('saveShift error:', err);
        this.error = err.message;
      } finally {
        this.showAssignModal = false;
      }
    },

    async deleteShift(shiftID) {
      try {
        const res = await authFetch(`${API_BASE_URL}/api/shifts/${shiftID}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete shift');

        this.shifts     = this.shifts.filter(s => s.id !== shiftID);
        this.attendance = this.attendance.filter(a => a.shiftID !== shiftID);
        this.selectedLog = null;
      } catch (err) {
        console.error('deleteShift error:', err);
        this.error = err.message;
      }
    },

    onCalendarEventClick(props) {
      this.selectedLog = this.enrichedLogs.find(l => l.shiftID === props.id) ?? null;
    },

    onViewLog(shiftID) {
      this.selectedLog = this.enrichedLogs.find(l => l.shiftID === shiftID) ?? null;
    },

    onCalendarDateClick(dateStr) {
      const clicked = new Date(dateStr);
      const today   = new Date();
      today.setHours(0, 0, 0, 0);
      if (clicked < today) return;

      this.editingShift = null;
      this.form = {
        userID:    this.staffList[0]?.id ?? null,
        shiftType: 'Morning',
        startTime: `${dateStr}T09:00`,
        endTime:   `${dateStr}T17:00`,
        notes:     '',
      };
      this.showAssignModal = true;
    },
  },
};
</script>

<style scoped>
*, *::before, *::after { box-sizing: border-box; }

/* ── Existing Core Layouts ── */
.admin-layout { display: flex; width: 100%; height: 100vh; overflow: hidden; font-family: 'DM Sans', sans-serif; background: #f6f7fb; }
.sidebar { flex-shrink: 0; }
.page-container { flex: 1; min-width: 0; overflow-y: auto; background: #f6f7fb; }
.page-content { padding: 28px 32px 48px; max-width: 100%; margin: 0 auto; }

.top-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 22px; flex-wrap: wrap; gap: 16px; }
.eyebrow { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.2em; color: #94a3b8; display: block; margin-bottom: 4px; }
.main-title { font-family: 'DM Sans', sans-serif; font-size: 1.85rem; font-weight: 700; color: #0f172a; margin: 0; letter-spacing: -0.035em; line-height: 1; }
.header-actions { display: flex; align-items: center; gap: 14px; }

/* ── Interactive Swap Request Header Navigation Trigger ── */
.btn-swap-toggle {
  font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 600;
  background: #ffffff; color: #475569; border: 1px solid #e2e8f0;
  padding: 9px 16px; border-radius: 8px; cursor: pointer;
  display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s;
  position: relative;
}
.btn-swap-toggle:hover { background: #f8fafc; color: #0f172a; border-color: #cbd5e1; }
.btn-swap-toggle.active { background: #6366f1; color: #ffffff; border-color: #6366f1; }
.btn-swap-toggle.has-alerts { border-color: #fed7aa; background-color: #fff7ed; color: #c2410c; }
.btn-swap-toggle.has-alerts.active { background: #6366f1; color: #ffffff; border-color: #6366f1; }

.swap-badge-count {
  background: #ef4444; color: #ffffff; font-family: 'DM Mono', monospace;
  font-size: 10px; font-weight: 700; min-width: 18px; height: 18px;
  border-radius: 10px; display: inline-flex; align-items: center; justify-content: center;
  padding: 0 4px; line-height: 1;
}

/* ── Swap Request Interactive Management Section View ── */
.swap-requests-panel {
  background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px;
  padding: 20px; margin-bottom: 22px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}
.swap-panel-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
.panel-section-title { font-size: 15px; font-weight: 600; color: #0f172a; margin-bottom: 3px; }
.panel-section-sub { font-size: 12.5px; color: #64748b; }
.btn-panel-close { background: #f1f5f9; border: none; width: 24px; height: 24px; border-radius: 50%; color: #64748b; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 10px; transition: all 0.15s; }
.btn-panel-close:hover { background: #e2e8f0; color: #0f172a; }

.swap-panel-loader { padding: 30px; text-align: center; color: #64748b; font-size: 13px; font-family: 'DM Mono', monospace; }
.swap-panel-empty { padding: 40px; text-align: center; color: #94a3b8; font-size: 13.5px; display: flex; flex-direction: column; align-items: center; gap: 8px; }

/* Swap Requests Grid System */
.swap-cards-grid { display: flex; flex-direction: column; gap: 14px; }
.swap-flow-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; transition: border-color 0.15s; }
.swap-flow-card:hover { border-color: #cbd5e1; }

.swap-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.swap-time-stamp { font-family: 'DM Mono', monospace; font-size: 11px; color: #94a3b8; }
.status-pill-accepted { background: #ecfdf5; color: #047857; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 6px; border: 1px solid #a7f3d0; }

/* The Dual Interactive Exchange View Layout Block */
.swap-exchange-wrapper { display: grid; grid-template-columns: 1fr auto 1fr; gap: 16px; align-items: center; background: #ffffff; padding: 14px; border-radius: 8px; border: 1px solid #f1f5f9; }
.exchange-profile-box { display: flex; flex-direction: column; }
.profile-role-tag { font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 600; text-transform: uppercase; color: #94a3b8; margin-bottom: 2px; letter-spacing: 0.02em; }
.profile-user-name { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 6px; }

.profile-shift-details { padding: 8px 10px; border-radius: 6px; display: flex; flex-direction: column; gap: 2px; }
.profile-shift-details.morning { background: #fffbeb; border-left: 3px solid #d97706; }
.profile-shift-details.evening { background: #f3e8ff; border-left: 3px solid #7c3aed; }

.shift-type-pill { font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 700; color: #334155; }
.shift-time-text { font-size: 12px; color: #475569; font-weight: 500; }

.exchange-direction-indicator { color: #6366f1; background: #eef2ff; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

/* Card Actions footer design */
.swap-card-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
.swap-note-input { font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0; outline: none; transition: border-color 0.15s; background: #ffffff; }
.swap-note-input:focus { border-color: #6366f1; }

.swap-action-buttons { display: flex; justify-content: flex-end; gap: 8px; }
.btn-swap-deny { font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 600; color: #dc2626; background: #fff; border: 1px solid #fca5a5; padding: 7px 14px; border-radius: 6px; cursor: pointer; transition: all 0.15s; }
.btn-swap-deny:hover { background: #fef2f2; }
.btn-swap-approve { font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 600; color: #ffffff; background: #16a34a; border: none; padding: 7px 16px; border-radius: 6px; cursor: pointer; transition: background 0.15s; }
.btn-swap-approve:hover { background: #15803d; }

/* Slide Animation Sequences */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); max-height: 500px; overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; margin-bottom: 0; transform: translateY(-8px); }

/* ── Standard CSS Module Overrides ── */
.filter-tabs { display: flex; gap: 4px; background: #f1f5f9; padding: 3px; border-radius: 8px; }
.filter-tab { font-family: 'DM Mono', monospace; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; border: none; background: transparent; color: #64748b; padding: 5px 12px; border-radius: 6px; cursor: pointer; transition: all 0.15s ease; }
.filter-tab.active { background: #fff; color: #0f172a; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }

.btn-assign { font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 600; background: #16a34a; color: #fff; border: none; border-radius: 8px; padding: 9px 18px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.15s, transform 0.1s, box-shadow 0.15s; letter-spacing: -0.01em; }
.btn-assign:hover { background: #15803d; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(22,163,74,.3); }

.btn-auto { font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 600; background: #eef2ff; color: #4f46e5; border: 1px solid #c7d2fe; padding: 0.45rem 0.9rem; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s; }
.btn-auto:hover { background: #6366f1; color: #fff; border-color: #6366f1; transform: translateY(-1px); }

.draft-banner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; background: linear-gradient(135deg, #fffbeb 0%, #fef9c3 100%); border: 1.5px solid #fde68a; border-radius: 12px; padding: 14px 18px; }
.draft-banner-left { display: flex; align-items: center; gap: 12px; }
.draft-pill { font-size: 10px; font-weight: 800; letter-spacing: .1em; background: #f59e0b; color: #fff; padding: 3px 8px; border-radius: 5px; flex-shrink: 0; }
.draft-title { font-size: 13.5px; font-weight: 600; color: #92400e; margin-bottom: 2px; }
.draft-sub   { font-size: 12px; color: #b45309; }
.draft-banner-actions { display: flex; align-items: center; gap: 8px; }
.btn-discard { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; border: 1px solid #fca5a5; background: #fff; color: #dc2626; font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: all .15s; }
.btn-discard:hover { background: #ef4444; border-color: #ef4444; color: #fff; }
.btn-publish { display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; border-radius: 8px; border: none; background: #16a34a; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: all .15s; }
.btn-publish:hover { background: #15803d; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(22,163,74,.3); }

.accent { color: #6366f1; }
.live-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; flex-shrink: 0; animation: live-pulse 2s ease infinite; }
@keyframes live-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,.4); } 50% { box-shadow: 0 0 0 5px rgba(34,197,94,0); } }

.main-grid { display: grid; grid-template-columns: 1fr 360px; gap: 18px; margin-bottom: 22px; align-items: start; }

@media (max-width: 1100px) { .main-grid { grid-template-columns: 1fr; } }
@media (max-width: 700px) {
  .page-content { padding: 20px 16px; }
  .top-header { flex-direction: column; align-items: flex-start; }
  .swap-exchange-wrapper { grid-template-columns: 1fr; text-align: center; }
  .exchange-direction-indicator { margin: 4px auto; transform: rotate(90deg); }
}
</style>