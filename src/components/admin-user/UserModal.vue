<template>
  <div v-if="visible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <header class="modal-header">
        <h2>{{ user ? 'Edit User' : 'Add User' }}</h2>
        <button class="close-btn" @click="closeModal">✕</button>
      </header>

      <form @submit.prevent="submitForm" class="modal-form">
        <!-- Full Name -->
        <div class="form-group">
          <label for="fullName">Full Name</label>
          <input id="fullName" type="text" v-model="form.fullName" required />
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" type="email" v-model="form.email" required />
        </div>

        <!-- Role -->
        <div class="form-group">
          <label for="role">Role</label>
          <select id="role" v-model="form.role" required>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        <!-- Status -->
        <div class="form-group">
          <label>Status</label>
          <div class="status-options">
            <label>
              <input type="radio" value="active" v-model="form.status" />
              Active
            </label>
            <label>
              <input type="radio" value="inactive" v-model="form.status" />
              Inactive
            </label>
          </div>
        </div>

        <!-- Change Password Toggle (Edit Only) -->
        <div v-if="user" class="form-group">
          <label>
            <input type="checkbox" v-model="changingPassword" />
            Change Password
          </label>
        </div>

        <!-- Password -->
        <div class="form-group" v-if="!user || changingPassword">
          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            v-model="form.password"
            :required="!user || changingPassword"
          />
        </div>

        <!-- Confirm Password -->
        <div class="form-group" v-if="!user || changingPassword">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            v-model="form.confirmPassword"
            :required="!user || changingPassword"
          />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-save">
            {{ user ? 'Update' : 'Add' }}
          </button>
          <button type="button" class="btn-cancel" @click="closeModal">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'UserModal',
  props: {
    visible: { type: Boolean, default: false },
    user: { type: Object, default: null } // null = Add, object = Edit
  },
  data() {
    return {
      form: {
        fullName: '',
        email: '',
        role: 'staff',
        status: 'active',
        password: '',
        confirmPassword: ''
      },
      changingPassword: false,
      loading: false
    }
  },
  watch: {
    user: {
      immediate: true,
      handler(val) {
        if (val) {
          this.form = {
            fullName: val.fullName,
            email: val.email,
            role: val.role,
            status: val.status,
            password: '',
            confirmPassword: ''
          }
          this.changingPassword = false
        } else {
          this.form = {
            fullName: '',
            email: '',
            role: 'staff',
            status: 'active',
            password: '',
            confirmPassword: ''
          }
          this.changingPassword = false
        }
      }
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },
    async submitForm() {
      // Password validation only if adding or changing password
      if ((!this.user || this.changingPassword) && this.form.password !== this.form.confirmPassword) {
        alert('Passwords do not match!')
        return
      }

      this.loading = true
      try {
        const payload = { ...this.form }

        if (this.user) {
          // Edit user
          if (!this.changingPassword || !payload.password) {
            delete payload.password
          }
          delete payload.confirmPassword
          await axios.put(`http://localhost:3000/api/users/${this.user.id}`, payload)
        } else {
          // Add user
          delete payload.confirmPassword
          await axios.post('http://localhost:3000/api/users', payload)
        }

        this.$emit('save')
        this.closeModal()
      } catch (err) {
        console.error('Error saving user:', err)
        alert('Failed to save user.')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background: #fff;
  width: 400px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #2980b9;
  color: white;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
}

.modal-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.status-options {
  display: flex;
  gap: 20px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

.btn-save {
  background: #27ae60;
  color: white;
  border: none;
  padding: 7px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cancel {
  background: #c0392b;
  color: white;
  border: none;
  padding: 7px 15px;
  border-radius: 4px;
  cursor: pointer;
}
</style>