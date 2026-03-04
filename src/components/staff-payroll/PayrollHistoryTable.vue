<template>
  <div class="history-container">
    <h4>Previous Months</h4>
    <table class="payroll-table">
      <thead>
        <tr>
          <th>Month</th>
          <th>Hours</th>
          <th>Rate</th>
          <th>Gross Pay</th>
          <th>Status</th>
          <th>Created By</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in history" :key="record.id">
          <td>{{ formatDate(record.month) }}</td>
          <td>{{ record.hoursWorked }}</td>
          <td>${{ hourlyRate }}</td>
          <td>${{ (record.hoursWorked * hourlyRate).toFixed(2) }}</td>
          <td>
            <span :class="['status-pill', record.isReceived ? 'paid' : 'pending']">
              {{ record.isReceived ? 'Received' : 'Pending' }}
            </span>
          </td>
          <td>
            
          </td>
          <td>
            <button @click="$emit('download', record.id)" class="btn-pdf">
              📄 Download PDF
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  history: Array,
  hourlyRate: Number
});

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};
</script>

<style scoped>
.payroll-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; }
th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
.status-pill { padding: 4px 12px; border-radius: 20px; font-size: 12px; }
.paid { background: #e6ffed; color: #28a745; }
.pending { background: #fff3cd; color: #856404; }
.btn-pdf { background: #007bff; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
</style>