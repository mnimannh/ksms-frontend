<template>
  <div class="inv-modal-backdrop" @click.self="$emit('close')">
    <div class="inv-modal">
      <div class="modal-header">
        <div class="header-left">
          <div class="header-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
          </div>
          <div>
            <p class="header-eyebrow">{{ mode === 'edit' ? 'Edit' : 'New' }} Category</p>
            <h2 class="modal-title">{{ mode === 'edit' ? (initial?.name || 'Category') : 'Add Category' }}</h2>
          </div>
        </div>
        <button class="modal-close" @click="$emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="field">
          <label class="field-label">Category Name <span class="req">*</span></label>
          <input v-model="form.name" class="field-input" placeholder="e.g. Beverages" maxlength="100" />
          <p v-if="errors.name" class="field-error">{{ errors.name }}</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-ghost" @click="$emit('close')">Cancel</button>
        <button class="btn-primary" @click="submit">
          {{ mode === 'edit' ? 'Save Changes' : 'Add Category' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CategoryModal',
  emits: ['close', 'save'],
  props: {
    mode:     { type: String, default: 'add' },
    initial:  { type: Object, default: null },
  },
  data() {
    return {
      form:   { name: this.initial?.name || '' },
      errors: {},
    }
  },
  methods: {
    validate() {
      this.errors = {}
      if (!this.form.name.trim()) this.errors.name = 'Category name is required.'
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
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
}
.header-left { display: flex; align-items: center; gap: 12px; }
.header-icon {
  width: 36px; height: 36px; border-radius: 6px;
  background: #f1f5f9;
  display: flex; align-items: center; justify-content: center;
  color: #0f172a; flex-shrink: 0;
  border: 1px solid #e2e8f0;
}
.header-eyebrow {
  font-size: 9.5px; font-weight: 600; letter-spacing: .08em;
  text-transform: uppercase; color: #64748b; margin-bottom: 1px;
}
.modal-title { font-size: 15px; font-weight: 600; color: #0f172a; }
.modal-close {
  width: 28px; height: 28px; border-radius: 6px; border: none;
  background: #f1f5f9; color: #64748b; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .12s;
}
.modal-close:hover { background: #e2e8f0; color: #0f172a; }
.modal-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.modal-footer {
  padding: 14px 20px;
  border-top: 1px solid #f1f5f9;
  display: flex; justify-content: flex-end; gap: 8px;
}
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 11px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: .05em; }
.req { color: #dc2626; }
.field-input {
  padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 6px;
  font-size: 13px; font-family: 'Inter', sans-serif; color: #334155;
  outline: none; transition: border-color .12s;
}
.field-input:focus { border-color: #0f172a; }
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