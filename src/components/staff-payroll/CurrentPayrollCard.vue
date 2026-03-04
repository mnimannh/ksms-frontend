<template>
  <div class="payroll-card">
    <div class="card-content">
      <div class="info-section">
        <h3>Welcome, {{ fullName }}</h3>
        <p class="subtitle">{{ currentMonth }} Paycheck Details</p>
        <hr />
        <div class="stats">
          <div class="stat-row">
            <span>Total Hours Worked</span>
            <span class="value">{{ hoursWorked }}</span>
          </div>
          <div class="stat-row">
            <span>Hourly Rate</span>
            <span class="value">${{ hourlyRate.toFixed(2) }}</span>
          </div>
          <div class="stat-row total">
            <span>Gross Pay</span>
            <span class="value">${{ (hoursWorked * hourlyRate).toFixed(2) }}</span>
          </div>
        </div>
      </div>
      <div class="status-badge" :class="{ received: isReceived }">
        <span class="status-label">Status:</span>
        <span class="status-text">{{ isReceived ? 'Received' : 'Pending' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  fullName: String,
  currentMonth: String,
  hoursWorked: Number,
  hourlyRate: Number,
  isReceived: Boolean
});
</script>

<style scoped>
.payroll-card {
  background: linear-gradient(135deg, #2575fc 0%, #6a11cb 100%);
  color: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
.stat-row { display: flex; justify-content: space-between; margin: 8px 0; }
.total { font-weight: bold; border-top: 1px solid rgba(255,255,255,0.3); pt: 8px; }
.status-badge { 
  background: rgba(255,255,255,0.2); 
  border-radius: 50%; 
  width: 100px; height: 100px; 
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.status-badge.received { background: #28a745; border: 2px solid white; }
</style>