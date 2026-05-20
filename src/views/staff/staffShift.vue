<template>
  <div class="app-layout">
    <StaffSidebar />

    <main class="page">

      <div class="topbar">
        <div class="topbar-left">
          <p class="topbar-date">{{ todayDay }}, {{ todayDate }}</p>
          <h1 class="topbar-title">My <span class="accent">Shifts</span></h1>
        </div>
        <div class="topbar-right">
          <div class="legend">
            <span class="legend-item morning">
              <span class="legend-dot"></span> Morning
            </span>
            <span class="legend-item evening">
              <span class="legend-dot"></span> Evening
            </span>
            <span class="legend-item colleague" v-if="selectedColleagueId">
              <span class="legend-dot"></span> Teammate
            </span>
            <span class="legend-item holiday-legend">
              <span class="legend-dot holiday-dot"></span> Public Holiday
            </span>
          </div>
          <div class="live-dot"><span class="pulse" />Live</div>
        </div>
      </div>

      <div class="summary-row">
        <div class="summary-card" style="animation-delay:0ms">
          <div class="summary-icon" style="background:#eef2ff; color:#6366f1">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div>
            <p class="summary-val">{{ stats.totalThisMonth }}</p>
            <p class="summary-label">Shifts This Month</p>
          </div>
        </div>
        <div class="summary-card" style="animation-delay:60ms">
          <div class="summary-icon" style="background:#fffbeb; color:#f59e0b">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <div>
            <p class="summary-val">{{ stats.morningCount }}</p>
            <p class="summary-label">Morning Shifts</p>
          </div>
        </div>
        <div class="summary-card" style="animation-delay:120ms">
          <div class="summary-icon" style="background:#f5f3ff; color:#8b5cf6">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
          </div>
          <div>
            <p class="summary-val">{{ stats.eveningCount }}</p>
            <p class="summary-label">Evening Shifts</p>
          </div>
        </div>
        <div class="summary-card" style="animation-delay:180ms">
          <div class="summary-icon" style="background:#f0fdf4; color:#10b981">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <p class="summary-val">{{ stats.totalHours }}<span class="summary-unit">h</span></p>
            <p class="summary-label">Total Hours</p>
          </div>
        </div>
      </div>

      <div v-if="swapRequests.length" class="progress-panel animate-pop">
        <div class="panel-header-row">
          <div class="panel-header">
            <h2 class="panel-title">🔄 Swap Request Hub</h2>
            <p class="panel-sub">Review incoming proposals, manage your requests, or view past logs</p>
          </div>
          <div class="hub-tabs">
            <button class="tab-btn" :class="{ active: activeHubTab === 'current' }" @click="setHubTab('current')">
              Active Hub ({{ categorizedSwaps.current.length }})
            </button>
            <button class="tab-btn" :class="{ active: activeHubTab === 'archive' }" @click="setHubTab('archive')">
              Archive History ({{ categorizedSwaps.archive.length }})
            </button>
          </div>
        </div>

        <div class="progress-list">
          <div v-for="swap in paginatedSwaps" :key="swap.id" class="progress-card">
            <div class="progress-card-main">
              <div class="swap-participants">
                <span v-if="swap.requester_id == myId" class="participant-badge me">Me</span>
                <span v-else class="participant-badge staff">{{ swap.requester_name || getColleagueName(swap.requester_id) }}</span>
                <span class="swap-arrow">➔</span>
                <span v-if="swap.target_id == myId" class="participant-badge me">Me</span>
                <span v-else class="participant-badge staff">{{ swap.target_name || getColleagueName(swap.target_id) }}</span>
              </div>
              <div class="swap-details">
                <p class="swap-info-text">
                  Swapping
                  <strong>{{ swap.requester_id == myId ? 'your' : (swap.requester_name || getColleagueName(swap.requester_id)) + "'s" }}</strong> shift on
                  <strong>{{ formatDate(swap.shift_start) }}</strong>
                  for
                  <strong>{{ swap.target_id == myId ? 'your' : (swap.target_name || getColleagueName(swap.target_id)) + "'s" }}</strong> shift on
                  <strong>{{ formatDate(swap.target_shift_start) }}</strong>.
                </p>
              </div>
            </div>

            <div class="progress-card-status">
              <div v-if="swap.target_id == myId && swap.status?.toLowerCase() === 'pending'" class="peer-action-buttons">
                <button class="btn-action-accept" @click="triggerResponseConfirm(swap.id, 'accepted')">Accept</button>
                <button class="btn-action-reject" @click="triggerResponseConfirm(swap.id, 'rejected')">Reject</button>
              </div>
              
              <div v-else-if="swap.requester_id == myId && swap.status?.toLowerCase() === 'pending'" class="peer-action-buttons">
                <button class="btn-action-cancel" @click="triggerCancelConfirm(swap.id)">Cancel Request</button>
              </div>

              <div v-else>
                <span class="status-indicator" :class="getFriendlyStatusClass(swap.status)">
                  <span class="status-dot"></span> {{ getFriendlyStatusLabel(swap.status, swap.requester_id) }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="paginatedSwaps.length === 0" class="empty-hub-state">
            No entries found inside this sector.
          </div>
        </div>

        <div v-if="totalPages > 1" class="hub-pagination-footer">
          <button class="btn-page-nav" :disabled="currentPage === 1" @click="currentPage--">◀ Previous</button>
          <span class="page-counter">Page {{ currentPage }} of {{ totalPages }}</span>
          <button class="btn-page-nav" :disabled="currentPage === totalPages" @click="currentPage++">Next ▶</button>
        </div>
      </div>

      <ShiftCalendarPanel
        :shifts="shifts"
        :colleague-shifts="colleagueShifts"
        :swap-requests="swapRequests"
        :public-holidays="publicHolidays"
        :staff-list="staffList"
        :my-id="myId"
        :selected-colleague-id="selectedColleagueId"
        :is-swap-mode="isSwapMode"
        :target-swap-shift="targetSwapShift"
        :selected-my-shift-id="selectedMyShiftId"
        :loading-colleague="loadingColleague"
        @shift-click="onShiftClick"
        @shift-selected="onShiftSelected"
        @colleague-change="onColleagueChange"
        @cancel-swap="cancelSwapMode"
        @execute-swap="triggerSubmissionConfirm"
      />

      <transition name="modal-fade">
        <div v-if="selectedShift" class="modal-overlay" @click.self="selectedShift = null">
          <div class="modal-card main-shift-modal animate-pop">
            <div class="modal-header" :class="selectedShift.isColleagueEvent ? 'colleague-header' : selectedShift.shiftType.toLowerCase()">
              <div class="modal-shift-type">
                <span>{{ selectedShift.isColleagueEvent ? `${selectedShift.ownerName}'s` : 'My' }} {{ selectedShift.shiftType }} Shift</span>
              </div>
              <button class="modal-close" @click="selectedShift = null">✕</button>
            </div>
            <div class="modal-body">
              <div class="modal-row" v-if="selectedShift.isColleagueEvent">
                <span class="modal-field">Staff Member</span>
                <span class="modal-value">{{ selectedShift.ownerName }}</span>
              </div>
              <div class="modal-row">
                <span class="modal-field">Date</span>
                <span class="modal-value">{{ formatDate(selectedShift.startTime) }}</span>
              </div>
              <div class="modal-row">
                <span class="modal-field">Start</span>
                <span class="modal-value">{{ formatTime(selectedShift.startTime) }}</span>
              </div>
              <div class="modal-row">
                <span class="modal-field">End</span>
                <span class="modal-value">{{ formatTime(selectedShift.endTime) }}</span>
              </div>
              <div class="modal-row">
                <span class="modal-field">Duration</span>
                <span class="modal-value">{{ getDuration(selectedShift.startTime, selectedShift.endTime) }}</span>
              </div>
              <div class="modal-row" v-if="!selectedShift.isColleagueEvent">
                <span class="modal-field">Assigned By</span>
                <span class="modal-value">{{ selectedShift.assignedByName }}</span>
              </div>
              <div class="modal-row" v-if="!selectedShift.isColleagueEvent">
                <span class="modal-field">Status</span>
                <span class="modal-value">{{ selectedShift.status || 'Pending' }}</span>
              </div>
            </div>

            <div class="modal-footer-actions" v-if="selectedShift.isColleagueEvent && !isSwapMode">
              <div v-if="isShiftPendingSwap(selectedShift.id)" class="swap-pending-alert">
                <span class="alert-icon">⏳</span> Swap request for this shift is already in progress
              </div>
              <button v-else class="btn-swap" @click="initiateSwapMode(selectedShift)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
                Request Swap with Teammate
              </button>
            </div>
          </div>
        </div>
      </transition>

      <transition name="modal-fade">
        <div v-if="statusModal.show" class="modal-overlay" @click.self="closeStatusModal">
          <div class="modal-card status-modal-card animate-pop">
            <div class="status-modal-body">
              <div class="status-icon-wrapper" :class="statusModal.type">
                <span v-if="statusModal.type === 'confirm'">❓</span>
                <span v-if="statusModal.type === 'success'">✅</span>
                <span v-if="statusModal.type === 'fail'">❌</span>
              </div>

              <h3 class="status-title">{{ statusModal.title }}</h3>
              <p class="status-message">{{ statusModal.message }}</p>

              <div class="status-actions">
                <template v-if="statusModal.type === 'confirm'">
                  <button class="btn-status-cancel" @click="closeStatusModal" :disabled="loading">Cancel</button>
                  <button class="btn-status-confirm" :class="statusModal.actionClass" @click="handleStatusConfirm" :disabled="loading">
                    <span v-if="loading" class="spinner"></span>
                    {{ loading ? 'Processing...' : 'Confirm' }}
                  </button>
                </template>

                <template v-else>
                  <button class="btn-status-close" @click="closeStatusModal">Dismiss</button>
                </template>
              </div>
            </div>
          </div>
        </div>
      </transition>

    </main>
  </div>
</template>

<script>
import API_BASE_URL from "@/services/api";
import StaffSidebar from "@/components/sidebar/staffSidebar.vue";
import ShiftCalendarPanel from "@/components/staff-shift/ShiftCalendarPanel.vue";
import axios from "axios";

export default {
  name: "StaffShift",
  components: { StaffSidebar, ShiftCalendarPanel },

  data() {
    return {
      myId:                null,
      selectedShift:       null,
      staffList:           [],
      shifts:              [],
      colleagueShifts:     [],
      swapRequests:        [],
      publicHolidays:      [],
      selectedColleagueId: null,
      loading:             false,
      loadingColleague:    false,

      isSwapMode:        false,
      targetSwapShift:   null,
      selectedMyShiftId: null,

      activeHubTab: "current", 
      currentPage: 1,
      itemsPerPage: 3,

      statusModal: {
        show: false,
        type: "confirm", 
        title: "",
        message: "",
        actionClass: "",
        onConfirm: null
      }
    };
  },

  computed: {
    todayDay() {
      return new Date().toLocaleDateString("en-US", { weekday: "long" });
    },
    todayDate() {
      return new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    },
    stats() {
      const now = new Date();
      const thisMonth = this.shifts.filter(s => {
        const d = new Date(s.startTime);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const totalHours = thisMonth.reduce((sum, s) => {
        return sum + (new Date(s.endTime) - new Date(s.startTime)) / 3600000;
      }, 0);
      return {
        totalThisMonth: thisMonth.length,
        morningCount:   thisMonth.filter(s => s.shiftType === "Morning").length,
        eveningCount:   thisMonth.filter(s => s.shiftType === "Evening").length,
        totalHours:      Math.round(totalHours),
      };
    },

    categorizedSwaps() {
      const current = [];
      const archive = [];
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      this.swapRequests.forEach(req => {
        const reqDate = new Date(req.shift_start);
        const isPastMonth = reqDate < currentMonthStart;
        
        if (isPastMonth || ["approved", "rejected", "cancelled"].includes(req.status?.toLowerCase())) {
          archive.push(req);
        } else {
          current.push(req);
        }
      });

      return { current, archive };
    },

    paginatedSwaps() {
      const activeList = this.categorizedSwaps[this.activeHubTab] || [];
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      return activeList.slice(startIndex, startIndex + this.itemsPerPage);
    },

    totalPages() {
      const activeList = this.categorizedSwaps[this.activeHubTab] || [];
      return Math.ceil(activeList.length / this.itemsPerPage) || 1;
    }
  },

  mounted() {
    this.fetchShifts();
  },

  methods: {
    setHubTab(tabName) {
      this.activeHubTab = tabName;
      this.currentPage = 1; 
    },

    showStatus(type, title, message, onConfirm = null, actionClass = "") {
      this.statusModal = {
        show: true,
        type,
        title,
        message,
        actionClass,
        onConfirm
      };
    },

    closeStatusModal() {
      this.statusModal.show = false;
    },

    async handleStatusConfirm() {
      if (typeof this.statusModal.onConfirm === "function") {
        await this.statusModal.onConfirm();
      }
    },

    onShiftClick(shiftProps) {
      this.selectedShift = shiftProps;
    },

    onShiftSelected(shiftProps) {
      this.selectedMyShiftId = this.selectedMyShiftId === shiftProps.id ? null : shiftProps.id;
    },

    initiateSwapMode(colleagueShift) {
      this.targetSwapShift   = colleagueShift;
      this.isSwapMode        = true;
      this.selectedShift     = null;
      this.selectedMyShiftId = null;
    },

    cancelSwapMode() {
      this.isSwapMode        = false;
      this.targetSwapShift   = null;
      this.selectedMyShiftId = null;
    },

    isShiftPendingSwap(shiftId) {
      return this.swapRequests.some(
        req =>
          (req.shift_id == shiftId || req.target_shift_id == shiftId) &&
          ["pending", "accepted"].includes(req.status?.toLowerCase())
      );
    },

    getColleagueName(id) {
      const staff = this.staffList.find(u => u.id == id);
      return staff ? staff.fullName : "Teammate";
    },

    getFriendlyStatusClass(status) {
      const s = status?.toLowerCase();
      if (s === "pending")   return "pending";
      if (s === "accepted")  return "accepted";
      if (s === "approved")  return "approved";
      if (s === "cancelled") return "cancelled";
      return "rejected";
    },

    getFriendlyStatusLabel(status, requesterId) {
      const s = status?.toLowerCase();
      if (s === "pending")   return requesterId == this.myId ? "Waiting for Peer" : "Action Required";
      if (s === "accepted")  return "Waiting Admin Approval";
      if (s === "approved")  return "Approved & Changed";
      if (s === "cancelled") return "Cancelled";
      return "Rejected";
    },

    triggerResponseConfirm(swapId, newStatus) {
      const actionText = newStatus === "accepted" ? "accept" : "reject";
      const actionClass = newStatus === "accepted" ? "confirm-accept" : "confirm-reject";
      
      this.showStatus(
        "confirm",
        "Respond to Proposal",
        `Are you sure you want to ${actionText} this shift swap proposal?`,
        () => this.respondToSwapRequest(swapId, newStatus),
        actionClass
      );
    },

    async respondToSwapRequest(swapId, newStatus) {
      try {
        this.loading = true;
        const token = localStorage.getItem("userToken") || localStorage.getItem("token");
        
        await axios.patch(`${API_BASE_URL}/api/swaps/${swapId}/respond`, { status: newStatus.toLowerCase() }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        this.showStatus(
          "success",
          "Response Saved",
          `You successfully ${newStatus} the trade request!`
        );
        await this.fetchShifts();
      } catch (err) {
        console.error("Failed to post response update:", err);
        const errMsg = err.response?.data?.message || "Error processing swap choice.";
        this.showStatus("fail", "Action Failed", errMsg);
      } finally {
        this.loading = false;
      }
    },

    triggerCancelConfirm(swapId) {
      this.showStatus(
        "confirm",
        "Cancel Swap Request",
        "Are you sure you want to retract and cancel this outward swap proposal?",
        () => this.executeSwapCancellation(swapId),
        "confirm-reject"
      );
    },

    async executeSwapCancellation(swapId) {
      try {
        this.loading = true;
        const token = localStorage.getItem("userToken") || localStorage.getItem("token");
        
        await axios.delete(`${API_BASE_URL}/api/swaps/${swapId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        this.showStatus("success", "Request Cancelled", "Your swap request has been cancelled successfully.");
        await this.fetchShifts();
      } catch (err) {
        console.error("Failed to cancel trade offer request:", err);
        const errMsg = err.response?.data?.message || "Error retracting request.";
        this.showStatus("fail", "Cancellation Failed", errMsg);
      } finally {
        this.loading = false;
      }
    },

    triggerSubmissionConfirm() {
      if (!this.selectedMyShiftId || !this.targetSwapShift) return;
      const chosenShift = this.shifts.find(s => s.id === this.selectedMyShiftId);
      if (!chosenShift) return;

      this.showStatus(
        "confirm",
        "Submit Swap Request",
        `Confirm swap proposal: Exchange your "${chosenShift.shiftType}" shift for ${this.targetSwapShift.ownerName}'s shift?`,
        () => this.executeSwapSubmission(),
        "confirm-accept"
      );
    },

    async executeSwapSubmission() {
      try {
        this.loading = true;
        const token = localStorage.getItem("token") || localStorage.getItem("userToken");
        await axios.post(`${API_BASE_URL}/api/swaps`, {
          targetId:     this.selectedColleagueId,
          shiftId:      this.selectedMyShiftId,
          targetShiftId: this.targetSwapShift.id,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });

        this.showStatus("success", "Submitted Successfully", "Swap request successfully submitted to your teammate!");
        this.cancelSwapMode();
        await this.fetchShifts();
      } catch (err) {
        console.error("Failed to complete swap submission workflow:", err);
        const errMsg = err.response?.data?.message || "Error submitting request.";
        this.showStatus("fail", "Submission Failed", errMsg);
      } finally {
        this.loading = false;
      }
    },

    async fetchSwapRequests() {
      try {
        const token = localStorage.getItem("userToken") || localStorage.getItem("token");
        if (!token) return;
        const { data } = await axios.get(`${API_BASE_URL}/api/swaps`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const rawSwaps = Array.isArray(data) ? data : [];
        this.swapRequests = this.myId
          ? rawSwaps.filter(req => req.requester_id == this.myId || req.target_id == this.myId)
          : rawSwaps;
      } catch (err) {
        console.error("Could not fetch progress metrics for active swaps:", err);
      }
    },

    async fetchShifts() {
      this.loading = true;
      try {
        const token = localStorage.getItem("userToken") || localStorage.getItem("token");
        if (!token) return;

        const payload = JSON.parse(atob(token.split(".")[1]));
        this.myId = payload.id;

        await this.fetchSwapRequests();

        try {
          const year = new Date().getFullYear();
          const [holidayRes] = await Promise.all([
            fetch(`https://sabah-holiday.dydxsoft.my/api/selangor/${year}.json`),
          ]);
          if (holidayRes.ok) {
            const raw = await holidayRes.json();
            this.publicHolidays = Array.isArray(raw) ? raw : (raw.holidays ?? raw.data ?? []);
          } else {
            this.publicHolidays = [];
          }
        } catch (err) {
          console.warn("Holiday API failed gracefully:", err);
          this.publicHolidays = [];
        }

        const { data: shiftsData } = await axios.get(`${API_BASE_URL}/api/shifts/staff/me`);

        const shiftsWithAttendance = await Promise.all(
          shiftsData.map(async shift => {
            try {
              const { data: attendanceLogs } = await axios.get(
                `${API_BASE_URL}/api/attendance/shift/${shift.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const log = attendanceLogs[0] || {};
              return { ...shift, actualCheckIn: log.checkIn || null, actualCheckOut: log.checkOut || null, status: log.status || "Pending" };
            } catch {
              return { ...shift, actualCheckIn: null, actualCheckOut: null, status: "Pending" };
            }
          })
        );
        this.shifts = shiftsWithAttendance;

        try {
          const { data: users } = await axios.get(`${API_BASE_URL}/api/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          this.staffList = users.filter(u => u.role === "staff" && u.status === "active" && u.id !== this.myId);
        } catch { /* Fallback */ }
      } catch (err) {
        console.error("Error fetching shifts:", err);
      } finally {
        this.loading = false;
      }
    },

    async onColleagueChange(newId) {
      this.selectedColleagueId = newId;
      if (!newId) {
        this.colleagueShifts = [];
        return;
      }
      this.loadingColleague = true;
      try {
        const token = localStorage.getItem("userToken") || localStorage.getItem("token");
        const { data } = await axios.get(`${API_BASE_URL}/api/shifts/staff/${newId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.colleagueShifts = data;
      } catch (err) {
        console.error("Could not fetch teammate schedules:", err);
        this.colleagueShifts = [];
      } finally {
        this.loadingColleague = false;
      }
    },

    formatDate(dt) {
      return new Date(dt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    },
    formatTime(dt) {
      return new Date(dt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    },
    getDuration(start, end) {
      return `${(new Date(end) - new Date(start)) / 3600000}h`;
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500;600&family=DM+Sans:opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.app-layout { display: flex; min-height: 100vh; background: #f6f7fb; font-family: 'DM Sans', sans-serif; color: #1e293b; }
.page { flex: 1; padding: 20px 16px 40px; display: flex; flex-direction: column; gap: 16px; overflow-x: hidden; position: relative; }

.topbar { display: flex; flex-direction: column; gap: 10px; }
.topbar-date  { font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
.topbar-title { font-size: 22px; font-weight: 600; letter-spacing: -.025em; color: #0f172a; }
.topbar-title .accent { color: #6366f1; }
.topbar-right { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }

.legend { display: flex; gap: 12px; align-items: center; }
.legend-item { font-family: 'DM Mono', monospace; font-size: 0.7rem; display: flex; align-items: center; gap: 6px; color: #64748b; letter-spacing: 0.03em; }
.legend-dot { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
.legend-item.morning .legend-dot { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
.legend-item.evening .legend-dot { background: linear-gradient(135deg, #5b21b6, #8b5cf6); }
.legend-item.colleague .legend-dot { background: #f3e8ff; border: 1px dashed #64748b; }
.legend-dot.holiday-dot { background-color: #fef2f2; border: 1px solid #dc2626; }
.legend-item.holiday-legend { color: #dc2626; font-weight: 500; }

.live-dot { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #10b981; font-weight: 500; }
.pulse { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: block; animation: pulse 1.8s ease infinite; }
@keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,.5); } 50% { box-shadow: 0 0 0 6px rgba(16,185,129,0); } }

/* ── UPDATED RESPONSIVE 1X4 COLUMN LAYOUT ── */
/* ── FORCE 1X4 HORIZONTAL FLEXBOX ROW LAYOUT ── */
.summary-row { 
  display: flex !important;
  flex-direction: row !important;
  flex-wrap: nowrap !important; /* Prevents elements from breaking into a second line */
  gap: 14px !important; 
  width: 100% !important;
}

.summary-card { 
  flex: 1 1 0% !important; /* Forces all 4 cards to take exactly 25% equal space width */
  min-width: 0 !important; /* Fixes text clipping calculations inside flexbox items */
  background: #fff; 
  border: 1px solid #f1f5f9; 
  border-radius: 14px; 
  padding: 14px 16px; 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  box-shadow: 0 1px 3px rgba(0,0,0,.04); 
  animation: fadeUp .35s ease both; 
  transition: all .15s; 
}
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.summary-icon { width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.summary-val { font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -.03em; line-height: 1; margin-bottom: 3px; }
.summary-unit { font-size: 14px; font-weight: 500; color: #94a3b8; margin-left: 2px; }
.summary-label { font-size: 11px; color: #94a3b8; white-space: nowrap; }

.progress-panel { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 1px 4px rgba(0,0,0,.02); }
.panel-header-row { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
.panel-header { display: flex; flex-direction: column; }
.panel-title { font-size: 14px; font-weight: 600; color: #0f172a; }
.panel-sub { font-size: 12px; color: #94a3b8; }

.hub-tabs { display: flex; gap: 4px; background: #f1f5f9; padding: 4px; border-radius: 8px; }
.tab-btn { background: transparent; border: none; font-size: 11px; font-weight: 600; color: #64748b; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s ease; }
.tab-btn.active { background: #ffffff; color: #0f172a; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }

.progress-list { display: flex; flex-direction: column; gap: 8px; max-height: 280px; overflow-y: auto; }
.progress-card { display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 10px; padding: 12px 14px; gap: 12px; }
.progress-card-main { display: flex; align-items: center; gap: 14px; flex: 1; }
.swap-participants { display: flex; align-items: center; gap: 6px; }
.participant-badge { font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
.participant-badge.me    { background: #eef2ff; color: #6366f1; }
.participant-badge.staff { background: #f1f5f9; color: #475569; }
.swap-arrow { font-size: 11px; color: #94a3b8; }
.swap-info-text { font-size: 12px; color: #334155; line-height: 1.4; }
.peer-action-buttons { display: flex; gap: 6px; }

.btn-action-accept { background: #10b981; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-action-accept:hover { background: #059669; }
.btn-action-reject { background: #ef4444; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-action-reject:hover { background: #dc2626; }
.btn-action-cancel { background: #64748b; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-action-cancel:hover { background: #475569; }

.empty-hub-state { text-align: center; font-size: 12px; color: #94a3b8; padding: 24px; font-style: italic; }

.hub-pagination-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 8px; border-top: 1px solid #f1f5f9; margin-top: 4px; }
.btn-page-nav { background: #ffffff; border: 1px solid #e2e8f0; color: #475569; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
.btn-page-nav:disabled { opacity: 0.4; cursor: not-allowed; }
.btn-page-nav:not(:disabled):hover { background: #f8fafc; border-color: #cbd5e1; }
.page-counter { font-size: 11px; font-weight: 600; color: #64748b; font-family: 'DM Mono', monospace; }

.status-indicator { display: inline-flex; align-items: center; gap: 6px; font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; }
.status-indicator.pending  { background: #fff7ed; color: #c2410c; }
.status-indicator.pending .status-dot  { background: #c2410c; }
.status-indicator.accepted { background: #f0fdf4; color: #16a34a; }
.status-indicator.accepted .status-dot { background: #16a34a; }
.status-indicator.approved { background: #eff6ff; color: #2563eb; }
.status-indicator.approved .status-dot { background: #2563eb; }
.status-indicator.cancelled { background: #f1f5f9; color: #64748b; }
.status-indicator.cancelled .status-dot { background: #64748b; }
.status-indicator.rejected { background: #fef2f2; color: #dc2626; }
.status-indicator.rejected .status-dot { background: #dc2626; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; }

.animate-pop { animation: popIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
@keyframes popIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.modal-card { background: #fff; width: 100%; overflow: hidden; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15); }
.main-shift-modal { max-width: 520px; border-radius: 12px; }

.modal-header { padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; }
.modal-header.morning          { background: linear-gradient(135deg, #f59e0b, #fbbf24); color: #854d0e; }
.modal-header.evening          { background: linear-gradient(135deg, #5b21b6, #8b5cf6); color: #ede9fe; }
.modal-header.colleague-header { background: linear-gradient(135deg, #475569, #64748b); color: #f8fafc; }
.modal-shift-type { font-weight: 600; font-size: 15px; }
.modal-close { background: none; border: none; font-size: 18px; cursor: pointer; opacity: 0.7; line-height: 1; }
.modal-body { padding: 16px 20px 28px; display: flex; flex-direction: column; }
.modal-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 14px 0; border-bottom: 1px solid #f1f5f9; }
.modal-row:last-child { border-bottom: none; }
.modal-field { font-family: 'DM Mono', monospace; font-size: 0.68rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
.modal-value { font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #0f172a; font-weight: 500; text-align: right; }
.modal-footer-actions { padding: 14px 20px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; background-color: #f8fafc; }

.swap-pending-alert { font-size: 13px; font-weight: 500; color: #d97706; background-color: #fffbeb; border: 1px solid #fde68a; padding: 8px 14px; border-radius: 8px; width: 100%; text-align: center; }
.btn-swap { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; color: #475569; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; }
.btn-swap:hover { background: #6366f1; border-color: #6366f1; color: #fff; }

.status-modal-card { max-width: 400px !important; border-radius: 16px !important; margin: auto; }
.status-modal-body { padding: 32px 24px; text-align: center; display: flex; flex-direction: column; align-items: center; }
.status-icon-wrapper { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 16px; }
.status-icon-wrapper.confirm { background-color: #eff6ff; }
.status-icon-wrapper.success { background-color: #f0fdf4; }
.status-icon-wrapper.fail    { background-color: #fef2f2; }

.status-title { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 8px; }
.status-message { font-size: 14px; color: #64748b; line-height: 1.5; margin-bottom: 24px; }
.status-actions { display: flex; gap: 12px; width: 100%; justify-content: center; }
.btn-status-close, .btn-status-confirm, .btn-status-cancel { flex: 1; padding: 10px 16px; font-size: 14px; font-weight: 600; border-radius: 8px; cursor: pointer; transition: all 0.15s ease; font-family: 'DM Sans', sans-serif; }
.btn-status-close { background: #0f172a; color: #fff; border: none; max-width: 160px; }
.btn-status-close:hover { background: #1e293b; }
.btn-status-cancel { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
.btn-status-cancel:hover { background: #e2e8f0; }
.btn-status-confirm { color: #fff; border: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
.btn-status-confirm.confirm-accept { background: #6366f1; }
.btn-status-confirm.confirm-reject { background: #ef4444; }

/* Responsive Media Query for smaller desktop viewports and mobile screens */
@media (max-width: 1024px) {
  .summary-row { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 576px) {
  .modal-overlay { align-items: flex-end; padding: 0; }
  .main-shift-modal { max-width: 100%; border-radius: 16px 16px 0 0; }
  .summary-row { grid-template-columns: 1fr; }
}
</style>