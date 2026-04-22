<template>
  <div class="app-layout">
    <StaffSidebar />

    <main class="profile-page">

      <!-- TEMP PASSWORD BANNER -->
      <transition name="banner-slide">
        <div v-if="profile.is_temp_password" class="temp-banner">
          <div class="banner-left">
            <div class="banner-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <div>
              <p class="banner-title">Temporary Password Detected</p>
              <p class="banner-msg">Your account was created with a temporary password. Please set a new password to secure your account.</p>
            </div>
          </div>
          <button class="banner-btn" @click="startEditPassword">Set New Password</button>
        </div>
      </transition>

      <!-- PAGE HEADER -->
      <div class="page-header">
        <div>
          <p class="page-date">{{ todayFull }}</p>
          <h1 class="page-title">My <span class="accent">Profile</span></h1>
        </div>
        <div class="header-actions">
          <button v-if="!editing" class="btn-edit" @click="startEdit">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit Profile
          </button>
          <template v-else>
            <button class="btn-cancel" @click="cancelEdit">Cancel</button>
            <button class="btn-save" :disabled="saving" @click="saveProfile">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {{ saving ? 'Saving…' : 'Save Changes' }}
            </button>
          </template>
        </div>
      </div>

      <div v-if="loading" class="loading-state">Loading profile…</div>

      <div v-else class="profile-content">

        <!-- HERO CARD -->
        <div class="hero-card">
          <div class="hero-stripe"></div>
          <div class="hero-inner">
            <!-- Avatar -->
            <div class="avatar-wrap">
              <img v-if="profile.profile_picture" :src="apiBase + profile.profile_picture" class="avatar-img" :class="{ clickable: !editing }" alt="Profile" @click="!editing && openLightbox()" />
              <div v-else class="avatar-initials">{{ initials }}</div>
              <label v-if="editing" class="avatar-cam" :class="{ uploading: avatarUploading }" title="Change photo">
                <input type="file" accept="image/*" class="hidden-input" @change="onAvatarChange" :disabled="avatarUploading" />
                <svg v-if="!avatarUploading" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/>
                </svg>
                <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="spin-icon">
                  <circle cx="12" cy="12" r="10" stroke-opacity="0.3"/><path d="M12 2a10 10 0 0110 10"/>
                </svg>
              </label>
            </div>

            <!-- Info -->
            <div class="hero-info">
              <div class="hero-top">
                <h2 class="hero-name">{{ profile.fullName }}</h2>
                <div class="hero-pills">
                  <span class="pill-role">{{ profile.role }}</span>
                  <span class="pill-active"><span class="active-dot"></span> Active</span>
                </div>
              </div>
              <div class="hero-meta">
                <div class="meta-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <span>{{ profile.email }}</span>
                </div>
                <div class="meta-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.14 1.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.45-.45a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/></svg>
                  <span>{{ profile.phone || '—' }}</span>
                </div>
                <div class="meta-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <span>Member since {{ memberSince }}</span>
                </div>
                <div v-if="profile.address" class="meta-item">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>{{ profile.address }}</span>
                </div>
              </div>
            </div>

            <!-- Stats strip -->
            <div class="hero-stats">
              <div class="stat-item">
                <p class="stat-val">{{ profile.matric_no || '—' }}</p>
                <p class="stat-label">Matric No.</p>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <p class="stat-val">{{ profile.course || '—' }}</p>
                <p class="stat-label">Course</p>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <p class="stat-val">{{ profile.year_of_study ? `Year ${profile.year_of_study}` : '—' }}</p>
                <p class="stat-label">Year of Study</p>
              </div>
            </div>
          </div>
        </div>

        <!-- CARDS GRID -->
        <div class="cards-grid">

          <!-- Personal Information -->
          <div class="info-card">
            <div class="card-accent blue"></div>
            <div class="card-head">
              <div class="card-icon blue-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <span class="card-title">Personal Information</span>
            </div>
            <div class="field-grid">
              <div class="field-group">
                <label>Full Name</label>
                <p class="field-value">{{ profile.fullName }}</p>
              </div>
              <div class="field-group">
                <label>Email Address</label>
                <p class="field-value muted">{{ profile.email }}</p>
              </div>
              <div class="field-group">
                <label>Phone Number</label>
                <input v-if="editing" v-model="form.phone" class="field-input" placeholder="e.g. 01XXXXXXXX" />
                <p v-else class="field-value">{{ profile.phone || '—' }}</p>
              </div>
              <div class="field-group">
                <label>Address</label>
                <textarea v-if="editing" v-model="form.address" class="field-input field-textarea" rows="3" placeholder="e.g. No 1, Jalan..."></textarea>
                <p v-else class="field-value">{{ profile.address || '—' }}</p>
              </div>
            </div>
          </div>

          <!-- Academic Information -->
          <div class="info-card">
            <div class="card-accent green"></div>
            <div class="card-head">
              <div class="card-icon green-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              </div>
              <span class="card-title">Academic Information</span>
            </div>
            <div class="field-grid">
              <div class="field-group">
                <label>Matric No.</label>
                <input v-if="editing" v-model="form.matric_no" class="field-input" placeholder="e.g. A12345" />
                <p v-else class="field-value mono">{{ profile.matric_no || '—' }}</p>
              </div>
              <div class="field-group">
                <label>Course</label>
                <input v-if="editing" v-model="form.course" class="field-input" placeholder="e.g. Diploma in IT" />
                <p v-else class="field-value">{{ profile.course || '—' }}</p>
              </div>
              <div class="field-group full-span">
                <label>Year of Study</label>
                <select v-if="editing" v-model="form.year_of_study" class="field-input field-select">
                  <option value="">— Select —</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
                <p v-else class="field-value">{{ profile.year_of_study ? `Year ${profile.year_of_study}` : '—' }}</p>
              </div>
            </div>
          </div>

          <!-- Account -->
          <div class="info-card" :class="{ 'full-span': !editing && !profile.is_temp_password }">
            <div class="card-accent purple"></div>
            <div class="card-head">
              <div class="card-icon purple-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </div>
              <span class="card-title">Account</span>
            </div>
            <div class="field-grid">
              <div class="field-group">
                <label>Role</label>
                <p class="field-value"><span class="role-pill">{{ profile.role }}</span></p>
              </div>
              <div class="field-group">
                <label>Status</label>
                <p class="field-value"><span class="status-pill-sm"><span class="status-dot-sm"></span>Active</span></p>
              </div>
              <div class="field-group">
                <label>Member Since</label>
                <p class="field-value muted">{{ memberSince }}</p>
              </div>
              <div class="field-group">
                <label>Last Login</label>
                <p class="field-value muted">{{ lastLogin }}</p>
              </div>
            </div>
          </div>

          <!-- Change Password — only in edit mode or when temp password -->
          <div v-if="editing || profile.is_temp_password" class="info-card" ref="passwordCard" :class="{ 'card-urgent': profile.is_temp_password }">
            <div class="card-accent" :class="profile.is_temp_password ? 'red' : 'slate'"></div>
            <div class="card-head">
              <div class="card-icon" :class="profile.is_temp_password ? 'red-icon' : 'slate-icon'">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
              </div>
              <span class="card-title">Change Password</span>
              <span v-if="profile.is_temp_password" class="badge-urgent">Action Required</span>
            </div>
            <div class="field-grid">
              <div class="field-group">
                <label>New Password</label>
                <input v-model="pwForm.newPassword" type="password" class="field-input" placeholder="Min. 6 characters" />
              </div>
              <div class="field-group">
                <label>Confirm Password</label>
                <input v-model="pwForm.confirmPassword" type="password" class="field-input" placeholder="Repeat password" />
              </div>
            </div>
            <p v-if="pwError" class="pw-error">{{ pwError }}</p>
            <p v-if="pwSuccess" class="pw-success">{{ pwSuccess }}</p>
            <div class="pw-actions">
              <button class="btn-pw" :disabled="pwSaving" @click="submitChangePassword">
                {{ pwSaving ? 'Saving…' : 'Update Password' }}
              </button>
            </div>
          </div>

        </div>
      </div>
      <!-- LIGHTBOX -->
      <transition name="lb">
        <div v-if="lightbox" class="lightbox" @click.self="closeLightbox" @keydown.esc="closeLightbox">
          <button class="lb-close" @click="closeLightbox">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <img :src="apiBase + profile.profile_picture" class="lb-img" :alt="profile.fullName" />
        </div>
      </transition>

    </main>
  </div>
</template>

<script>
import StaffSidebar from '@/components/sidebar/staffSidebar.vue';
import axios from 'axios';
import API_BASE_URL from '@/services/api';

export default {
  name: 'StaffProfile',
  components: { StaffSidebar },

  data() {
    return {
      loading: true,
      editing: false,
      saving: false,
      profile: {},
      form: {},
      pwForm: { newPassword: '', confirmPassword: '' },
      pwError: '',
      pwSuccess: '',
      pwSaving: false,
      avatarUploading: false,
      apiBase: API_BASE_URL,
      lightbox: false,
    };
  },

  computed: {
    initials() {
      return (this.profile.fullName || 'S')
        .split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    },
    todayFull() {
      return new Date().toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    },
    memberSince() {
      if (!this.profile.created_at) return '—';
      return new Date(this.profile.created_at).toLocaleDateString('en-MY', { month: 'long', year: 'numeric' });
    },
    lastLogin() {
      if (!this.profile.last_login) return '—';
      return new Date(this.profile.last_login).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
    },
  },

  async mounted() {
    await this.loadProfile();
    window.addEventListener('keydown', this.onKeydown);
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeydown);
  },

  methods: {
    async loadProfile() {
      try {
        const token = localStorage.getItem('userToken');
        const res = await axios.get(`${API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.profile = res.data;
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        this.loading = false;
      }
    },

    openLightbox()  { this.lightbox = true; },
    closeLightbox() { this.lightbox = false; },
    onKeydown(e)    { if (e.key === 'Escape') this.closeLightbox(); },

    startEdit() {
      this.form = {
        phone:         this.profile.phone || '',
        address:       this.profile.address || '',
        matric_no:     this.profile.matric_no || '',
        course:        this.profile.course || '',
        year_of_study: this.profile.year_of_study || '',
      };
      this.editing = true;
    },

    startEditPassword() {
      this.startEdit();
      this.$nextTick(() => {
        this.$refs.passwordCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    },

    cancelEdit() {
      this.editing = false;
      this.pwError = '';
      this.pwSuccess = '';
    },

    async saveProfile() {
      this.saving = true;
      try {
        const token = localStorage.getItem('userToken');
        await axios.put(`${API_BASE_URL}/api/profile`, this.form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Object.assign(this.profile, this.form);
        this.editing = false;
      } catch (err) {
        console.error('Failed to save profile', err);
      } finally {
        this.saving = false;
      }
    },

    async submitChangePassword() {
      this.pwError = '';
      this.pwSuccess = '';
      if (!this.pwForm.newPassword || this.pwForm.newPassword.length < 6) {
        this.pwError = 'Password must be at least 6 characters.';
        return;
      }
      if (this.pwForm.newPassword !== this.pwForm.confirmPassword) {
        this.pwError = 'Passwords do not match.';
        return;
      }
      this.pwSaving = true;
      try {
        const token = localStorage.getItem('userToken');
        await axios.put(`${API_BASE_URL}/api/profile/password`,
          { newPassword: this.pwForm.newPassword },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.pwSuccess = 'Password updated successfully!';
        this.pwForm = { newPassword: '', confirmPassword: '' };
        this.profile.is_temp_password = false;
      } catch (err) {
        this.pwError = err.response?.data?.message || 'Failed to update password.';
      } finally {
        this.pwSaving = false;
      }
    },

    async onAvatarChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      this.avatarUploading = true;
      try {
        const token = localStorage.getItem('userToken');
        const fd = new FormData();
        fd.append('image', file);
        const res = await axios.post(`${API_BASE_URL}/api/profile/picture`, fd, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        this.profile.profile_picture = res.data.url;
      } catch (err) {
        console.error('Avatar upload failed', err);
      } finally {
        this.avatarUploading = false;
        e.target.value = '';
      }
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Layout ── */
.app-layout  { display: flex; min-height: 100vh; background: #f1f5f9; font-family: 'DM Sans', sans-serif; }
.profile-page { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

/* ── Temp banner ── */
.temp-banner {
  display: flex; flex-direction: column; gap: 10px;
  background: #fef2f2; border-bottom: 1px solid #fecaca;
  padding: 12px 16px; flex-shrink: 0;
}
.banner-left { display: flex; align-items: flex-start; gap: 10px; }
.banner-icon { width: 32px; height: 32px; border-radius: 50%; background: #fee2e2; color: #dc2626; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.banner-title { font-size: 13px; font-weight: 700; color: #dc2626; margin-bottom: 2px; }
.banner-msg   { font-size: 12px; color: #b91c1c; line-height: 1.5; }
.banner-btn { align-self: flex-start; padding: 7px 16px; border-radius: 8px; border: none; background: #dc2626; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: background .15s; }
.banner-btn:hover { background: #b91c1c; }
.banner-slide-enter-active, .banner-slide-leave-active { transition: all .25s ease; }
.banner-slide-enter-from, .banner-slide-leave-to { opacity: 0; transform: translateY(-8px); }

/* ── Page header ── */
.page-header { display: flex; flex-direction: column; gap: 10px; padding: 16px 16px 12px; flex-shrink: 0; }
.page-date   { font-size: 11px; color: #94a3b8; letter-spacing: .03em; margin-bottom: 2px; }
.page-title  { font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -.02em; }
.accent { color: #6366f1; }
.header-actions { display: flex; align-items: center; gap: 8px; }

.btn-edit   { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 9px; border: 1px solid #e2e8f0; background: #fff; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #475569; cursor: pointer; transition: all .15s; }
.btn-edit:hover { border-color: #6366f1; color: #6366f1; }
.btn-cancel { padding: 8px 14px; border-radius: 9px; border: 1px solid #e2e8f0; background: #f8fafc; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #64748b; cursor: pointer; }
.btn-save   { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 9px; border: none; background: #16a34a; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: background .15s; }
.btn-save:hover:not(:disabled) { background: #15803d; }
.btn-save:disabled { opacity: .6; cursor: not-allowed; }

.loading-state { padding: 48px; text-align: center; color: #94a3b8; font-size: 13px; }

/* ── Profile content ── */
.profile-content { flex: 1; padding: 0 16px 24px; overflow-y: auto; display: flex; flex-direction: column; gap: 14px; min-height: 0; }
.profile-content::-webkit-scrollbar { width: 4px; }
.profile-content::-webkit-scrollbar-track { background: transparent; }
.profile-content::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

/* ── Hero card ── */
.hero-card   { background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; overflow: hidden; position: relative; }
.hero-stripe { position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #6366f1, #8b5cf6, #3b82f6); }

/* Mobile: stacked hero */
.hero-inner {
  display: flex; flex-direction: column; align-items: center;
  gap: 14px; padding: 24px 20px 20px; text-align: center;
}

/* Avatar */
.avatar-wrap     { position: relative; flex-shrink: 0; }
.avatar-img      { width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #e2e8f0; display: block; }
.avatar-initials { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #818cf8); color: #fff; font-size: 28px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.avatar-cam { position: absolute; bottom: 2px; right: 2px; width: 24px; height: 24px; border-radius: 50%; background: #6366f1; color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; transition: background .15s; }
.avatar-cam:hover    { background: #4f46e5; }
.avatar-cam.uploading { background: #94a3b8; cursor: not-allowed; }
.hidden-input { display: none; }
@keyframes spin { to { transform: rotate(360deg); } }
.spin-icon { animation: spin .7s linear infinite; }

/* Hero info */
.hero-info { min-width: 0; width: 100%; }
.hero-top  { display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 10px; }
.hero-name { font-size: 18px; font-weight: 700; color: #0f172a; letter-spacing: -.01em; }
.hero-pills { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: center; }
.pill-role   { background: #eef2ff; color: #6366f1; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 99px; text-transform: capitalize; }
.pill-active { display: flex; align-items: center; gap: 5px; background: #f0fdf4; color: #15803d; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 99px; }
.active-dot  { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; display: inline-block; }
.hero-meta { display: flex; flex-direction: column; gap: 6px; align-items: center; }
.meta-item { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #64748b; }
.meta-item svg { color: #94a3b8; flex-shrink: 0; }

/* Stats strip — horizontal row at bottom on mobile */
.hero-stats    { display: flex; align-items: center; width: 100%; border-top: 1px solid #f1f5f9; padding-top: 16px; justify-content: center; }
.stat-item     { display: flex; flex-direction: column; align-items: center; padding: 0 16px; text-align: center; flex: 1; }
.stat-val      { font-size: 13px; font-weight: 700; color: #0f172a; white-space: nowrap; max-width: 100px; overflow: hidden; text-overflow: ellipsis; }
.stat-label    { font-size: 10px; color: #94a3b8; margin-top: 3px; white-space: nowrap; }
.stat-divider  { width: 1px; height: 32px; background: #f1f5f9; flex-shrink: 0; }

/* ── Cards grid — single column on mobile ── */
.cards-grid { display: grid; grid-template-columns: 1fr; gap: 14px; flex: 1; align-content: start; }

/* ── Info card ── */
.info-card { background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; padding: 18px 18px; position: relative; overflow: hidden; }
.info-card.full-span  { grid-column: 1 / -1; }
.info-card.card-urgent { border-color: #fecaca; box-shadow: 0 0 0 3px rgba(220,38,38,.06); }

.card-accent        { position: absolute; top: 0; left: 0; width: 4px; height: 100%; border-radius: 14px 0 0 14px; }
.card-accent.blue   { background: #3b82f6; }
.card-accent.green  { background: #10b981; }
.card-accent.purple { background: #8b5cf6; }
.card-accent.red    { background: #ef4444; }
.card-accent.slate  { background: #94a3b8; }

.card-head  { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; padding-left: 8px; }
.card-title { font-size: 13.5px; font-weight: 700; color: #0f172a; flex: 1; }

.card-icon    { width: 32px; height: 32px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.blue-icon    { background: #eff6ff; color: #3b82f6; }
.green-icon   { background: #f0fdf4; color: #10b981; }
.purple-icon  { background: #faf5ff; color: #8b5cf6; }
.red-icon     { background: #fef2f2; color: #ef4444; }
.slate-icon   { background: #f8fafc; color: #64748b; }

.badge-urgent { font-size: 10px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; background: #fee2e2; color: #dc2626; padding: 3px 8px; border-radius: 99px; }

/* Fields — single column on mobile */
.field-grid { display: grid; grid-template-columns: 1fr; gap: 14px; padding-left: 8px; }
.field-group { display: flex; flex-direction: column; gap: 5px; }
.field-group.full-span { grid-column: 1 / -1; }
.field-group label { font-size: 10.5px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .07em; }
.field-value      { font-size: 13px; color: #0f172a; font-weight: 500; }
.field-value.muted { color: #64748b; font-weight: 400; }
.field-value.mono  { font-family: 'DM Mono', monospace; font-size: 12.5px; }

.field-input { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 13px; color: #0f172a; background: #f8fafc; outline: none; transition: border-color .15s; width: 100%; }
.field-input:focus { border-color: #6366f1; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,.08); }
.field-textarea { resize: vertical; line-height: 1.5; }
.field-select   { appearance: none; cursor: pointer; }

.role-pill      { display: inline-block; background: #eef2ff; color: #6366f1; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 99px; text-transform: capitalize; }
.status-pill-sm { display: inline-flex; align-items: center; gap: 5px; background: #f0fdf4; color: #15803d; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 99px; }
.status-dot-sm  { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; }

.pw-actions { margin-top: 14px; padding-left: 8px; }
.btn-pw { display: inline-flex; align-items: center; padding: 9px 20px; border-radius: 9px; border: none; background: #6366f1; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: background .15s; }
.btn-pw:hover:not(:disabled) { background: #4f46e5; }
.btn-pw:disabled { opacity: .6; cursor: not-allowed; }
.pw-error   { margin-top: 10px; padding-left: 8px; font-size: 12.5px; color: #dc2626; }
.pw-success { margin-top: 10px; padding-left: 8px; font-size: 12.5px; color: #16a34a; font-weight: 500; }

/* ── Lightbox ── */
.lightbox {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.88);
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(6px);
}
.lb-img {
  max-width: min(90vw, 480px);
  max-height: 85vh;
  border-radius: 14px;
  object-fit: contain;
  box-shadow: 0 32px 80px rgba(0,0,0,0.5);
  animation: lb-pop .22s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes lb-pop {
  from { transform: scale(.88); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}
.lb-close {
  position: absolute; top: 18px; right: 18px;
  width: 38px; height: 38px; border-radius: 50%;
  background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
  color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.lb-close:hover { background: rgba(255,255,255,0.22); }
.lb-enter-active, .lb-leave-active { transition: opacity .2s ease; }
.lb-enter-from,  .lb-leave-to      { opacity: 0; }

.avatar-img.clickable { cursor: zoom-in; }

/* ════════════════════════════════
   Tablet  ≥ 640px
════════════════════════════════ */
@media (min-width: 640px) {
  .temp-banner { flex-direction: row; align-items: center; padding: 12px 24px; }
  .banner-btn  { align-self: auto; }

  .page-header { flex-direction: row; align-items: center; justify-content: space-between; padding: 20px 24px 14px; }
  .page-title  { font-size: 21px; }

  .profile-content { padding: 0 24px 24px; }

  .hero-inner  { flex-direction: row; align-items: center; text-align: left; padding: 26px 26px 22px; }
  .hero-top    { flex-direction: row; align-items: center; justify-content: flex-start; }
  .hero-pills  { justify-content: flex-start; }
  .hero-meta   { flex-direction: row; flex-wrap: wrap; align-items: center; gap: 6px 18px; }

  .hero-stats   { border-top: none; border-left: 1px solid #f1f5f9; padding-top: 0; padding-left: 20px; width: auto; flex-shrink: 0; margin-left: auto; }
  .stat-item    { flex: none; padding: 0 16px; }

  .avatar-img      { width: 88px; height: 88px; }
  .avatar-initials { width: 88px; height: 88px; }

  .cards-grid  { grid-template-columns: 1fr 1fr; gap: 16px; }
  .field-grid  { grid-template-columns: 1fr 1fr; gap: 16px; }

  .info-card   { padding: 22px 24px; }
}

/* ════════════════════════════════
   Desktop  ≥ 1024px
════════════════════════════════ */
@media (min-width: 1024px) {
  .page-header { padding: 22px 28px 16px; }
  .page-title  { font-size: 22px; }
  .profile-content { padding: 0 28px 28px; gap: 16px; }

  .hero-inner  { gap: 24px; padding: 28px 28px 24px; }
  .hero-name   { font-size: 20px; }
  .avatar-img      { width: 96px; height: 96px; }
  .avatar-initials { width: 96px; height: 96px; font-size: 32px; }

  .stat-val    { font-size: 14px; }
  .stat-item   { padding: 0 20px; }
}
</style>
