<template>
  <div class="modal-overlay" @mousedown.self="$emit('close')">

    <!-- ── MAIN VARIANT MODAL ─────────────────────────────────── -->
    <div class="modal-box" v-if="!showPrintPage">
      <div class="modal-header">
        <span class="modal-title">{{ editing ? 'Edit Variant' : 'New Variant' }}</span>
        <button class="modal-close" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <!-- Product -->
        <div class="form-group">
          <label class="form-label">Product *</label>
          <select v-model="form.inventory_id" class="form-select">
            <option value="" disabled>Select a product</option>
            <option v-for="p in inventory" :key="p.id" :value="p.id">{{ p.inventoryName }}</option>
          </select>
          <span v-if="errors.inventory_id" class="form-error">{{ errors.inventory_id }}</span>
        </div>

        <!-- Variant Name -->
        <div class="form-group">
          <label class="form-label">Variant Name *</label>
          <input v-model="form.variant_name" class="form-input" placeholder="e.g. Air Milo Tin 500ml" maxlength="50" />
          <span v-if="errors.variant_name" class="form-error">{{ errors.variant_name }}</span>
        </div>

        <!-- Price + Qty -->
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">Price (RM) *</label>
            <input v-model.number="form.price" type="number" min="0" step="0.01" class="form-input" placeholder="0.00" />
            <span v-if="errors.price" class="form-error">{{ errors.price }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Quantity</label>
            <input v-model.number="form.quantity" type="number" min="0" class="form-input" placeholder="0" />
          </div>
        </div>

        <!-- ── BARCODE SECTION ──────────────────────────────────── -->
        <div class="form-group">
          <label class="form-label">Barcode *</label>

          <!-- Mode toggle -->
          <div class="barcode-mode-tabs">
            <button class="mode-tab" :class="{ active: barcodeMode === 'scan' }" type="button" @click="switchMode('scan')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 5v4M3 5h4M21 5h-4M21 5v4M3 19v-4M3 19h4M21 19h-4M21 19v-4"/>
                <rect x="7" y="7" width="3" height="10" rx="0.5"/>
                <rect x="11" y="7" width="1.5" height="10" rx="0.5"/>
                <rect x="14" y="7" width="3" height="10" rx="0.5"/>
              </svg>
              Scan Barcode
            </button>
            <button class="mode-tab" :class="{ active: barcodeMode === 'generate' }" type="button" @click="switchMode('generate')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
              </svg>
              Auto Generate
            </button>
          </div>

          <!-- SCAN MODE -->
          <div v-if="barcodeMode === 'scan'" class="scan-area">
            <div class="scan-input-wrap" :class="{ scanning: isScanning }">
              <svg class="scan-prefix-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 5v4M3 5h4M21 5h-4M21 5v4M3 19v-4M3 19h4M21 19h-4M21 19v-4"/>
                <rect x="7" y="7" width="3" height="10" rx="0.5"/>
                <rect x="11" y="7" width="1.5" height="10" rx="0.5"/>
                <rect x="14" y="7" width="3" height="10" rx="0.5"/>
              </svg>
              <input
                ref="scanInput"
                v-model="form.barcode"
                class="form-input scan-input"
                placeholder="Scan or type barcode..."
                maxlength="50"
                @focus="isScanning = true"
                @blur="isScanning = false"
                @keydown.enter.prevent="onScanEnter"
              />
              <span v-if="form.barcode" class="scan-clear" @click="form.barcode = ''">✕</span>
            </div>
            <p class="scan-hint">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Point your barcode scanner at this field and scan — it will auto-fill on Enter.
            </p>
          </div>

          <!-- GENERATE MODE -->
          <div v-else class="generate-area">
            <div class="generate-controls">
              <!-- Prefix (hidden for EAN-13) -->
              <div class="gen-field" v-if="genFormat !== 'EAN13'">
                <label class="gen-sublabel">Prefix</label>
                <input v-model="genPrefix" class="form-input gen-input" placeholder="e.g. MLO" maxlength="6" @input="generateBarcode" />
              </div>
              <!-- Format -->
              <div class="gen-field">
                <label class="gen-sublabel">Format</label>
                <select v-model="genFormat" class="form-select gen-input" @change="generateBarcode">
                  <option value="CODE128">Code 128</option>
                  <option value="EAN13">EAN-13</option>
                </select>
              </div>
              <!-- Regenerate -->
              <button class="btn-regen" type="button" @click="generateBarcode" title="Regenerate">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
                </svg>
              </button>
            </div>

            <!-- JsBarcode SVG preview -->
            <div class="barcode-preview" v-if="form.barcode">
              <svg ref="barcodesvg"></svg>
            </div>

            <!-- Action row -->
            <div class="generate-actions">
              <div class="gen-result-wrap">
                <input :value="form.barcode" class="form-input gen-result" readonly />
                <button class="btn-copy" type="button" @click="copyBarcode" :class="{ copied: justCopied }">
                  <svg v-if="!justCopied" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ justCopied ? 'Copied!' : 'Copy' }}
                </button>
              </div>
              <button class="btn-print-trigger" type="button" @click="openPrintPage">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                </svg>
                Print Barcodes (A4)
              </button>
            </div>
          </div>

          <span v-if="errors.barcode" class="form-error">{{ errors.barcode }}</span>
        </div>

        <!-- Threshold -->
        <div class="form-group">
          <label class="form-label">Low Stock Threshold</label>
          <input v-model.number="form.threshold" type="number" min="0" class="form-input" placeholder="10" />
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-ghost" @click="$emit('close')">Cancel</button>
        <button class="btn-primary" @click="submit">
          {{ editing ? 'Save Changes' : 'Create Variant' }}
        </button>
      </div>
    </div>

    <!-- ── PRINT PAGE (full-screen overlay) ──────────────────────── -->
    <div class="print-page-overlay" v-else>
      <div class="print-toolbar no-print">
        <div class="pt-left">
          <button class="pt-back" @click="showPrintPage = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Form
          </button>
          <span class="pt-title">Barcode Print Sheet</span>
        </div>
        <div class="pt-right">
          <div class="pt-control">
            <label>Copies per barcode</label>
            <input
              :value="printCopies"
              type="number"
              class="pt-num"
              readonly
              tabindex="-1"
            />
          </div>
          <div class="pt-control">
            <label>Label size</label>
            <select v-model="labelSize" class="pt-select" @change="rerenderLabels">
              <option value="small">Small (38×19mm) — 35 labels</option>
              <option value="medium">Medium (57×32mm) — 28 labels</option>
              <option value="large">Large (90×50mm) — 12 labels</option>
            </select>
          </div>
          <button class="pt-print-btn" @click="doPrint">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print / Save PDF
          </button>
        </div>
      </div>

      <!-- A4 sheet -->
      <div class="a4-wrap">
        <div class="a4-sheet" id="printSheet">
          <div class="a4-header no-print-hide">
            <div class="a4-store-name">Koperasi Smart Management System (KSMS)</div>
            <div class="a4-meta">Generated: {{ printDate }} · Variant: {{ form.variant_name || '—' }}</div>
          </div>
          <div class="label-grid" :class="`size-${labelSize}`">
            <div v-for="n in printCopies" :key="n" class="label-cell">
              <div class="label-product">{{ selectedProductName }}</div>
              <div class="label-variant">{{ form.variant_name }}</div>
              <div class="label-bars">
                <svg :ref="el => { if (el) labelSvgEls[n] = el }"></svg>
              </div>
              <div class="label-code">{{ form.barcode }}</div>
              <div class="label-price" v-if="form.price">RM {{ Number(form.price).toFixed(2) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'VariantModal',

  props: {
    editing: Object,
    inventory: Array,
  },

  emits: ['save', 'close'],

  data() {
    return {
      form: {
        inventory_id: '',
        variant_name: '',
        price: '',
        quantity: 0,
        barcode: '',
        threshold: 10,
      },
      errors: {},

      // barcode
      barcodeMode: 'scan', // 'scan' | 'generate'
      isScanning: false,
      genPrefix: '',
      genFormat: 'CODE128',
      justCopied: false,

      // print
      showPrintPage: false,
      labelSize: 'medium',
      labelSvgEls: {},
      printDate: new Date().toLocaleDateString('en-MY', {
        day: 'numeric', month: 'short', year: 'numeric',
      }),
    }
  },

  computed: {
    selectedProductName() {
      const p = (this.inventory || []).find(p => p.id === this.form.inventory_id)
      return p ? p.inventoryName : ''
    },
    printCopies() {
      return { small: 35, medium: 28, large: 12 }[this.labelSize] ?? 28
    },
  },

  watch: {
    'form.barcode'() {
      if (this.barcodeMode === 'generate') {
        this.$nextTick(() => this.renderPreview())
      }
    },
    showPrintPage(val) {
      if (val) {
        this.$nextTick(() => this.renderAllLabels())
      }
    },
    labelSize() {
      this.$nextTick(() => this.renderAllLabels())
    },
  },

  created() {
    if (this.editing) {
      this.form = { ...this.editing }
      if (this.form.barcode) this.barcodeMode = 'scan'
    }
  },

  methods: {
    switchMode(mode) {
      this.barcodeMode = mode
      if (mode === 'generate' && !this.form.barcode) {
        this.generateBarcode()
      } else if (mode === 'generate' && this.form.barcode) {
        this.$nextTick(() => this.renderPreview())
      }
    },

    generateBarcode() {
      if (this.genFormat === 'EAN13') {
        const digits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10))
        const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0)
        digits.push((10 - (sum % 10)) % 10)
        this.form.barcode = digits.join('')
      } else {
        const prefix = (this.genPrefix || 'SKU').toUpperCase()
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789'
        const body = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
        this.form.barcode = `${prefix}-${body}`
      }
      this.$nextTick(() => this.renderPreview())
    },

    renderPreview() {
      const el = this.$refs.barcodesvg
      if (!el || !this.form.barcode) return
      try {
        JsBarcode(el, this.form.barcode, {
          format: this.genFormat,
          width: 1.8,
          height: 48,
          displayValue: false,
          margin: 4,
          lineColor: '#0f172a',
          background: '#ffffff',
        })
      } catch (e) {
        // invalid value — silently skip
      }
    },

    renderAllLabels() {
      const barcodeHeight = this.labelSize === 'small' ? 18 : this.labelSize === 'large' ? 32 : 22
      const barcodeWidth  = this.labelSize === 'small' ? 1.0 : this.labelSize === 'large' ? 1.6 : 1.2

      for (let n = 1; n <= this.printCopies; n++) {
        const el = this.labelSvgEls[n]
        if (!el || !this.form.barcode) continue
        try {
          JsBarcode(el, this.form.barcode, {
            format: this.genFormat,
            width: barcodeWidth,
            height: barcodeHeight,
            displayValue: false,
            margin: 2,
            lineColor: '#000000',
            background: '#ffffff',
          })
        } catch (e) {}
      }
    },

    rerenderLabels() {
      this.$nextTick(() => this.renderAllLabels())
    },

    onScanEnter() {
      this.$refs.scanInput?.blur()
    },

    copyBarcode() {
      navigator.clipboard?.writeText(this.form.barcode).catch(() => {})
      this.justCopied = true
      setTimeout(() => { this.justCopied = false }, 1800)
    },

    openPrintPage() {
      if (!this.form.barcode) this.generateBarcode()
      this.labelSvgEls = {}
      this.showPrintPage = true
    },

doPrint() {
  const printContents = document.getElementById('printSheet').outerHTML
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map(el => el.outerHTML)
    .join('')

  const printWindow = window.open('', '_blank')
  printWindow.document.open()
  printWindow.document.write(`
    <html>
      <head>
        <title>Print Barcodes</title>
        ${styles}
        <style>
          body { margin: 0; padding: 0; }
        </style>
      </head>
      <body>${printContents}</body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
  printWindow.close()
},

    validate() {
      this.errors = {}
      if (!this.form.inventory_id)        this.errors.inventory_id  = 'Please select a product.'
      if (!this.form.variant_name?.trim()) this.errors.variant_name  = 'Variant name is required.'
      if (!this.form.price || this.form.price < 0) this.errors.price = 'Valid price is required.'
      if (!this.form.barcode?.trim())      this.errors.barcode       = 'Barcode is required.'
      return Object.keys(this.errors).length === 0
    },

    submit() {
      if (!this.validate()) return
      this.$emit('save', {
        ...this.form,
        variant_name: this.form.variant_name.trim(),
        barcode:      this.form.barcode.trim(),
        threshold:    this.form.threshold || 10,
      })
    },
  },
}
</script>

<style scoped>
/* ── Barcode mode tabs ──────────────────────────────────────────── */
.barcode-mode-tabs {
  display: flex;
  gap: 0;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: 10px;
  background: var(--bg);
}
.mode-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s;
  border-right: 1px solid var(--border-strong);
}
.mode-tab:last-child { border-right: none; }
.mode-tab:hover { color: var(--text-primary); background: var(--surface); }
.mode-tab.active { background: var(--accent); color: #fff; font-weight: 500; }

/* ── Scan area ──────────────────────────────────────────────────── */
.scan-area { display: flex; flex-direction: column; gap: 8px; }
.scan-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  transition: all 0.15s;
}
.scan-input-wrap.scanning .scan-input {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
}
.scan-prefix-icon {
  position: absolute;
  left: 11px;
  color: var(--text-muted);
  pointer-events: none;
  transition: color 0.15s;
}
.scan-input-wrap.scanning .scan-prefix-icon { color: var(--accent); }
.scan-input { padding-left: 34px !important; padding-right: 30px !important; }
.scan-clear {
  position: absolute;
  right: 10px;
  font-size: 12px;
  color: var(--text-muted);
  cursor: pointer;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--border-strong);
  transition: all 0.1s;
}
.scan-clear:hover { background: var(--red-bg); color: var(--red); }
.scan-hint {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: var(--text-muted);
  background: var(--bg);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  padding: 7px 11px;
}

/* ── Generate area ──────────────────────────────────────────────── */
.generate-area { display: flex; flex-direction: column; gap: 10px; }
.generate-controls { display: flex; gap: 8px; align-items: flex-end; }
.gen-field { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.gen-sublabel {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}
.btn-regen {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
  align-self: flex-end;
}
.btn-regen:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: #eef2ff;
  transform: rotate(180deg);
}

/* ── Barcode SVG preview ────────────────────────────────────────── */
.barcode-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  padding: 10px 16px 6px;
}
.barcode-preview svg { max-width: 100%; display: block; }

/* ── Generate actions ────────────────────────────────────────────── */
.generate-actions { display: flex; gap: 8px; align-items: stretch; }
.gen-result-wrap { flex: 1; position: relative; display: flex; }
.gen-result {
  flex: 1;
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  background: var(--bg);
  padding-right: 72px !important;
}
.btn-copy {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
  border: none;
  background: var(--border-strong);
  color: var(--text-secondary);
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-copy:hover { background: #e2e8f0; color: var(--text-primary); }
.btn-copy.copied { background: #dcfce7; color: #15803d; }
.btn-print-trigger {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 14px;
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  background: #eef2ff;
  color: var(--accent);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.btn-print-trigger:hover { background: var(--accent); color: #fff; }

/* ── Shared form helpers ──────────────────────────────────────────── */
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-error { color: var(--red); font-size: 12px; margin-top: 2px; }

/* ══════════════════════════════════════════════════════════════════
   PRINT PAGE
══════════════════════════════════════════════════════════════════ */
.print-page-overlay {
  position: fixed;
  inset: 0;
  background: #e8eaf0;
  z-index: 300;
  display: flex;
  flex-direction: column;
  overflow: auto;
}

/* Toolbar */
.print-toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 28px;
  background: #fff;
  border-bottom: 1px solid var(--border-strong);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  gap: 16px;
  flex-wrap: wrap;
}
.pt-left  { display: flex; align-items: center; gap: 14px; }
.pt-right { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.pt-back {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: transparent;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}
.pt-back:hover { color: var(--text-primary); background: var(--bg); }
.pt-title { font-size: 15px; font-weight: 600; color: var(--text-primary); letter-spacing: -0.02em; }
.pt-control { display: flex; align-items: center; gap: 8px; }
.pt-control label { font-size: 12.5px; color: var(--text-secondary); white-space: nowrap; }
.pt-num {
  width: 60px;
  padding: 7px 10px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--surface);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  text-align: center;
  outline: none;
  /* readonly styling */
  cursor: default;
  color: var(--text-muted);
  user-select: none;
}
.pt-select {
  padding: 7px 10px;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--surface);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  outline: none;
}
.pt-select:focus { border-color: var(--accent); }
.pt-print-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 20px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
  box-shadow: 0 2px 8px rgba(99,102,241,0.25);
}
.pt-print-btn:hover { background: var(--accent-hover); }

/* A4 paper */
.a4-wrap { display: flex; justify-content: center; padding: 32px 24px 48px; }
.a4-sheet {
  width: 210mm;
  min-height: 297mm;
  background: #fff;
  box-shadow: 0 4px 32px rgba(0,0,0,0.15);
  border-radius: 4px;
  padding: 14mm 12mm;
}
.a4-header {
  margin-bottom: 8mm;
  padding-bottom: 4mm;
  border-bottom: 2px solid #0f172a;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
.a4-store-name { font-size: 15px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em; }
.a4-meta { font-size: 10px; color: #94a3b8; font-family: 'DM Mono', monospace; }

/* Label grid */
.label-grid { display: grid; }
.label-grid.size-small  { grid-template-columns: repeat(5, 1fr); grid-template-rows: repeat(7, auto); gap: 3mm; }
.label-grid.size-medium { grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(7, auto); gap: 4mm; }
.label-grid.size-large  { grid-template-columns: repeat(2, 1fr); grid-template-rows: repeat(6, auto); gap: 4mm; }

.label-cell {
  border: 1px solid #d1d5db;
  border-radius: 3px;
  padding: 3mm 3mm 2mm;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5mm;
  background: #fff;
  page-break-inside: avoid;
  overflow: hidden;
}
.label-product {
  font-size: 7px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: center;
  line-height: 1.2;
}
.label-variant { font-size: 8px; font-weight: 600; color: #0f172a; text-align: center; line-height: 1.2; }
.label-bars { display: flex; align-items: center; justify-content: center; width: 100%; margin: 1mm 0; }
.label-bars svg { max-width: 100%; display: block; }
.label-code { font-family: 'DM Mono', monospace; font-size: 7px; color: #374151; letter-spacing: 0.08em; text-align: center; }
.label-price { font-size: 9px; font-weight: 700; color: #0f172a; margin-top: 0.5mm; }

/* ── Print media query ───────────────────────────────────────────── */
@media print {
  .no-print { display: none !important; }
  .print-page-overlay {
    position: static !important;
    background: #fff !important;
    overflow: visible !important;
  }
  .a4-wrap { padding: 0 !important; display: block; }
  .a4-sheet {
    width: 100% !important;
    min-height: unset !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 10mm !important;
  }
  .label-grid { gap: 3mm !important; }
  .modal-overlay { display: block !important; position: static !important; background: none !important; }
}
</style>