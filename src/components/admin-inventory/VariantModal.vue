<template>
  <div class="inv-modal-backdrop" @click.self="$emit('close')">
    <div class="inv-modal">
      <div class="modal-header">
        <h2 class="modal-title">{{ mode === 'edit' ? 'Edit Variant' : 'New Variant' }}</h2>
        <button class="modal-close" @click="$emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="modal-body">

        <!-- Variant Name -->
        <div class="field">
          <label class="field-label">Variant Name <span class="req">*</span></label>
          <input v-model="form.variant_name" class="field-input" placeholder="e.g. 500ml, 1kg, Red" maxlength="50" />
          <p v-if="errors.variant_name" class="field-error">{{ errors.variant_name }}</p>
        </div>

        <!-- Price & Quantity row -->
        <div class="field-row">
          <div class="field">
            <label class="field-label">Price (RM) <span class="req">*</span></label>
            <div class="input-prefix-wrap">
              <span class="input-prefix">RM</span>
              <input v-model.number="form.price" type="number" min="0" step="0.01" class="field-input prefix-input" placeholder="0.00" />
            </div>
            <p v-if="errors.price" class="field-error">{{ errors.price }}</p>
          </div>
          <div class="field">
            <label class="field-label">Quantity</label>
            <input v-model.number="form.quantity" type="number" min="0" class="field-input" placeholder="0" />
          </div>
          <div class="field">
            <label class="field-label">Low Stock Threshold</label>
            <input v-model.number="form.threshold" type="number" min="0" class="field-input" placeholder="10" />
          </div>
        </div>

        <!-- Barcode -->
        <div class="field">
          <label class="field-label">Barcode <span class="req">*</span></label>
          <div class="barcode-row">
            <input
              ref="barcodeInput"
              v-model="form.barcode"
              class="field-input barcode-field"
              placeholder="Scan or generate barcode…"
              :class="{ scanning: scanMode }"
              @keydown.enter.prevent="onBarcodeEnter"
            />
            <button
              class="btn-icon-action"
              :class="{ active: scanMode }"
              @click="toggleScan"
              title="Toggle barcode scanner mode"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9V5a2 2 0 012-2h4M3 15v4a2 2 0 002 2h4M21 9V5a2 2 0 00-2-2h-4M21 15v4a2 2 0 01-2 2h-4"/>
                <line x1="7" y1="12" x2="7" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="17" y1="12" x2="17" y2="12"/>
              </svg>
              {{ scanMode ? 'Scanning…' : 'Scan' }}
            </button>
            <button class="btn-icon-action generate" @click="generateBarcode" title="Auto-generate barcode">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
              </svg>
              Generate
            </button>
          </div>
          <p class="field-hint" v-if="scanMode">
            <span class="scan-dot" /> Awaiting scan — focus is on the barcode field. Scan now.
          </p>
          <p v-if="errors.barcode" class="field-error">{{ errors.barcode }}</p>
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
export default {
  name: 'VariantModal',
  emits: ['close', 'save'],
  props: {
    mode:    { type: String, default: 'add' },
    initial: { type: Object, default: null },
    inventoryId: { type: Number, default: null },
  },
  data() {
    return {
      form: {
        variant_name: this.initial?.variant_name || '',
        price:        this.initial?.price        || '',
        quantity:     this.initial?.quantity      ?? 0,
        threshold:    this.initial?.threshold     ?? 10,
        barcode:      this.initial?.barcode       || '',
      },
      errors:   {},
      scanMode: false,
    }
  },
  methods: {
    toggleScan() {
      this.scanMode = !this.scanMode
      if (this.scanMode) {
        this.$nextTick(() => this.$refs.barcodeInput?.focus())
      }
    },
    onBarcodeEnter() {
      // When scanner fires Enter after reading barcode
      if (this.scanMode) {
        this.scanMode = false
      }
    },
    generateBarcode() {
      // Generate EAN-13-style numeric barcode
      const base = Date.now().toString().slice(-11) + Math.floor(Math.random() * 10)
      this.form.barcode = base
    },
    validate() {
      this.errors = {}
      if (!this.form.variant_name.trim()) this.errors.variant_name = 'Variant name is required.'
      if (!this.form.price || this.form.price <= 0) this.errors.price = 'Enter a valid price.'
      if (!this.form.barcode.trim()) this.errors.barcode = 'Barcode is required. Scan or generate one.'
      return !Object.keys(this.errors).length
    },
    submit() {
      if (!this.validate()) return
      this.$emit('save', { ...this.form, inventory_id: this.inventoryId })
    },
  },
}
</script>

<style scoped>
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 0; position: sticky; top: 0; background: #fff; z-index: 1;
  padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;
}
.modal-title { font-size: 16px; font-weight: 700; color: #0f172a; }
.modal-close {
  width: 30px; height: 30px; border-radius: 7px; border: none;
  background: #f1f5f9; color: #64748b; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.modal-close:hover { background: #e2e8f0; }
.modal-body   { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
.modal-footer {
  padding: 16px 24px; border-top: 1px solid #f1f5f9;
  display: flex; justify-content: flex-end; gap: 8px;
  position: sticky; bottom: 0; background: #fff;
}
.field { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.field-row { display: flex; gap: 12px; }
.field-label { font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: .05em; }
.req { color: #ef4444; }
.field-input {
  padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px;
  font-size: 14px; font-family: 'DM Sans', sans-serif; color: #1e293b;
  outline: none; transition: border-color .15s; background: #fff;
  width: 100%;
}
.field-input:focus { border-color: #6366f1; }
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
.input-prefix {
  position: absolute; left: 10px;
  font-size: 13px; font-weight: 600; color: #94a3b8;
  pointer-events: none;
}
.prefix-input { padding-left: 30px !important; }

.barcode-row { display: flex; gap: 8px; }
.barcode-field { flex: 1; font-family: 'DM Mono', monospace; letter-spacing: .04em; }

.btn-icon-action {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 12px; border-radius: 8px;
  border: 1px solid #e2e8f0; background: #f8fafc;
  font-size: 12.5px; font-family: 'DM Sans', sans-serif; font-weight: 600;
  color: #475569; cursor: pointer; white-space: nowrap;
  transition: all .15s;
}
.btn-icon-action:hover { border-color: #6366f1; color: #6366f1; }
.btn-icon-action.active { background: #f0fdf4; border-color: #10b981; color: #10b981; }
.btn-icon-action.generate:hover { border-color: #f59e0b; color: #f59e0b; }

.field-hint { font-size: 12px; color: #10b981; display: flex; align-items: center; gap: 6px; }
.scan-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: #10b981; display: inline-block;
  animation: blink 1s ease infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
.field-error { font-size: 12px; color: #ef4444; }

.btn-ghost {
  padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 8px;
  background: #fff; font-size: 13px; font-family: 'DM Sans', sans-serif;
  font-weight: 500; color: #64748b; cursor: pointer;
}
.btn-ghost:hover { background: #f8fafc; }
.btn-primary {
  padding: 8px 18px; border: none; border-radius: 8px;
  background: #6366f1; color: #fff;
  font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 600;
  cursor: pointer; transition: background .15s;
}
.btn-primary:hover { background: #4f46e5; }
</style>