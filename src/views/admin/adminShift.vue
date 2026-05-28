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
              :class="{ active: showSwapPanel }"
              @click="showSwapPanel = !showSwapPanel"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/>
              </svg>
              <span>Swap Protocol Manager</span>
              <span v-if="pendingSwapsCount > 0" class="btn-badge">
                {{ pendingSwapsCount }}
              </span>
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              Auto-Generate
            </button>
            
            <button class="btn-assign" @click="openAssignModal()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Assign Shift
            </button>
            <span class="live-dot" />
          </div>
        </div>

        <transition name="slide-down">
          <AdminSwapManager
            v-if="showSwapPanel"
            ref="swapManager"
            :intercept-actions="true"
            @close="showSwapPanel = false"
            @refresh-schedule="fetchAll"
            @request-action="handleSwapActionTrigger"
          />
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
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
              Discard Draft
            </button>
            <button class="btn-publish" @click="draftActionModal = { visible: true, mode: 'publish', loading: false }">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
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
  :totalStaff="staffList.length"
  @close="showAutoGenModal = false; fetchAll()"
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

    <div class="swap-feedback-overlay" v-if="swapModal.visible">
      <div class="swap-feedback-modal" :class="`state-${swapModal.state}`">
        
        <button class="modal-dismiss" v-if="swapModal.state !== 'loading'" @click="closeSwapModal">✕</button>

        <div v-if="swapModal.state === 'confirm'" class="modal-state-view">
          <div class="status-indicator-icon icon-confirm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
              <path d="M12 9v4M12 15h.01"/>
            </svg>
          </div>
          <h3 class="feedback-title">Verify System Exception</h3>
          <p class="feedback-desc">
            Are you completely sure you want to <strong>{{ swapModal.type }}</strong> this shift trade exchange across the active workspace registries?
          </p>
          <div class="feedback-actions">
            <button class="btn-fback-cancel" @click="closeSwapModal">Abort Operation</button>
            <button 
              :class="swapModal.type === 'approve' ? 'btn-fback-approve' : 'btn-fback-deny'" 
              @click="confirmSwapAction"
            >
              Confirm & Execute
            </button>
          </div>
        </div>

        <div v-if="swapModal.state === 'loading'" class="modal-state-view">
          <span class="feedback-spinner"></span>
          <h3 class="feedback-title">Syncing Rosters</h3>
          <p class="feedback-desc">Committing authorization states across active timeline segments...</p>
        </div>

        <div v-if="swapModal.state === 'success'" class="modal-state-view">
          <div class="status-indicator-icon icon-success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h3 class="feedback-title">Operation Executed</h3>
          <p class="feedback-desc">Trade logs modified successfully. Live scheduling calendars have been re-indexed.</p>
          <div class="feedback-actions">
            <button class="btn-fback-close" @click="closeSwapModal">Dismiss Registry</button>
          </div>
        </div>

        <div v-if="swapModal.state === 'fail'" class="modal-state-view">
          <div class="status-indicator-icon icon-fail">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
          <h3 class="feedback-title">Registry Fault</h3>
          <p class="feedback-desc">{{ swapModal.errorMessage || 'An error occurred during backend schedule verification rules.' }}</p>
          <div class="feedback-actions">
            <button class="btn-fback-close" @click="closeSwapModal">Close</button>
          </div>
        </div>

      </div>
    </div>

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
import AdminSwapManager          from '@/components/admin-shift/AdminSwapManager.vue';
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
    ShiftAutoGenerateModal, ShiftDraftActionModal, AdminSwapManager,
  },

  data() {
    return {
      staffList:          [],
      shifts:             [],
      attendance:         [],
      holidays:           [],
      // Local tracking array to derive live header badge counts matching active records
      allRawSwaps:        [],
      loading:            false,
      error:              null,
      calendarUserFilter: null,

      showSwapPanel:      false,
      activeFilter:       'all',
      searchQuery:        '',
      showAssignModal:    false,
      showAutoGenModal:   false,
      draftActionModal:   { visible: false, mode: 'publish', loading: false },
      editingShift:       null,
      selectedLog:        null,
      shiftConflictError: '',

      swapModal: {
        visible: false,
        state: 'confirm',
        type: 'approve',
        requestId: null,
        note: ''
      },

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
    // Dynamic computer counter capturing records explicitly awaiting administration actions
    pendingSwapsCount() {
      return this.allRawSwaps.filter(s => s.status === 'accepted').length;
    },
    todayLabel() {
      return new Date().toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    },
    hasDraft()   { return this.shifts.some(s => s.status === 'draft'); },
    draftCount() { return this.shifts.filter(s => s.status === 'draft').length; },
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

      const shiftEvents = rows.map(row => ({
        id: row.id,
        title: `${row.staffName}`,
        start: row.startTime,
        end: row.endTime,
        classNames: [`cal-event-${row.shiftType.toLowerCase()}`],
        borderColor: statusColors[row.attendanceStatus] ?? '#64748b',
        extendedProps: {
          ...row,
          publicHoliday: false
        },
      }));

      const holidayYear = new Date().getFullYear();
      const monthMap = {
        Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
        Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
      };

      const holidayEvents = this.holidays.map((holiday, index) => {
        const [monthText, day] = holiday.date.split(' ');
        const iso = `${holidayYear}-${monthMap[monthText]}-${day.padStart(2, '0')}`;

        return {
          id: `holiday-${index}`,
          title: `🎉 ${holiday.holiday_name}`,
          start: iso,
          allDay: true,
          display: 'background',
          backgroundColor: 'rgba(254, 226, 226, 0.6)',
          classNames: ['holiday-block-event'],
          extendedProps: {
            publicHoliday: true,
            holidayName: holiday.holiday_name,
            mandatory: holiday.is_mandatory,
          },
        };
      });

      return [...shiftEvents, ...holidayEvents];
    },
  },

  async created() {
    await this.fetchAll();
  },

  methods: {
    async fetchAll() {
      this.loading = true;
      this.error   = null;
      try {
        const year = new Date().getFullYear();
        const [staffRes, shiftsRes, attendanceRes, holidayRes, swapsRes] = await Promise.all([
          authFetch(`${API_BASE_URL}/api/swaps/admin-all`), // Pull active swaps directly to feed button numbers
          authFetch(`${API_BASE_URL}/api/users`),
          authFetch(`${API_BASE_URL}/api/shifts`),
          authFetch(`${API_BASE_URL}/api/attendance`),
          fetch(`https://sabah-holiday.dydxsoft.my/api/selangor/${year}.json`),
        ]);

        // Capture data indices correctly across operations
        if (staffRes.ok) this.allRawSwaps = await staffRes.json();
        if (!shiftsRes.ok || !attendanceRes.ok) {
          throw new Error('One or more systemic API requests failed');
        }

        this.staffList  = (await shiftsRes.json()).filter(u => u.role === 'staff' && u.status === 'active');
        this.shifts     = await attendanceRes.json();
        this.attendance = await holidayRes.json();

        if (swapsRes.ok) {
          const raw     = await swapsRes.json();
          this.holidays = Array.isArray(raw) ? raw : (raw.holidays ?? raw.data ?? []);
        }

        if (this.staffList.length && !this.form.userID) {
          this.form.userID = this.staffList[0].id;
        }
      } catch (err) {
        this.error = err.message;
        console.error('fetchAll structural runtime error:', err);
      } finally {
        this.loading = false;
      }
    },

    handleSwapActionTrigger({ requestId, actionType, adminNote }) {
      this.swapModal = {
        visible: true,
        state: 'confirm',
        type: actionType,
        requestId: requestId,
        note: adminNote,
        errorMessage: ''
      };
    },

    async confirmSwapAction() {
      this.swapModal.state = 'loading';
      try {
        const res = await authFetch(`${API_BASE_URL}/api/swaps/${this.swapModal.requestId}/${this.swapModal.type}`, {
          method: 'PATCH',
          body: JSON.stringify({ adminNote: this.swapModal.note })
        });

        if (!res.ok) throw new Error(`Backend rejected transaction execution parameters.`);

        this.swapModal.state = 'success';
        
        if (this.$refs.swapManager && typeof this.$refs.swapManager.onActionSuccess === 'function') {
          this.$refs.swapManager.onActionSuccess(this.swapModal.requestId);
        }

        await this.fetchAll();
      } catch (err) {
        this.swapModal.state = 'fail';
        this.swapModal.errorMessage = err.message;
      }
    },

    closeSwapModal() {
      this.swapModal.visible = false;
    },

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
          if (!res.ok) throw new Error('Failed parsing core publication changes');
        } else {
          const res = await authFetch(`${API_BASE_URL}/api/shifts/draft`, {
            method: 'DELETE',
            body: JSON.stringify({ month: this.draftMonth }),
          });
          if (!res.ok) throw new Error('Failed executing removal routines');
        }
        this.draftActionModal.visible = false;
        await this.fetchAll();
      } catch (err) {
        this.error = err.message;
        this.draftActionModal.loading = false;
      }
    },

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
        this.shiftConflictError = `${name} already has a shift assigned on this date.`;
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
          if (!res.ok) throw new Error('Failed to update system target shift models');

          const idx = this.shifts.findIndex(s => s.id === this.editingShift.id);
          if (idx !== -1) {
            this.shifts[idx] = { ...this.shifts[idx], ...payload };
          }
        } else {
          const res = await authFetch(`${API_BASE_URL}/api/shifts`, {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error('Failed to append shift assignments');

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
          if (!attRes.ok) throw new Error('Shift created but structural verification seed failed');

          await this.fetchAll();
        }
      } catch (err) {
        console.error('saveShift runtime sequence error:', err);
        this.error = err.message;
      } finally {
        this.showAssignModal = false;
      }
    },

    async deleteShift(shiftID) {
      if (!confirm("Are you sure you want to permanently delete this shift allocation?")) return;
      try {
        const res = await authFetch(`${API_BASE_URL}/api/shifts/${shiftID}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete target structural entry');

        this.shifts     = this.shifts.filter(s => s.id !== shiftID);
        this.attendance = this.attendance.filter(a => a.shiftID !== shiftID);
        this.selectedLog = null;
      } catch (err) {
        console.error('deleteShift runtime trace error:', err);
        this.error = err.message;
      }
    },

    onCalendarEventClick(props) {
      if (props.extendedProps?.publicHoliday) return;
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

.admin-layout { display: flex; width: 100%; height: 100vh; overflow: hidden; font-family: 'DM Sans', sans-serif; background: #f6f7fb; }
.sidebar { flex-shrink: 0; }
.page-container { flex: 1; min-width: 0; overflow-y: auto; background: #f6f7fb; }
.page-content { padding: 28px 32px 48px; max-width: 100%; margin: 0 auto; }

.top-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 22px; flex-wrap: wrap; gap: 16px; }
.eyebrow { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.2em; color: #94a3b8; display: block; margin-bottom: 4px; }
.main-title { font-family: 'DM Sans', sans-serif; font-size: 1.85rem; font-weight: 700; color: #0f172a; margin: 0; letter-spacing: -0.035em; line-height: 1; }
.header-actions { display: flex; align-items: center; gap: 14px; }

.swap-feedback-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 9999;
}
.swap-feedback-modal {
  background: #ffffff; border-radius: 14px; width: 100%; max-width: 440px;
  padding: 32px 28px; border: 1px solid #e2e8f0; position: relative;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
  text-align: center; transform: scale(1); transition: transform 0.2s ease;
}
.modal-dismiss {
  position: absolute; top: 16px; right: 16px; border: none; background: #f1f5f9;
  width: 24px; height: 24px; border-radius: 50%; color: #64748b; cursor: pointer;
  display: flex; align-items: center; justify-content: center; font-size: 10px;
}
.modal-dismiss:hover { background: #e2e8f0; color: #0f172a; }

.modal-state-view { display: flex; flex-direction: column; align-items: center; }

.status-indicator-icon {
  width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center;
  justify-content: center; margin-bottom: 18px;
}
.icon-confirm { background: #eff6ff; color: #3b82f6; }
.icon-success { background: #ecfdf5; color: #10b981; }
.icon-fail { background: #fef2f2; color: #ef4444; }

.feedback-title { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
.feedback-desc { font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 24px; }
.feedback-actions { display: flex; gap: 10px; width: 100%; justify-content: center; }

.btn-fback-cancel {
  font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 600;
  background: #ffffff; color: #475569; border: 1px solid #e2e8f0;
  padding: 9px 16px; border-radius: 8px; cursor: pointer;
}
.btn-fback-cancel:hover { background: #f8fafc; color: #0f172a; }

.btn-fback-approve {
  font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 600;
  background: #16a34a; color: white; border: none; padding: 9px 20px; border-radius: 8px; cursor: pointer;
}
.btn-fback-approve:hover { background: #15803d; }

.btn-fback-deny {
  font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 600;
  background: #dc2626; color: white; border: none; padding: 9px 20px; border-radius: 8px; cursor: pointer;
}
.btn-fback-deny:hover { background: #b91c1c; }

.btn-fback-close {
  font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 600;
  background: #0f172a; color: white; border: none; padding: 9px 24px; border-radius: 8px; cursor: pointer; width: 100%;
}
.btn-fback-close:hover { background: #1e293b; }

.feedback-spinner {
  width: 32px; height: 32px; border: 3px solid #f1f5f9; border-top-color: #6366f1;
  border-radius: 50%; animation: spin-loading 0.8s linear infinite; margin-bottom: 18px;
}
@keyframes spin-loading { to { transform: rotate(360deg); } }

:deep(.holiday-block-event) {
  font-family: 'DM Sans', sans-serif; font-size: 0.72rem; font-weight: 700;
  color: #dc2626 !important; padding: 4px 6px; pointer-events: none; user-select: none;
}

/* ── Refactored Sub-Component Trigger Button ── */
.btn-swap-toggle {
  font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 600;
  background: #ffffff; color: #475569; border: 1px solid #e2e8f0;
  padding: 9px 16px; border-radius: 8px; cursor: pointer;
  display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s;
  position: relative;
}
.btn-swap-toggle:hover { background: #f8fafc; color: #0f172a; border-color: #cbd5e1; }
.btn-swap-toggle.active { background: #6366f1; color: #ffffff; border-color: #6366f1; }

/* Red Notification Button Count Badge Style rules */
.btn-badge {
  background: #ef4444;
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 10px;
  min-width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(239, 68, 68, 0.4);
}

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); max-height: 800px; overflow: hidden; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; margin-bottom: 0; transform: translateY(-8px); }

.filter-tabs { display: flex; gap: 4px; background: #f1f5f9; padding: 3px; border-radius: 8px; }
.filter-tab { font-family: 'DM Mono', monospace; font-size: 0.65rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; border: none; background: transparent; color: #64748b; padding: 5px 12px; border-radius: 6px; cursor: pointer; transition: all 0.15s ease; }
.filter-tab.active { background: #fff; color: #0f172a; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }

.btn-assign { font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 600; background: #16a34a; color: #fff; border: none; border-radius: 8px; padding: 9px 18px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.15s, transform 0.1s, box-shadow 0.15s; letter-spacing: -0.01em; }
.btn-assign:hover { background: #15803d; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(22,163,74,.3); }

.btn-auto { font-family: 'DM Sans', sans-serif; font-size: 0.8rem; font-weight: 600; background: #eef2ff; color: #4f46e5; border: 1px solid #c7d2fe; padding: 0.45rem 0.9rem; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s; }
.btn-auto:hover { background: #6366f1; color: #fff; border-color: #6366f1; transform: translateY(-1px); }

.draft-banner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; background: linear-gradient(135deg, #fffbeb 0%, #fef9c3 100%); border: 1.5px solid #fde68a; border-radius: 12px; padding: 14px 18px; margin-bottom: 20px; }
.draft-banner-left { display: flex; align-items: center; gap: 12px; }
.draft-pill { font-size: 10px; font-weight: 800; letter-spacing: .1em; background: #f59e0b; color: #fff; padding: 3px 8px; border-radius: 5px; flex-shrink: 0; }
.draft-title { font-size: 13.5px; font-weight: 600; color: #92400e; margin-bottom: 2px; }
.draft-sub { font-size: 12px; color: #b45309; }
.draft-banner-actions { display: flex; align-items: center; gap: 8px; }

.btn-discard { display: inline-flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 8px; border: 1px solid #fca5a5; background: #fff; color: #dc2626; font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: all .15s; }
.btn-discard:hover { background: #ef4444; border-color: #ef4444; color: #fff; }
.btn-publish { display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; border-radius: 8px; border: none; background: #16a34a; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 600; cursor: pointer; transition: all .15s; }
.btn-publish:hover { background: #15803d; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(22,163,74,.3); }

.accent { color: #6366f1; }
.live-dot { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; flex-shrink: 0; animation: live-pulse 2s ease infinite; }
@keyframes live-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,.4); } 50% { box-shadow: 0 0 0 5px rgba(34,197,94,0); } }

.main-grid { display: grid; grid-template-columns: 1fr 360px; gap: 18px; margin-bottom: 22px; align-items: stretch; }

@media (max-width: 1100px) { .main-grid { grid-template-columns: 1fr; } }
@media (max-width: 700px) {
  .page-content { padding: 20px 16px; }
  .top-header { flex-direction: column; align-items: flex-start; gap: 12px; }
}
</style>