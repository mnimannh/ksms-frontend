<template>
  <div class="barcode-page">

    <!-- Loading -->
    <div v-if="loading" class="state-screen">
      <div class="spinner" />
      <p>Loading variant...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-screen error">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>{{ error }}</p>
      <button class="btn-back" @click="goBack">Go Back</button>
    </div>

    <!-- Main Content -->
    <template v-else>
      <div class="toolbar no-print">
        <div class="toolbar-left">
          <button class="btn-back" @click="goBack">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back
          </button>
          <div class="toolbar-info">
            <p class="tb-title">Barcode Sheet</p>
            <p class="tb-sub">{{ variant.variant_name }} · {{ inventoryName }}</p>
          </div>
        </div>
        <div class="toolbar-right">
          <div class="size-tabs">
            <button
              v-for="s in sizes"
              :key="s.value"
              class="size-btn"
              :class="{ active: labelSize === s.value }"
              @click="labelSize = s.value"
            >
              {{ s.label }}
              <span class="size-dim">{{ s.dim }}</span>
              <span class="size-count">{{ s.count }} per page</span>
            </button>
          </div>
          <button class="btn-print" @click="printPage">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print / Save PDF
          </button>
        </div>
      </div>

      <div class="barcode-grid" :class="`size-${labelSize}`">
        <div
          v-for="n in currentSize.count"
          :key="n"
          class="barcode-label"
        >
          <p class="lbl-product">{{ inventoryName }}</p>
          <p class="lbl-variant">{{ variant.variant_name }}</p>
          <svg :id="`bc-${n}`" class="lbl-svg" />
          <p class="lbl-code">{{ variant.barcode }}</p>
          <p class="lbl-price">RM {{ fmt(variant.price) }}</p>
        </div>
      </div>
    </template>

  </div>
</template>

<script>
import axios from 'axios'
import API_BASE_URL from '@/services/api'

export default {
  name: 'BarcodeSheet',

  data() {
    const query = this.$route?.query || {}
    const stored = sessionStorage.getItem('barcodeVariant')
    const variant = stored ? JSON.parse(stored) : null

    return {
      variant,
      inventoryName:     query.inventoryName      || '',
      returnCategoryId:  query._returnCategoryId  || null,
      returnInventoryId: query._returnInventoryId || null,

      loading: !variant,  // only fetch from API if no sessionStorage data
      error:   null,

      labelSize: 'md',
      sizes: [
        { value: 'lg', label: 'Large',  dim: '90×50mm',  count: 12 },
        { value: 'md', label: 'Medium', dim: '57×32mm',  count: 24 },
        { value: 'sm', label: 'Small',  dim: '38×19mm',  count: 70 },
      ],
    }
  },

  computed: {
    currentSize() {
      return this.sizes.find(s => s.value === this.labelSize)
    },
  },

  watch: {
    labelSize() {
      this.$nextTick(() => this.renderBarcodes())
    },
  },

  async mounted() {
    // If no variant from state (e.g. page refresh), fetch from API using variantId query param
    if (!this.variant) {
      const variantId = this.$route?.query?.variantId
      if (!variantId) {
        this.error = 'No variant data found. Please go back and try again.'
        this.loading = false
        return
      }
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/variants/${variantId}`)
        this.variant = data
        // Also fetch inventoryName if not in query
        if (!this.inventoryName && data.inventory_id) {
          const { data: inv } = await axios.get(`${API_BASE_URL}/api/inventory/${data.inventory_id}`)
          this.inventoryName = inv.inventoryName || ''
        }
      } catch (err) {
        this.error = 'Failed to load variant. Please go back and try again.'
      } finally {
        this.loading = false
      }
    }

    await this.loadJsBarcode()
    this.$nextTick(() => this.renderBarcodes())
  },

  methods: {
    printPage() {
      const name = `${this.inventoryName}-${this.variant.variant_name}-barcode`
      const oldTitle = document.title
      document.title = name
      window.print()
      setTimeout(() => { document.title = oldTitle }, 1000)
    },

    goBack() {
      this.$router.push({
        name: 'AdminInventory',
        query: {
          _returnCategoryId:  this.returnCategoryId,
          _returnInventoryId: this.returnInventoryId,
        },
      })
    },

    loadJsBarcode() {
      return new Promise(resolve => {
        if (window.JsBarcode) { resolve(); return }
        const s = document.createElement('script')
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.5/JsBarcode.all.min.js'
        s.onload = resolve
        document.head.appendChild(s)
      })
    },

    renderBarcodes() {
      if (!window.JsBarcode || !this.variant) return
      const cfg = {
        sm: { width: 0.9, height: 18 },
        md: { width: 1.3, height: 34 },
        lg: { width: 1.8, height: 52 },
      }[this.labelSize]

      for (let n = 1; n <= this.currentSize.count; n++) {
        const el = document.getElementById(`bc-${n}`)
        if (!el) continue
        try {
          window.JsBarcode(el, this.variant.barcode, {
            format:       'CODE128',
            width:        cfg.width,
            height:       cfg.height,
            displayValue: false,
            margin:       2,
            background:   '#ffffff',
            lineColor:    '#1e293b',
          })
        } catch (e) {
          console.warn('Barcode render error:', e)
        }
      }
    },

    fmt(val) {
      return Number(val).toLocaleString('en-MY', {
        minimumFractionDigits: 2, maximumFractionDigits: 2,
      })
    },
  },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
</style>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.barcode-page {
  min-height: 100vh;
  background: #eef0f5;
  font-family: 'DM Sans', sans-serif;
}

/* ── Loading / Error ── */
.state-screen {
  min-height: 100vh;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 14px; color: #64748b; font-size: 14px;
}
.state-screen.error { color: #ef4444; }
.spinner {
  width: 32px; height: 32px; border-radius: 50%;
  border: 3px solid #e2e8f0; border-top-color: #6366f1;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Toolbar ── */
.toolbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 32px;
  background: #fff; border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap; gap: 12px;
  position: sticky; top: 0; z-index: 10;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
.toolbar-left  { display: flex; align-items: center; gap: 16px; }
.toolbar-right { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }

.btn-back {
  display: flex; align-items: center; gap: 5px;
  padding: 7px 12px; border: 1px solid #e2e8f0; border-radius: 8px;
  background: #fff; font-size: 13px; font-family: 'DM Sans', sans-serif;
  font-weight: 500; color: #475569; cursor: pointer; transition: all .15s;
}
.btn-back:hover { border-color: #6366f1; color: #6366f1; }

.tb-title { font-size: 15px; font-weight: 700; color: #0f172a; }
.tb-sub   { font-size: 12px; color: #94a3b8; margin-top: 1px; }

.size-tabs {
  display: flex; background: #f8fafc;
  border: 1px solid #e2e8f0; border-radius: 10px;
  padding: 3px; gap: 2px;
}
.size-btn {
  display: flex; flex-direction: column; align-items: center;
  padding: 7px 16px; border: none; border-radius: 7px;
  background: transparent; font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 500; color: #64748b;
  cursor: pointer; transition: all .15s; line-height: 1.3;
}
.size-btn.active {
  background: #fff; color: #6366f1; font-weight: 700;
  box-shadow: 0 1px 4px rgba(0,0,0,.08);
}
.size-btn:not(.active):hover { color: #334155; }
.size-dim   { font-size: 10px; font-weight: 500; color: #a5b4fc; margin-top: 1px; }
.size-count { font-size: 10.5px; font-weight: 500; color: #94a3b8; }
.size-btn.active .size-count { color: #6366f1; }

.btn-print {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 18px; border: none; border-radius: 8px;
  background: #6366f1; color: #fff;
  font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 600;
  cursor: pointer; transition: background .15s;
}
.btn-print:hover { background: #4f46e5; }

/* ── Barcode Grid ── */
.barcode-grid {
  width: 794px; min-height: 1123px;
  margin: 24px auto; background: #fff;
  box-shadow: 0 2px 16px rgba(0,0,0,.10);
  padding: 30px; display: grid; align-content: start;
}
.barcode-grid.size-lg {
  height: 1063px; min-height: unset; align-content: stretch;
  grid-template-columns: repeat(2, 340px);
  grid-template-rows: repeat(6, 1fr);
  gap: 6px; justify-content: center;
}
.barcode-grid.size-md {
  grid-template-columns: repeat(3, 215px);
  grid-auto-rows: 121px; gap: 8px; justify-content: center;
}
.barcode-grid.size-sm {
  grid-template-columns: repeat(5, 144px);
  grid-auto-rows: 72px; gap: 4px; justify-content: center;
}

/* ── Label ── */
.barcode-label {
  background: #fff; border: 1px solid #cbd5e1; border-radius: 4px;
  padding: 5px 4px 3px;
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 1px; text-align: center; overflow: hidden;
}
.lbl-product {
  font-size: 7px; font-weight: 600; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .05em;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  width: 100%; text-align: center; line-height: 1;
}
.size-sm .lbl-product { display: none; }
.lbl-variant { font-size: 9px; font-weight: 700; color: #0f172a; line-height: 1; white-space: nowrap; }
.size-lg .lbl-variant { font-size: 13px; }
.size-sm .lbl-variant { font-size: 7.5px; }
.lbl-svg { width: 100%; height: auto; display: block; }
.lbl-code { font-family: 'DM Mono', monospace; font-size: 7px; color: #475569; letter-spacing: .02em; line-height: 1; }
.size-lg .lbl-code { font-size: 8.5px; }
.size-sm .lbl-code { font-size: 6px; }
.lbl-price { font-size: 8.5px; font-weight: 700; color: #6366f1; font-family: 'DM Mono', monospace; line-height: 1; }
.size-lg .lbl-price { font-size: 11px; }
.size-sm .lbl-price { font-size: 7px; }

/* ── Print ── */
@media print {
  @page { size: A4 portrait; margin: 8mm; }
  .no-print { display: none !important; }
  .barcode-page { background: #fff; padding: 0; }
  .barcode-grid {
    width: 100% !important; height: auto !important; min-height: unset !important;
    margin: 0 !important; padding: 0 !important;
    background: transparent !important; box-shadow: none !important;
    align-content: start !important;
  }
  .barcode-grid.size-lg {
    grid-template-columns: repeat(2, 90mm) !important;
    grid-template-rows: repeat(6, 46mm) !important;
    gap: 1mm !important; justify-content: center !important;
  }
  .barcode-grid.size-md {
    grid-template-columns: repeat(3, 57mm) !important;
    grid-auto-rows: 32mm !important;
    gap: 1.5mm !important; justify-content: center !important;
  }
  .barcode-grid.size-sm {
    grid-template-columns: repeat(5, 38mm) !important;
    grid-auto-rows: 19mm !important;
    gap: 1mm !important; justify-content: center !important;
  }
  .barcode-label {
    border: 0.3pt solid #cbd5e1 !important; border-radius: 1pt !important;
    padding: 1.5pt !important; box-shadow: none !important;
    break-inside: avoid; overflow: hidden;
  }
  .barcode-grid.size-lg .lbl-product { font-size: 6pt !important; }
  .barcode-grid.size-lg .lbl-variant { font-size: 9pt !important; }
  .barcode-grid.size-lg .lbl-code    { font-size: 7pt !important; }
  .barcode-grid.size-lg .lbl-price   { font-size: 8pt !important; }
  .barcode-grid.size-md .lbl-product { font-size: 5pt !important; }
  .barcode-grid.size-md .lbl-variant { font-size: 7.5pt !important; }
  .barcode-grid.size-md .lbl-code    { font-size: 6pt !important; }
  .barcode-grid.size-md .lbl-price   { font-size: 7pt !important; }
  .barcode-grid.size-sm .lbl-product { display: none !important; }
  .barcode-grid.size-sm .lbl-variant { font-size: 5.5pt !important; }
  .barcode-grid.size-sm .lbl-code    { font-size: 5pt !important; }
  .barcode-grid.size-sm .lbl-price   { font-size: 5.5pt !important; }
  .lbl-svg { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
</style>