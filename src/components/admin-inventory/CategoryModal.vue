<template>
  <div class="inv-modal-backdrop" @click.self="$emit('close')">
    <div class="inv-modal">
      <div class="modal-header">
        <h2 class="modal-title">{{ mode === 'edit' ? 'Edit Category' : 'New Category' }}</h2>
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
  padding: 20px 24px 0;
}
.modal-title { font-size: 16px; font-weight: 700; color: #0f172a; }
.modal-close {
  width: 30px; height: 30px; border-radius: 7px; border: none;
  background: #f1f5f9; color: #64748b; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.modal-close:hover { background: #e2e8f0; }
.modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
  display: flex; justify-content: flex-end; gap: 8px;
}
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: .05em; }
.req { color: #ef4444; }
.field-input {
  padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px;
  font-size: 14px; font-family: 'DM Sans', sans-serif; color: #1e293b;
  outline: none; transition: border-color .15s;
}
.field-input:focus { border-color: #6366f1; }
.field-error { font-size: 12px; color: #ef4444; }
.btn-ghost {
  padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 8px;
  background: #fff; font-size: 13px; font-family: 'DM Sans', sans-serif;
  font-weight: 500; color: #64748b; cursor: pointer; transition: all .15s;
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