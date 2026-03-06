<template>
  <div class="modal-overlay" @mousedown.self="$emit('close')">
    <div class="modal-box">
      <div class="modal-header">
        <span class="modal-title">{{ editing ? 'Edit Product' : 'New Product' }}</span>
        <button class="modal-close" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Product Name *</label>
          <input v-model="form.inventoryName" class="form-input" placeholder="e.g. Air Milo Tin" maxlength="150" />
          <span v-if="errors.inventoryName" class="form-error">{{ errors.inventoryName }}</span>
        </div>
        <div class="form-group">
          <label class="form-label">Category *</label>
          <select v-model="form.category_id" class="form-select">
            <option value="" disabled>Select a category</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
          <span v-if="errors.category_id" class="form-error">{{ errors.category_id }}</span>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea v-model="form.description" class="form-textarea" placeholder="Brief product description..." maxlength="500"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Default Low-Stock Threshold</label>
          <input v-model.number="form.default_threshold" type="number" min="0" class="form-input" placeholder="10" />
          <span class="form-hint">Alert when variant stock falls below this value</span>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-ghost" @click="$emit('close')">Cancel</button>
        <button class="btn-primary" @click="submit">
          {{ editing ? 'Save Changes' : 'Create Product' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InventoryModal',
  props: {
    editing: Object,
    categories: Array,
  },
  emits: ['save', 'close'],
  data() {
    return {
      form: {
        inventoryName: '',
        category_id: '',
        description: '',
        default_threshold: 10,
      },
      errors: {},
    }
  },
  created() {
    if (this.editing) this.form = { ...this.editing }
  },
  methods: {
    validate() {
      this.errors = {}
      if (!this.form.inventoryName.trim()) this.errors.inventoryName = 'Product name is required.'
      if (!this.form.category_id) this.errors.category_id = 'Please select a category.'
      return Object.keys(this.errors).length === 0
    },
    submit() {
      if (!this.validate()) return
      this.$emit('save', {
        ...this.form,
        inventoryName: this.form.inventoryName.trim(),
        default_threshold: this.form.default_threshold || 10,
      })
    }
  }
}
</script>

<style scoped>
.form-error { color: var(--red); font-size: 12px; margin-top: 2px; }
.form-hint { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
</style>