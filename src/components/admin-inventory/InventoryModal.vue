<template>
  <div class="inv-modal-backdrop" @click.self="$emit('close')">
    <div class="inv-modal">
      <div class="modal-header">
        <h2 class="modal-title">{{ mode === 'edit' ? 'Edit Product' : 'New Product' }}</h2>
        <button class="modal-close" @click="$emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="field">
          <label class="field-label">Product Name <span class="req">*</span></label>
          <input v-model="form.inventoryName" class="field-input" placeholder="e.g. Air Milo Tin" maxlength="150" />
          <p v-if="errors.inventoryName" class="field-error">{{ errors.inventoryName }}</p>
        </div>
        <div class="field">
          <label class="field-label">Category <span class="req">*</span></label>
          <select v-model="form.category_id" class="field-input">
            <option value="">Select category…</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
          <p v-if="errors.category_id" class="field-error">{{ errors.category_id }}</p>
        </div>
        <div class="field">
          <label class="field-label">Description</label>
          <textarea v-model="form.description" class="field-input field-textarea" placeholder="Optional product description…" rows="3" />
        </div>
        <div class="field">
          <label class="field-label">Default Low Stock Threshold</label>
          <input v-model.number="form.default_threshold" type="number" min="0" class="field-input" placeholder="10" />
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-ghost" @click="$emit('close')">Cancel</button>
        <button class="btn-primary" @click="submit">
          {{ mode === 'edit' ? 'Save Changes' : 'Add Product' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InventoryModal',
  emits: ['close', 'save'],
  props: {
    mode:       { type: String, default: 'add' },
    initial:    { type: Object, default: null },
    categories: { type: Array,  default: () => [] },
    defaultCategoryId: { type: Number, default: null },
  },
  data() {
    return {
      form: {
        inventoryName:     this.initial?.inventoryName     || '',
        category_id:       this.initial?.category_id       || this.defaultCategoryId || '',
        description:       this.initial?.description       || '',
        default_threshold: this.initial?.default_threshold ?? 10,
      },
      errors: {},
    }
  },
  methods: {
    validate() {
      this.errors = {}
      if (!this.form.inventoryName.trim()) this.errors.inventoryName = 'Product name is required.'
      if (!this.form.category_id) this.errors.category_id = 'Please select a category.'
      return !Object.keys(this.errors).length
    },
    submit() {
      if (!this.validate()) return
      this.$emit('save', { ...this.form })
    },
  },
}
</script>

<style scoped>
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px 0;
}
.modal-title { font-size: 15px; font-weight: 600; color: #0f172a; }
.modal-close {
  width: 28px; height: 28px; border-radius: 6px; border: none;
  background: #f1f5f9; color: #64748b; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .12s;
}
.modal-close:hover { background: #e2e8f0; color: #0f172a; }
.modal-body   { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.modal-footer {
  padding: 14px 20px; border-top: 1px solid #f1f5f9;
  display: flex; justify-content: flex-end; gap: 8px;
}
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: .05em; }
.req { color: #dc2626; }
.field-input {
  padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px;
  font-size: 13px; font-family: 'Inter', sans-serif; color: #334155;
  outline: none; transition: border-color .12s; background: #ffffff;
}
.field-input:focus { border-color: #0f172a; }
.field-textarea { resize: vertical; min-height: 80px; }
.field-error { font-size: 11.5px; color: #dc2626; }
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