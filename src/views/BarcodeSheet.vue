<template>
  <div class="barcode-page">

    <!-- ── Toolbar (hidden on print) ── -->
    <div class="toolbar no-print">
      <div class="toolbar-left">
        <button class="btn-back" @click="$router.back()">
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

    <!-- ── Print Header (print only) ── -->
    <div class="print-header print-only">
      <p class="ph-store">KSMS Store System</p>
      <p class="ph-title">{{ inventoryName }} — {{ variant.variant_name }}</p>
      <p class="ph-date">Printed {{ printedAt }}</p>
    </div>

    <!-- ── Barcode Grid ── -->
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

  </div>
</template>

<script>
export default {
  name: 'BarcodeSheet',

  data() {
    // variant passed via router state from AdminInventory
    const state    = window.history.state || {}
    const query    = this.$route?.query    || {}

    return {
      inventoryName: query.inventoryName || 'Product',
      variant: state.variant || {
        id: 1, variant_name: '500ml',
        barcode: '6009001001001', price: 3.50,
      },
      labelSize: 'md',
      printedAt: new Date().toLocaleString('en-MY', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }),
      sizes: [
        { value: 'sm', label: 'Small',  count: 40 },
        { value: 'md', label: 'Medium', count: 24 },
        { value: 'lg', label: 'Large',  count: 12 },
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

  mounted() {
    this.loadJsBarcode().then(() => this.$nextTick(() => this.renderBarcodes()))
  },

  methods: {
    printPage() {
      window.print()
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
      if (!window.JsBarcode) return
      const cfg = {
        sm: { width: 1.2, height: 36 },
        md: { width: 1.6, height: 50 },
        lg: { width: 2.0, height: 64 },
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
            margin:       3,
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

/* Size tabs */
.size-tabs {
  display: flex;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 3px; gap: 2px;
}
.size-btn {
  display: flex; flex-direction: column; align-items: center;
  padding: 7px 16px; border: none; border-radius: 7px;
  background: transparent;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 500; color: #64748b;
  cursor: pointer; transition: all .15s; line-height: 1.3;
}
.size-btn.active {
  background: #fff;
  color: #6366f1; font-weight: 700;
  box-shadow: 0 1px 4px rgba(0,0,0,.08);
}
.size-btn:not(.active):hover { color: #334155; }
.size-count {
  font-size: 10.5px; font-weight: 500;
  color: #94a3b8; margin-top: 1px;
}
.size-btn.active .size-count { color: #6366f1; }

.btn-print {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 18px; border: none; border-radius: 8px;
  background: #6366f1; color: #fff;
  font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 600;
  cursor: pointer; transition: background .15s;
}
.btn-print:hover { background: #4f46e5; }

/* ── Print header (screen hidden, print visible) ── */
.print-only { display: none; }

/* ── Barcode Grid ── */
.barcode-grid {
  padding: 24px 32px;
  display: grid;
  gap: 10px;
}

/* Grid columns by size — match print layout */
.barcode-grid.size-sm { grid-template-columns: repeat(8, 1fr); }
.barcode-grid.size-md { grid-template-columns: repeat(6, 1fr); }
.barcode-grid.size-lg { grid-template-columns: repeat(4, 1fr); }

/* Label card */
.barcode-label {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 6px;
  display: flex; flex-direction: column; align-items: center;
  gap: 3px; text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}

.lbl-product {
  font-size: 9px; font-weight: 600; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .05em;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;
  text-align: center;
}
.lbl-variant {
  font-size: 12px; font-weight: 700; color: #0f172a;
}
.lbl-svg {
  width: 100%; height: auto; display: block;
}
.lbl-code {
  font-family: 'DM Mono', monospace;
  font-size: 9px; color: #475569; letter-spacing: .03em;
}
.lbl-price {
  font-size: 11px; font-weight: 700;
  color: #6366f1; font-family: 'DM Mono', monospace;
}

/* ── PRINT STYLES ── */
@media print {
  /* A4 portrait */
  @page {
    size: A4 portrait;
    margin: 8mm;
  }

  .no-print   { display: none !important; }
  .print-only { display: block !important; }

  .barcode-page {
    background: #fff !important;
    min-height: unset !important;
  }

  /* Print header */
  .print-header {
    text-align: center;
    padding-bottom: 8pt;
    border-bottom: 1pt solid #e2e8f0;
    margin-bottom: 10pt;
  }
  .ph-store { font-size: 8pt; color: #94a3b8; text-transform: uppercase; letter-spacing: .06em; }
  .ph-title { font-size: 13pt; font-weight: 700; color: #0f172a; margin: 3pt 0; }
  .ph-date  { font-size: 8pt; color: #94a3b8; }

  /* Grid — A4 portrait fill */
  .barcode-grid {
    padding: 0 !important;
    gap: 4pt !important;
  }

  /* Small: 8 cols × 5 rows = 40 per page */
  .barcode-grid.size-sm {
    grid-template-columns: repeat(8, 1fr) !important;
  }
  /* Medium: 6 cols × 4 rows = 24 per page */
  .barcode-grid.size-md {
    grid-template-columns: repeat(6, 1fr) !important;
  }
  /* Large: 4 cols × 3 rows = 12 per page */
  .barcode-grid.size-lg {
    grid-template-columns: repeat(4, 1fr) !important;
  }

  .barcode-label {
    border: 1pt solid #e2e8f0 !important;
    border-radius: 3pt !important;
    padding: 5pt 4pt !important;
    box-shadow: none !important;
    break-inside: avoid;
  }

  .lbl-variant { font-size: 9pt !important; }
  .lbl-code    { font-size: 7pt !important; }
  .lbl-price   { font-size: 8pt !important; }
  .lbl-product { font-size: 6.5pt !important; }

  /* Force barcode colors to print */
  .lbl-svg { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
</style>