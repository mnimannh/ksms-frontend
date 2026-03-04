<template>
  <div class="layout">
    <StaffSidebar />

    <div class="calendar-container">
      <h2>Staff Shift Schedule</h2>

      <FullCalendar
        :plugins="calendarPlugins"
        initial-view="dayGridMonth"
        :events="shifts"
        @event-click="handleEventClick"
        :header-toolbar="{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        }"
      />

      <!-- Modal -->
      <div v-if="selectedShift" class="modal">
        <div class="modal-content">
          <h3>Shift on {{ selectedShift.date }}</h3>
          <p>{{ selectedShift.title }}</p>
          <button @click="selectedShift = null">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import StaffSidebar from "@/components/sidebar/staffSidebar.vue"
import FullCalendar from "@fullcalendar/vue3"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin from "@fullcalendar/interaction"

export default {
  name: "StaffShift",
  components: { StaffSidebar, FullCalendar },
  data() {
    return {
      calendarPlugins: [dayGridPlugin, interactionPlugin],
      selectedShift: null,
      // 🔥 Hardcoded shifts for now
      shifts: [
        { title: "9AM - 5PM", date: "2026-03-01" },
        { title: "OFF", date: "2026-03-03" },
        { title: "1PM - 9PM", date: "2026-03-04" },
        { title: "9AM - 5PM", date: "2026-03-06" },
        { title: "OFF", date: "2026-03-08" },
        { title: "9AM - 5PM", date: "2026-03-09" },
        { title: "1PM - 9PM", date: "2026-03-11" }
      ]
    }
  },
  methods: {
    handleEventClick(info) {
      // info.event has the clicked shift
      this.selectedShift = {
        title: info.event.title,
        date: info.event.startStr
      }
    }
  }
}
</script>

<style scoped>
.layout {
  display: flex;
}

.calendar-container {
  padding: 20px;
  width: 100%;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);

  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
}
</style>