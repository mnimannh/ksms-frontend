<template>
  <div class="inv-modal-backdrop" @click.self="$emit('close')">
    <div class="inv-modal">
      <div class="modal-header">
        <h2 class="modal-title">{{ mode === 'edit' ? 'Edit Variant' : 'New Variant' }}</h2>
        <button class="modal-close" @click="$emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">

        <!-- Variant Name -->
        <div class="field">
          <label class="field-label">Variant Name <span class="req">*</span></label>
          <input v-model="form.variant_name" class="field-input" placeholder="e.g. 500ml, 1kg, Red" maxlength="50" />
          <p v-if="errors.variant_name" class="field-error">{{ errors.variant_name }}</p>
        </div>

        <!-- Cost Price section -->
        <div class="cost-section">
          <div class="cost-section-head">
            <label class="field-label">Cost Price (Modal) <span class="req">*</span></label>
            <div class="cost-toggle">
              <button type="button" :class="['cost-tab', costMode === 'direct' ? 'active' : '']" @click="costMode = 'direct'">Direct</button>
              <button type="button" :class="['cost-tab', costMode === 'bulk'   ? 'active' : '']" @click="costMode = 'bulk'">Bulk</button>
            </div>
          </div>

          <!-- Direct mode -->
          <div v-if="costMode === 'direct'" class="field-row" style="margin-top:6px">
            <div class="field">
              <div class="input-prefix-wrap">
                <span class="input-prefix">RM</span>
                <input v-model.number="form.cost_price" type="number" min="0" step="0.01" class="field-input prefix-input" placeholder="0.00" />
              </div>
              <p v-if="errors.cost_price" class="field-error">{{ errors.cost_price }}</p>
            </div>
          </div>

          <!-- Bulk mode -->
          <div v-else class="bulk-calc">
            <div class="bulk-fields">
              <div class="field">
                <label class="field-label">Cost / Carton (RM)</label>
                <div class="input-prefix-wrap">
                  <span class="input-prefix">RM</span>
                  <input v-model.number="bulk.costPerCarton" type="number" min="0" step="0.01" class="field-input prefix-input" placeholder="0.00" />
                </div>
              </div>
              <div class="bulk-divider">÷</div>
              <div class="field">
                <label class="field-label">Units / Carton</label>
                <input v-model.number="bulk.unitsPerCarton" type="number" min="1" class="field-input" placeholder="12" />
              </div>
              <div class="bulk-divider">=</div>
              <div class="field field--result">
                <label class="field-label">Unit Cost</label>
                <div class="result-box" :class="bulkUnitCost > 0 ? 'result-box--active' : ''">
                  <span class="result-rm">RM</span>
                  <span class="result-val">{{ bulkUnitCost > 0 ? bulkUnitCost.toFixed(4) : '—' }}</span>
                </div>
              </div>
            </div>
            <p v-if="errors.cost_price" class="field-error">{{ errors.cost_price }}</p>
          </div>
        </div>

        <!-- Sell Price row -->
        <div class="field-row">
          <div class="field">
            <label class="field-label">Sell Price (RM) <span class="req">*</span></label>
            <div class="input-prefix-wrap">
              <span class="input-prefix">RM</span>
              <input v-model.number="form.price" type="number" min="0" step="0.01" class="field-input prefix-input" placeholder="0.00" />
            </div>
            <p v-if="errors.price" class="field-error">{{ errors.price }}</p>
          </div>
          <!-- Live margin pill -->
          <div class="field field--margin">
            <label class="field-label">Margin</label>
            <div class="margin-display" :class="marginClass">
              <span class="margin-pct">{{ marginPct }}</span>
              <span class="margin-rm">{{ marginRM }}</span>
            </div>
          </div>
        </div>

        <!-- Quantity & Threshold row -->
        <div class="field-row">
          <div class="field">
            <label class="field-label">Quantity</label>
            <input
              v-model.number="form.quantity"
              type="number" min="0"
              class="field-input"
              placeholder="0"
              :readonly="isLoadCellTracked"
              :class="{ 'input-readonly': isLoadCellTracked }"
            />
            <p v-if="isLoadCellTracked" class="field-hint lc-hint">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="10" rx="2"/><line x1="12" y1="7" x2="12" y2="3"/></svg>
              Managed by load cell sensor
            </p>
          </div>
          <div class="field">
            <label class="field-label">Low Stock Threshold</label>
            <input v-model.number="form.threshold" type="number" min="0" class="field-input" placeholder="10" />
          </div>
        </div>

        <!-- Unit Weight (optional — for load cell) -->
        <div class="field">
          <label class="field-label">Unit Weight (g) <span class="opt">(optional)</span></label>
          <div class="input-prefix-wrap">
            <span class="input-prefix">g</span>
            <input v-model.number="form.unit_weight" type="number" min="0" step="0.01" class="field-input prefix-input" placeholder="0.00" />
          </div>
          <p class="field-hint">Weight per item in grams — used by load cell sensors to calculate stock quantity</p>
        </div>

        <!-- Barcode -->
        <div class="field">
          <label class="field-label">Barcode <span class="req">*</span></label>
          <div class="barcode-row">
            <input
              ref="barcodeInput"
              class="field-input barcode-field"
              :value="form.barcode"
              placeholder="Scan or generate barcode…"
              :class="{ scanning: scanMode }"
              @keydown.enter.prevent="onBarcodeEnter"
              @input="onBarcodeInput"
              :readonly="!scanMode"
            />
            <button
              class="btn-icon-action"
              :class="{ active: scanMode }"
              @click="confirmScan"
              title="Toggle barcode scanner mode"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9V5a2 2 0 012-2h4M3 15v4a2 2 0 002 2h4M21 9V5a2 2 0 00-2-2h-4M21 15v4a2 2 0 01-2 2h-4"/>
                <line x1="7" y1="12" x2="7" y2="12"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="17" y1="12" x2="17" y2="12"/>
              </svg>
              {{ scanMode ? 'Scanning…' : 'Scan' }}
            </button>
            <button
              class="btn-icon-action generate"
              @click="confirmGenerate"
              :disabled="generated"
              :title="generated ? 'Barcode already generated' : 'Auto-generate barcode'"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
              </svg>
              {{ generated ? 'Generated' : 'Generate' }}
            </button>
          </div>

          <!-- Barcode image preview -->
          <div v-if="form.barcode" class="barcode-preview">
            <svg ref="barcodePreview"></svg>
            <p v-if="barcodeError" class="field-error barcode-err">{{ barcodeError }}</p>
          </div>

          <p class="field-hint scan-hint" v-if="scanMode">
            <span class="scan-dot" /> Awaiting scan — focus is on the barcode field. Scan now.
          </p>
          <p v-if="errors.barcode" class="field-error">{{ errors.barcode }}</p>
        </div>

      </div>

      <!-- Confirm Dialog -->
      <div v-if="confirmDialog.show" class="confirm-overlay">
        <div class="confirm-box">
          <div class="confirm-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <p class="confirm-msg">{{ confirmDialog.message }}</p>
          <div class="confirm-actions">
            <button class="btn-ghost" @click="confirmDialog.show = false">Cancel</button>
            <button class="btn-confirm" @click="confirmDialog.onConfirm">Confirm</button>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-ghost" @click="$emit('close')">Cancel</button>
        <button class="btn-primary" @click="submit">
          {{ mode === 'edit' ? 'Save Changes' : 'Add Variant' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import JsBarcode from 'jsbarcode'

export default {
  name: 'VariantModal',
  emits: ['close', 'save'],
  props: {
    mode:        { type: String, default: 'add' },
    initial:     { type: Object, default: null },
    inventoryId: { type: Number, default: null },
  },
  data() {
    return {
      form: {
        variant_name: this.initial?.variant_name || '',
        cost_price:   this.initial?.cost_price   ?? '',
        price:        this.initial?.price        || '',
        quantity:     this.initial?.quantity      ?? 0,
        threshold:    this.initial?.threshold     ?? 10,
        barcode:      this.initial?.barcode       || '',
        unit_weight:  this.initial?.unit_weight   ?? '',
      },
      costMode: 'direct',
      bulk: { costPerCarton: '', unitsPerCarton: '' },
      errors:       {},
      scanMode:     false,
      generated:    false,
      barcodeError: '',
      confirmDialog: {
        show:      false,
        message:   '',
        onConfirm: null,
      },
    }
  },

  computed: {
    isLoadCellTracked() {
      return this.mode === 'edit' && this.initial?.stock_tracking_type === 'load_cell'
    },
    bulkUnitCost() {
      const cost  = parseFloat(this.bulk.costPerCarton)  || 0
      const units = parseFloat(this.bulk.unitsPerCarton) || 0
      if (!cost || !units) return 0
      return cost / units
    },
    marginValue() {
      const sell = parseFloat(this.form.price) || 0
      const cost = parseFloat(this.form.cost_price) || 0
      return sell - cost
    },
    marginPct() {
      const sell = parseFloat(this.form.price) || 0
      if (!sell) return '—'
      return ((this.marginValue / sell) * 100).toFixed(1) + '%'
    },
    marginRM() {
      if (!this.form.price && !this.form.cost_price) return ''
      return (this.marginValue >= 0 ? '+' : '') + 'RM ' + this.marginValue.toFixed(2)
    },
    marginClass() {
      const sell = parseFloat(this.form.price) || 0
      if (!sell) return 'margin--neutral'
      const pct = (this.marginValue / sell) * 100
      if (pct < 0)  return 'margin--loss'
      if (pct < 10) return 'margin--low'
      if (pct < 30) return 'margin--ok'
      return 'margin--good'
    },
  },

  methods: {
    // ── Confirm dialog ──────────────────────────────────────────────────
    showConfirm(message, onConfirm) {
      this.confirmDialog = {
        show: true,
        message,
        onConfirm: () => {
          this.confirmDialog.show = false
          onConfirm()
        },
      }
    },

    confirmScan() {
      const msg = this.form.barcode
        ? 'A barcode already exists. Are you sure you want to overwrite it by scanning?'
        : 'Are you sure you want to scan a barcode?'
      this.showConfirm(msg, () => this.toggleScan())
    },

    confirmGenerate() {
      const msg = this.form.barcode
        ? 'A barcode already exists. Are you sure you want to auto-generate a new one?'
        : 'Are you sure you want to auto-generate a barcode?'
      this.showConfirm(msg, () => this.generateBarcode())
    },

    // ── Scan ────────────────────────────────────────────────────────────
    toggleScan() {
      this.scanMode = !this.scanMode
      if (this.scanMode) {
        // Clear existing barcode so scanner starts fresh
        this.form.barcode = ''
        this.generated = false
        if (this.$refs.barcodePreview) this.$refs.barcodePreview.innerHTML = ''
        this.$nextTick(() => this.$refs.barcodeInput?.focus())
      }
    },

    onBarcodeInput(e) {
      // Only fires while scanMode is active (input is not readonly)
      this.form.barcode = e.target.value
    },

    onBarcodeEnter() {
      if (this.scanMode) {
        this.scanMode = false
        this.$nextTick(() => this.updateBarcodePreview())
      }
    },

    // ── Generate ────────────────────────────────────────────────────────
    generateBarcode() {
      const digits = Date.now().toString().slice(-12)
      this.form.barcode = digits
      this.generated = true
      this.$nextTick(() => this.updateBarcodePreview())
    },

    // ── Preview ─────────────────────────────────────────────────────────
    updateBarcodePreview() {
      this.barcodeError = ''
      const val = this.form.barcode?.trim()
      if (!val || !this.$refs.barcodePreview) return

      try {
        JsBarcode(this.$refs.barcodePreview, val, {
          format:       'CODE128',
          displayValue: true,
          fontSize:     13,
          height:       52,
          margin:       8,
          background:   '#f8fafc',
          lineColor:    '#1e293b',
        })
      } catch {
        this.barcodeError = 'Invalid barcode value — preview unavailable.'
        this.$refs.barcodePreview.innerHTML = ''
      }
    },

    // ── Validate & submit ───────────────────────────────────────────────
    validate() {
      this.errors = {}
      if (!this.form.variant_name.trim()) this.errors.variant_name = 'Variant name is required.'
      if (this.form.cost_price === '' || this.form.cost_price < 0) this.errors.cost_price = 'Enter a valid cost price.'
      if (!this.form.price || this.form.price <= 0) this.errors.price = 'Enter a valid sell price.'
      if (!this.form.barcode.trim()) this.errors.barcode = 'Barcode is required. Scan or generate one.'
      return !Object.keys(this.errors).length
    },

    submit() {
      if (!this.validate()) return
      this.$emit('save', { ...this.form, inventory_id: this.inventoryId })
    },
  },

  watch: {
    bulkUnitCost(val) {
      if (this.costMode === 'bulk' && val > 0) {
        this.form.cost_price = Math.round(val * 10000) / 10000
      }
    },
    costMode(mode) {
      if (mode === 'direct') {
        this.bulk = { costPerCarton: '', unitsPerCarton: '' }
      } else {
        this.form.cost_price = ''
      }
    },
    'form.barcode'() {
      this.$nextTick(() => this.updateBarcodePreview())
    },
  },

  mounted() {
    this.updateBarcodePreview()
  },
}
</script>

<style scoped>
/* ── Modal shell ─────────────────────────────────────────────────────── */
.inv-modal-backdrop {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.3);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
  backdrop-filter: blur(1px);
}
.inv-modal {
  background: #ffffff; border-radius: 12px; width: 520px; max-width: 95vw;
  max-height: 90vh; overflow-y: auto; position: relative;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

/* ── Header / Footer ─────────────────────────────────────────────────── */
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid #f1f5f9;
  position: sticky; top: 0; background: #ffffff; z-index: 1;
}
.modal-title { font-size: 15px; font-weight: 600; color: #0f172a; }
.modal-close {
  width: 28px; height: 28px; border-radius: 6px; border: none;
  background: #f1f5f9; color: #64748b; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .12s;
}
.modal-close:hover { background: #e2e8f0; color: #0f172a; }
.modal-body  { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.modal-footer {
  padding: 14px 20px; border-top: 1px solid #f1f5f9;
  display: flex; justify-content: flex-end; gap: 8px;
  position: sticky; bottom: 0; background: #ffffff;
}

/* ── Fields ──────────────────────────────────────────────────────────── */
.field       { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.field-row   { display: flex; gap: 12px; }
.field-label { font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: .05em; }
.req         { color: #dc2626; }
.field-input {
  padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px;
  font-size: 13px; font-family: 'Inter', sans-serif; color: #334155;
  outline: none; transition: border-color 0.12s; background: #ffffff; width: 100%;
  box-sizing: border-box;
}
.field-input:focus { border-color: #0f172a; }
.field-input[readonly]:not(.scanning) { background: #f8fafc; cursor: default; color: #64748b; }
.field-input.scanning {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16,185,129,.15);
  animation: pulse-border 1s ease infinite;
}
@keyframes pulse-border {
  0%,100% { box-shadow: 0 0 0 3px rgba(16,185,129,.15); }
  50%      { box-shadow: 0 0 0 6px rgba(16,185,129,.05); }
}

.input-prefix-wrap { position: relative; display: flex; align-items: center; }
.input-prefix      { position: absolute; left: 10px; font-size: 12px; font-weight: 600; color: #94a3b8; pointer-events: none; }
.prefix-input      { padding-left: 30px !important; }

/* ── Cost section ────────────────────────────────────────────────────── */
.cost-section { display: flex; flex-direction: column; gap: 0; }
.cost-section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }

.cost-toggle {
  display: flex; background: #f1f5f9; border-radius: 6px; padding: 2px; gap: 2px;
}
.cost-tab {
  font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500;
  color: #64748b; background: transparent; border: none;
  padding: 4px 10px; border-radius: 4px; cursor: pointer; transition: all .12s;
}
.cost-tab.active { background: #ffffff; color: #0f172a; box-shadow: 0 1px 2px rgba(0,0,0,.05); }

/* Bulk calculator */
.bulk-calc { display: flex; flex-direction: column; gap: 6px; }
.bulk-fields { display: flex; align-items: flex-end; gap: 8px; flex-wrap: wrap; }
.bulk-divider {
  font-size: 16px; font-weight: 300; color: #94a3b8;
  padding-bottom: 8px; flex-shrink: 0;
}
.field--result { min-width: 90px; }
.result-box {
  display: flex; align-items: center; gap: 4px;
  height: 36px; border-radius: 6px; padding: 0 10px;
  background: #f8fafc; border: 1px solid #e2e8f0;
}
.result-box--active { background: #f0fdf4; border-color: #bbf7d0; }
.result-rm  { font-size: 11.5px; font-weight: 600; color: #94a3b8; }
.result-val { font-size: 13px; font-weight: 600; color: #15803d; letter-spacing: -.01em; font-family: 'JetBrains Mono', monospace; }
.result-box:not(.result-box--active) .result-val { color: #94a3b8; font-weight: 400; }

/* ── Margin display ──────────────────────────────────────────────────── */
.field--margin { max-width: 100px; flex: none; }
.margin-display {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 36px; border-radius: 6px; padding: 0 10px; gap: 1px;
  border: 1px solid #e2e8f0;
}
.margin-pct  { font-size: 13px; font-weight: 600; line-height: 1; }
.margin-rm   { font-size: 9px; opacity: .8; }
.margin--neutral { background: #f8fafc; color: #94a3b8; }
.margin--loss { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
.margin--low  { background: #fffbeb; border-color: #fde68a; color: #b45309; }
.margin--ok   { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
.margin--good { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }

/* ── Barcode row & preview ───────────────────────────────────────────── */
.barcode-row   { display: flex; gap: 8px; }
.barcode-field { flex: 1; font-family: 'JetBrains Mono', monospace; letter-spacing: .02em; }

.barcode-preview {
  margin-top: 6px; padding: 12px;
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
  display: flex; flex-direction: column; align-items: center;
}
.barcode-preview svg { max-width: 100%; }
.barcode-err { margin-top: 4px; }

/* ── Action buttons ──────────────────────────────────────────────────── */
.btn-icon-action {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 12px; border-radius: 6px;
  border: 1px solid #e2e8f0; background: #ffffff;
  font-size: 12px; font-family: 'Inter', sans-serif; font-weight: 500;
  color: #475569; cursor: pointer; white-space: nowrap; transition: all .12s;
}
.btn-icon-action:hover          { border-color: #0f172a; color: #0f172a; }
.btn-icon-action.active         { background: #f0fdf4; border-color: #10b981; color: #10b981; }
.btn-icon-action.generate:hover { border-color: #b45309; color: #b45309; }
.btn-icon-action:disabled       { opacity: .45; cursor: not-allowed; pointer-events: none; }

/* ── Hints & errors ──────────────────────────────────────────────────── */
.field-hint { font-size: 11.5px; color: #94a3b8; display: flex; align-items: center; gap: 6px; }
.lc-hint  { color: #6366f1; font-weight: 500; }
.scan-hint { color: #10b981; }
.opt      { font-weight: 400; color: #94a3b8; text-transform: none; letter-spacing: 0; }
.input-readonly { background: #f8fafc; cursor: default; color: #64748b; }
.scan-dot   {
  width: 6px; height: 6px; border-radius: 50%; background: #10b981;
  display: inline-block; animation: blink 1s ease infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
.field-error { font-size: 11.5px; color: #dc2626; }

/* ── Confirm dialog ──────────────────────────────────────────────────── */
.confirm-overlay {
  position: absolute; inset: 0; background: rgba(15, 23, 42, 0.25);
  display: flex; align-items: center; justify-content: center;
  border-radius: inherit; z-index: 10; backdrop-filter: blur(1px);
}
.confirm-box {
  background: #ffffff; border-radius: 8px; padding: 24px 20px;
  width: 300px; display: flex; flex-direction: column; align-items: center;
  gap: 12px; box-shadow: 0 4px 20px rgba(0,0,0,.08);
  border: 1px solid #e2e8f0;
}
.confirm-icon    { width: 40px; height: 40px; border-radius: 50%; background: #fef3c7; display: flex; align-items: center; justify-content: center; }
.confirm-msg     { font-size: 13px; color: #334155; text-align: center; line-height: 1.5; }
.confirm-actions { display: flex; gap: 8px; width: 100%; margin-top: 4px; }
.confirm-actions .btn-ghost { flex: 1; justify-content: center; }
.btn-confirm {
  flex: 1; padding: 8px 16px; border: none; border-radius: 6px;
  background: #16a34a; color: #ffffff;
  font-size: 13px; font-family: 'Inter', sans-serif; font-weight: 500;
  cursor: pointer; transition: background .12s;
}
.btn-confirm:hover { background: #15803d; }

/* ── Footer buttons ──────────────────────────────────────────────────── */
.btn-ghost {
  padding: 8px 16px; border: 1px solid #fecaca; border-radius: 6px;
  background: #ffffff; font-size: 13px; font-family: 'Inter', sans-serif;
  font-weight: 500; color: #dc2626; cursor: pointer; transition: all .12s;
}
.btn-ghost:hover { background: #fef2f2; border-color: #fca5a5; color: #b91c1c; }
.btn-primary {
  padding: 8px 18px; border: none; border-radius: 6px;
  background: #16a34a; color: #ffffff;
  font-size: 13px; font-family: 'Inter', sans-serif; font-weight: 500;
  cursor: pointer; transition: background .12s;
}
.btn-primary:hover { background: #15803d; }
</style>