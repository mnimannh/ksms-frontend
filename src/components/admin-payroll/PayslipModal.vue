<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content payslip-container">
        
        <div class="action-bar no-print">
          <button class="btn-ghost" @click="$emit('close')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Close
          </button>
          <button class="btn-primary" @click="printPayslip">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print Payslip
          </button>
        </div>

        <div class="payslip-paper">
          
          <header class="payslip-header">
            <div class="school-info">
              <h2>Koperasi Kolej Vokasional Shah Alam</h2>
              <p>Jalan Batu Tiga Lama, Shah Alam</p>
              <p>Tel: 088-123456 | Email: coop@smkxyz.edu.my</p>
            </div>
            <div class="payslip-title">
              <h1>PAYSLIP</h1>
            </div>
          </header>

          <div class="meta-grid">
            <div class="meta-item"><span>Payslip No:</span> <strong>{{ payslip.payslipNo || 'N/A' }}</strong></div>
            <div class="meta-item"><span>Payroll Month:</span> <strong>{{ payslip.monthLabel }}</strong></div>
            <div class="meta-item"><span>Generated On:</span> <strong>{{ payslip.generatedDate }}</strong></div>
            <div class="meta-item"><span>Payment Date:</span> <strong>{{ payslip.paymentDate || 'Pending' }}</strong></div>
          </div>

          <hr class="divider" />

          <div class="info-split">
<div class="info-block">
  <h3>Employee Information</h3>

  <table class="info-table">
    <tbody>
      <tr>
        <td>Name</td>
        <td>: <strong>{{ payslip.staffName }}</strong></td>
      </tr>

      <tr>
        <td>Role</td>
        <td>: {{ payslip.role || 'Staff' }}</td>
      </tr>

      <tr>
        <td>Class</td>
        <td>: {{ payslip.className || 'N/A' }}</td>
      </tr>
    </tbody>
  </table>
</div>

<div class="info-block">
  <h3>Employment Details</h3>

  <table class="info-table">
    <tbody>
      <tr>
        <td>Pay Type</td>
        <td>: Hourly</td>
      </tr>

      <tr>
        <td>Hourly Rate</td>
        <td>: RM {{ formatMoney(payslip.hourlyRate) }}</td>
      </tr>

      <tr>
        <td>Total Hours</td>
        <td>: {{ payslip.hoursWorked }} hrs</td>
      </tr>

      <tr>
        <td>Shifts Completed</td>
        <td>: {{ payslip.completedShifts }}</td>
      </tr>
    </tbody>
  </table>
</div>
          </div>

          <div class="financial-section">
            <table class="financial-table">
              <thead>
                <tr>
                  <th>Earnings</th>
                  <th class="num">Amount (RM)</th>
                  <th>Deductions</th>
                  <th class="num">Amount (RM)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Basic Pay ({{ payslip.hoursWorked }} hrs × {{ formatMoney(payslip.hourlyRate) }})</td>
                  <td class="num">{{ formatMoney(basicPay) }}</td>
                  <td>EPF</td>
                  <td class="num">0.00</td>
                </tr>
                <tr>
                  <td>Overtime / Allowance</td>
                  <td class="num">{{ formatMoney(payslip.allowance || 0) }}</td>
                  <td>SOCSO / Tax</td>
                  <td class="num">0.00</td>
                </tr>
                <tr>
                  <td></td><td></td>
                  <td>Other Deductions</td>
                  <td class="num">{{ formatMoney(payslip.deductions || 0) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>Gross Pay</strong></td>
                  <td class="num"><strong>{{ formatMoney(grossPay) }}</strong></td>
                  <td><strong>Total Deductions</strong></td>
                  <td class="num"><strong>{{ formatMoney(payslip.deductions || 0) }}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div class="net-pay-box">
            <span>NET PAY</span>
            <span class="net-amount">RM {{ formatMoney(netPay) }}</span>
          </div>

          <div class="payment-info">
            <p><strong>Payment Method:</strong> {{ payslip.paymentMethod || 'Cash' }}</p>
            <p><strong>Status:</strong> <span class="badge" :class="payslip.status">{{ payslip.status }}</span></p>
          </div>

          <div class="acknowledgement">
            <p>I confirm that I have received the payment stated above.</p>
            <div class="signatures">
              <div class="sig-box">
                <div class="sig-line"></div>
                <span>Authorized Admin Signature</span>
                <span class="date-line">Date:</span>
              </div>
              <div class="sig-box">
                <div class="sig-line"></div>
                <span>Student / Receiver Signature</span>
                <span class="date-line">Date:</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
export default {
  name: 'PayslipModal',
  props: {
    show: { type: Boolean, default: false },
    payslip: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    basicPay() {
      return (Number(this.payslip.hoursWorked || 0) * Number(this.payslip.hourlyRate || 0));
    },
    grossPay() {
      return this.basicPay + Number(this.payslip.allowance || 0);
    },
    netPay() {
      return this.grossPay - Number(this.payslip.deductions || 0);
    }
  },
  methods: {
    formatMoney(val) {
      return Number(val || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    printPayslip() {
      window.print();
    }
  }
}
</script>

<style scoped>
/* ── Overlay & Modal Base ── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px); display: flex; align-items: flex-start;
  justify-content: center; z-index: 9999; padding: 20px;
  overflow-y: auto; font-family: 'DM Sans', sans-serif;
}
.modal-content {
  background: #f8fafc; border-radius: 12px;
  width: 100%; max-width: 800px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  margin-top: 20px; margin-bottom: 40px; overflow: hidden;
}
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; transform: translateY(-10px); }

/* ── UI Action Bar ── */
.action-bar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 24px; background: #fff; border-bottom: 1px solid #e2e8f0;
}
.btn-primary, .btn-ghost {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 16px; border-radius: 8px; font-weight: 600;
  font-size: 13.5px; cursor: pointer; transition: 0.15s; border: none;
}
.btn-primary { background: #6366f1; color: #fff; }
.btn-primary:hover { background: #4f46e5; }
.btn-ghost { background: #f1f5f9; color: #475569; }
.btn-ghost:hover { background: #e2e8f0; }

/* ── Printable Paper Area ── */
.payslip-paper { background: #fff; padding: 40px; color: #0f172a; }
.payslip-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.school-info h2 { font-size: 20px; margin: 0 0 4px 0; color: #1e293b; }
.school-info p { margin: 2px 0; font-size: 13px; color: #64748b; }
.payslip-title h1 { font-size: 28px; font-weight: 700; letter-spacing: 0.05em; color: #cbd5e1; margin: 0; text-transform: uppercase; }

.meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.meta-item { display: flex; flex-direction: column; gap: 4px; font-size: 13px; }
.meta-item span { color: #64748b; font-size: 11px; text-transform: uppercase; font-weight: 600; }
.meta-item strong { color: #0f172a; }

.divider { border: 0; border-top: 1px dashed #cbd5e1; margin: 24px 0; }

.info-split { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 32px; }
.info-block h3 { font-size: 14px; color: #475569; margin-bottom: 12px; border-bottom: 2px solid #6366f1; display: inline-block; padding-bottom: 4px; }
.info-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.info-table td { padding: 4px 0; color: #334155; }
.info-table td:first-child { width: 120px; color: #64748b; }

.financial-section { margin-bottom: 24px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.financial-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13.5px; }
.financial-table th { background: #f8fafc; padding: 12px 16px; font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0; }
.financial-table td { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; }
.financial-table .num { text-align: right; font-family: 'DM Mono', monospace; }
.financial-table tfoot td { background: #f8fafc; border-top: 1px solid #cbd5e1; border-bottom: none; }

.net-pay-box {
  display: flex; justify-content: space-between; align-items: center;
  background: #f1f5f9; border: 1px solid #cbd5e1; border-left: 4px solid #6366f1;
  padding: 16px 24px; border-radius: 8px; margin-bottom: 32px;
}
.net-pay-box span:first-child { font-weight: 700; color: #475569; font-size: 14px; letter-spacing: 0.05em; }
.net-amount { font-size: 24px; font-weight: 700; color: #0f172a; font-family: 'DM Mono', monospace; }

.payment-info { font-size: 13px; margin-bottom: 40px; display: flex; gap: 24px; }
.badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
.badge.Paid { background: #f0fdf4; color: #15803d; }
.badge.Pending { background: #fffbeb; color: #b45309; }

.acknowledgement { border-top: 1px solid #e2e8f0; padding-top: 24px; font-size: 13px; color: #64748b; }
.signatures { display: flex; justify-content: space-between; margin-top: 60px; }
.sig-box { width: 250px; text-align: center; }
.sig-line { border-top: 1px solid #0f172a; margin-bottom: 8px; }
.sig-box span { display: block; font-size: 12px; }
.date-line { margin-top: 16px; text-align: left; padding-left: 10px; }

/* ── Print Styles ── */
@media print {
  @page { size: A4; margin: 0; }
  body * { visibility: hidden; }
  .modal-overlay { position: absolute; left: 0; top: 0; background: transparent; padding: 0; }
  .modal-content { box-shadow: none; border-radius: 0; width: 100%; margin: 0; }
  .payslip-paper, .payslip-paper * { visibility: visible; }
  .payslip-paper { position: absolute; left: 0; top: 0; width: 100%; padding: 2cm; margin: 0; }
  .no-print { display: none !important; }
}
</style>