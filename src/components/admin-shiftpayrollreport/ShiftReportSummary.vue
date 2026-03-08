<template>
  <div class="summary-section">
    <div class="summary-grid">
      <div v-for="card in cards" :key="card.label" class="summary-card">
        <div class="card-icon" :style="{ background: card.color + '18', color: card.color }">
          <!-- users -->
          <svg v-if="card.icon==='users'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
          </svg>
          <!-- clock -->
          <svg v-else-if="card.icon==='clock'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <!-- check -->
          <svg v-else-if="card.icon==='check'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <!-- alert -->
          <svg v-else-if="card.icon==='alert'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <!-- dollar -->
          <svg v-else-if="card.icon==='dollar'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
          </svg>
          <!-- percent -->
          <svg v-else-if="card.icon==='percent'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="5" x2="5" y2="19"/>
            <circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
          </svg>
        </div>
        <div class="card-body">
          <p class="card-val" :style="{ color: card.color }">{{ card.value }}</p>
          <p class="card-label">{{ card.label }}</p>
          <p v-if="card.sub" class="card-sub">{{ card.sub }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShiftReportSummary',
  props: { cards: Array },
}
</script>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
}
.summary-card {
  background: #f8fafc; border-radius: 12px; border: 1.5px solid #f1f5f9;
  padding: 16px 14px; display: flex; align-items: flex-start; gap: 12px;
}
.card-icon {
  width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.card-val   { font-size: 21px; font-weight: 700; line-height: 1.1; }
.card-label { font-size: 11.5px; color: #64748b; font-weight: 500; margin-top: 3px; }
.card-sub   { font-size: 10.5px; color: #94a3b8; margin-top: 2px; }

@media print {
  .summary-card { padding: 8px 10px; }
  .card-val   { font-size: 13pt; }
  .card-label { font-size: 7.5pt; }
  .card-sub   { font-size: 7pt; }
  .card-icon  { width: 28px; height: 28px; }
}
</style>