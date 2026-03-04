<template>
  <div class="page-wrapper">
    <StaffSidebar />

    <main class="content">
      <div class="container">
        <header class="header">
          <h1>My Payroll - {{ userName }}</h1>
          <p>View your monthly earnings and payment status</p>
        </header>

        <!-- Loading state -->
        <div v-if="loading" class="loader">Loading payroll data...</div>

        <!-- Payroll exists -->
        <div v-else-if="payrollData.length > 0">
          <CurrentPayrollCard 
            :fullName="userName"
            :currentMonth="formatMonth(payrollData[0].month)"
            :hoursWorked="parseFloat(payrollData[0].hoursWorked)"
            :hourlyRate="userHourlyRate"
            :isReceived="!!payrollData[0].isReceived"
          />

          <PayrollHistoryTable 
            :history="payrollData.slice(1)" 
            :hourlyRate="userHourlyRate"
            @download="handleDownload"
          />
        </div>

        <!-- Empty state -->
        <div v-else class="empty-state">
          No payroll records found.
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import StaffSidebar from "@/components/sidebar/staffSidebar.vue"
import CurrentPayrollCard from '@/components/staff-payroll/CurrentPayrollCard.vue'
import PayrollHistoryTable from '@/components/staff-payroll/PayrollHistoryTable.vue'
import axios from 'axios'

export default {
  name: 'StaffPayroll',
  components: { 
    StaffSidebar, 
    CurrentPayrollCard, 
    PayrollHistoryTable 
  },
  data() {
    return {
      payrollData: [],
      userName: '',           // Will come from DB
      userHourlyRate: 25.00,  // Can make dynamic later
      loading: true
    }
  },
  methods: {
async fetchPayroll() {
  try {
    this.loading = true;
    const token = localStorage.getItem('userToken');
    const response = await axios.get('http://localhost:3000/api/payroll/my-records', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (Array.isArray(response.data) && response.data.length > 0) {
      this.payrollData = response.data.sort((a, b) => new Date(b.month) - new Date(a.month));
      this.userName = this.payrollData[0].fullName;
    } else if (response.data.message) {
      // Backend says no records
      console.warn('Payroll API message:', response.data.message);
      this.payrollData = [];
      this.userName = 'Employee';
    } else {
      this.payrollData = [];
      this.userName = 'Employee';
    }

  } catch (error) {
    console.error('Error fetching payroll:', error);
    this.payrollData = [];
    this.userName = 'Employee';
  } finally {
    this.loading = false;
  }
},
    formatMonth(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    },
    handleDownload(id) {
      console.log('Downloading payroll PDF for ID:', id);
      // Implement PDF download logic from backend
    }
  },
  mounted() {
    this.fetchPayroll();
  }
}
</script>

<style scoped>
.page-wrapper {
  display: flex;
  background-color: #f4f7f9;
  min-height: 100vh;
}

.content {
  flex-grow: 1;
  padding: 40px;
  margin-left: 250px; /* Width of your sidebar */
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.header {
  margin-bottom: 30px;
}

.header h1 {
  font-size: 24px;
  color: #333;
  margin-bottom: 5px;
}

.header p {
  color: #666;
}

.loader, .empty-state {
  text-align: center;
  padding: 50px;
  background: white;
  border-radius: 12px;
  color: #888;
}
</style>