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
            <label>Shift Type <span class="label-hint">— auto-detected from start time</span></label>
            <div class="shift-type-display" :class="localForm.shiftType === 'Morning' ? 'type-morning' : 'type-evening'">
              <span>{{ localForm.shiftType }}</span>
              <span class="type-hint">{{ localForm.shiftType === 'Morning' ? 'Before 12:00 PM' : '12:00 PM and later' }}</span>
            </div>
          </div>

          <div class="form-row two-col">
            <div>
              <label>Start Time</label>
              <div class="dt-group">
                <div class="dt-field">
                  <input type="date" class="dt-input" :value="localForm.startTime ? localForm.startTime.slice(0,10) : ''" @change="e => setDatePart('startTime', e.target.value)" />
                </div>
                <div class="dt-field">
                  <input type="time" class="dt-input" :value="localForm.startTime ? localForm.startTime.slice(11,16) : ''" @change="e => setTimePart('startTime', e.target.value)" />
                </div>
              </div>
            </div>
            <div>
              <label>End Time</label>
              <div class="dt-group">
                <div class="dt-field">
                  <input type="date" class="dt-input" :value="localForm.endTime ? localForm.endTime.slice(0,10) : ''" @change="e => setDatePart('endTime', e.target.value)" />
                </div>
                <div class="dt-field">
                  <input type="time" class="dt-input" :value="localForm.endTime ? localForm.endTime.slice(11,16) : ''" @change="e => setTimePart('endTime', e.target.value)" />
                </div>
              </div>
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

  methods: {
    setDatePart(field, date) {
      const time = this.localForm[field] ? this.localForm[field].slice(11, 16) : '00:00';
      this.localForm[field] = date ? `${date}T${time}` : '';
    },
    setTimePart(field, time) {
      const date = this.localForm[field] ? this.localForm[field].slice(0, 10) : new Date().toISOString().slice(0, 10);
      this.localForm[field] = time ? `${date}T${time}` : '';
      if (field === 'startTime' && time) {
        const hour = parseInt(time.slice(0, 2), 10);
        this.localForm.shiftType = hour < 12 ? 'Morning' : 'Evening';
      }
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
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  background: #fff;
}
.label-hint {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.68rem;
  font-weight: 400;
  color: #cbd5e1;
  text-transform: none;
  letter-spacing: 0;
}
.shift-type-display {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1.5px solid;
  width: 100%;
}
.type-morning {
  background: #fffbeb;
  border-color: #fde68a;
  color: #92400e;
}
.type-evening {
  background: #eef2ff;
  border-color: #a5b4fc;
  color: #3730a3;
}
.type-hint {
  margin-left: auto;
  font-size: 0.68rem;
  font-weight: 400;
  opacity: 0.6;
}

/* ── DateTime fields ── */
.dt-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.dt-field {
  position: relative;
  display: flex;
  align-items: center;
}
.dt-input {
  width: 100%;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  padding: 8px 10px;
  color: #0f172a;
  background: #f8fafc;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  cursor: pointer;
}
.dt-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  background: #fff;
}
.dt-input::-webkit-calendar-picker-indicator {
  opacity: 0.4;
  cursor: pointer;
}
.dt-input::-webkit-calendar-picker-indicator:hover {
  opacity: 0.8;
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
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 7px;
  padding: 8px 20px;
  cursor: pointer;
  transition: background 0.12s, transform 0.1s, box-shadow 0.12s;
  letter-spacing: -0.01em;
}
.btn-save:hover { background: #4f46e5; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99,102,241,.3); }

/* Transition */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .assign-modal,
.modal-fade-leave-active .assign-modal { transition: transform 0.2s ease; }
.modal-fade-enter-from .assign-modal,
.modal-fade-leave-to   .assign-modal { transform: scale(0.96) translateY(8px); }
</style>