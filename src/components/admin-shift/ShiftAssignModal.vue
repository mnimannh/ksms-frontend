<template>
  <transition name="modal-fade">
    <div v-if="visible" class="modal-overlay" @click.self="$emit('close')">
      <div class="assign-modal">

        <div class="assign-modal-header">
          <span>{{ isEditing ? 'Edit Shift' : 'Assign New Shift' }}</span>
          <button class="modal-x" @click="$emit('close')">✕</button>
        </div>

        <div class="assign-modal-body">
<div class="form-row">
  <label>Staff Member</label>
  <select v-model="localForm.userID" :disabled="isEditing">
    <option v-for="s in staffList" :key="s.id" :value="s.id">{{ s.fullName }}</option>
  </select>
</div>

          <div class="form-row">
            <label>Shift Type</label>
            <div class="shift-type-toggle">
              <button :class="{ active: localForm.shiftType === 'Morning' }" @click="localForm.shiftType = 'Morning'">🌤 Morning</button>
              <button :class="{ active: localForm.shiftType === 'Evening' }" @click="localForm.shiftType = 'Evening'">🌙 Evening</button>
            </div>
          </div>

          <div class="form-row two-col">
            <div>
              <label>Start Time</label>
              <input type="datetime-local" v-model="localForm.startTime" />
            </div>
            <div>
              <label>End Time</label>
              <input type="datetime-local" v-model="localForm.endTime" />
            </div>
          </div>

          <div class="form-row">
            <label>Notes</label>
            <textarea v-model="localForm.notes" rows="3" placeholder="Optional notes…"></textarea>
          </div>
        </div>

        <div class="assign-modal-footer">
          <button class="btn-cancel" @click="$emit('close')">Cancel</button>
          <button class="btn-save" @click="$emit('save', localForm)">
            {{ isEditing ? 'Save Changes' : 'Assign Shift' }}
          </button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ShiftAssignModal',
  props: {
    visible:   { type: Boolean, required: true },
    isEditing: { type: Boolean, default: false },
    staffList: { type: Array,   required: true },
    form:      { type: Object,  required: true },
  },
  emits: ['close', 'save'],

  data() {
    return {
      localForm: { ...this.form },
    };
  },

  watch: {
    form(val) {
      this.localForm = { ...val };
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.assign-modal {
  background: #fff;
  border-radius: 14px;
  width: 460px;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(15,23,42,0.2);
}
.assign-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid #f1f5f9;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  color: #0f172a;
  letter-spacing: -0.02em;
}
.modal-x {
  background: #f1f5f9;
  border: none;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.7rem;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s;
}
.modal-x:hover { background: #e2e8f0; color: #0f172a; }

.assign-modal-body { padding: 20px 22px; display: flex; flex-direction: column; gap: 16px; }

.form-row { display: flex; flex-direction: column; gap: 5px; }
.form-row.two-col { flex-direction: row; gap: 12px; }
.form-row.two-col > div { flex: 1; display: flex; flex-direction: column; gap: 5px; }
.form-row label {
  font-family: 'DM Mono', monospace;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #94a3b8;
}
.form-row select,
.form-row input,
.form-row textarea {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  border: 1px solid #f1f5f9;
  border-radius: 7px;
  padding: 8px 12px;
  color: #0f172a;
  background: #f8fafc;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  resize: none;
}
.form-row select:focus,
.form-row input:focus,
.form-row textarea:focus {
  border-color: #0f172a;
  box-shadow: 0 0 0 3px rgba(15,23,42,0.08);
  background: #fff;
}
.shift-type-toggle { display: flex; gap: 8px; }
.shift-type-toggle button {
  flex: 1;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  border: 2px solid #f1f5f9;
  border-radius: 8px;
  padding: 9px;
  cursor: pointer;
  background: #f8fafc;
  color: #64748b;
  transition: all 0.15s;
}
.shift-type-toggle button.active {
  border-color: #0f172a;
  background: #0f172a;
  color: #fff;
}

.assign-modal-footer {
  display: flex;
  gap: 10px;
  padding: 16px 22px;
  border-top: 1px solid #f1f5f9;
  justify-content: flex-end;
}
.btn-cancel {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid #f1f5f9;
  background: #fff;
  color: #64748b;
  border-radius: 7px;
  padding: 8px 18px;
  cursor: pointer;
  transition: all 0.12s;
}
.btn-cancel:hover { background: #f8fafc; color: #0f172a; }
.btn-save {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  background: #0f172a;
  color: #fff;
  border: none;
  border-radius: 7px;
  padding: 8px 20px;
  cursor: pointer;
  transition: background 0.12s, transform 0.1s;
  letter-spacing: -0.01em;
}
.btn-save:hover { background: #1e293b; transform: translateY(-1px); }

/* Transition */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .assign-modal,
.modal-fade-leave-active .assign-modal { transition: transform 0.2s ease; }
.modal-fade-enter-from .assign-modal,
.modal-fade-leave-to   .assign-modal { transform: scale(0.96) translateY(8px); }
</style>