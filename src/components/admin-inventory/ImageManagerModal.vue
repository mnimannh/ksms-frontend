<template>
  <div class="inv-modal-backdrop" @click.self="$emit('close')">
    <div class="inv-modal">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">Images</h2>
          <p class="modal-sub">{{ variantName }}</p>
        </div>
        <button class="modal-close" @click="$emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="modal-body">

        <!-- Main Preview -->
        <div class="preview-area">
          <div class="preview-img" v-if="previewImage">
            <img :src="fullUrl(previewImage.image_url)" :alt="variantName" />
          </div>
          <div class="preview-empty" v-else>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <span>No image</span>
          </div>
        </div>

        <!-- Thumbnails -->
        <div class="thumb-row-wrap">
          <p class="thumb-count">{{ images.length }}/5 IMAGES</p>
          <p class="thumb-hint">Click to preview · ★ to set main · drag to reorder</p>
        </div>
        <div class="thumb-row">
          <div
            v-for="(img, i) in images"
            :key="img.id || i"
            class="thumb"
            :class="{
              selected: selectedIdx === i,
              main: img.is_main,
              dragging: dragIdx === i,
              'drag-over': dragOverIdx === i && dragIdx !== i,
            }"
            draggable="true"
            @click="selectThumb(i)"
            @dragstart="onDragStart(i, $event)"
            @dragover.prevent="onDragOver(i)"
            @dragleave="onDragLeave"
            @drop.prevent="onDrop(i)"
            @dragend="onDragEnd"
          >
            <img :src="fullUrl(img.image_url)" :alt="`Image ${i+1}`" />
            <span class="thumb-num">{{ i + 1 }}</span>
            <button class="thumb-star" @click.stop="setMain(i)" :class="{ active: img.is_main }">★</button>
            <div class="drag-handle" title="Drag to reorder">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="9" cy="19" r="2"/><circle cx="15" cy="19" r="2"/></svg>
            </div>
          </div>

          <!-- Upload button -->
          <div class="thumb thumb-add" v-if="images.length < 5 && !uploading" @click="triggerUpload">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>Add Photo</span>
          </div>
          <div class="thumb thumb-add uploading" v-if="uploading">
            <div class="upload-spinner" />
            <span>Uploading...</span>
          </div>

          <input ref="fileInput" type="file" accept="image/*" class="hidden-input" @change="onFileAdd" />
        </div>

        <!-- Upload error -->
        <p class="upload-error" v-if="uploadError">{{ uploadError }}</p>

        <!-- URL Input -->
        <div class="field">
          <label class="field-label">Or Add by URL</label>
          <div class="url-row">
            <input v-model="urlInput" class="field-input" placeholder="https://example.com/image.jpg" />
            <button class="btn-add-url" @click="addByUrl">Add</button>
          </div>
        </div>

        <!-- Image Order -->
        <div class="order-section" v-if="images.length > 1">
          <p class="field-label">Image Order <span class="field-label-hint">— drag thumbnails above to reorder</span></p>
          <div class="order-list">
            <div
              class="order-row"
              v-for="(img, i) in images"
              :key="img.id || i"
              :class="{ 'order-row-selected': selectedIdx === i }"
              @click="selectThumb(i)"
            >
              <div class="order-thumb">
                <img :src="fullUrl(img.image_url)" />
              </div>
              <span class="order-label">{{ `Image ${i + 1}` }}{{ img.is_main ? ' - Main' : '' }}</span>
              <span class="order-pos">#{{ i + 1 }}</span>
            </div>
          </div>
        </div>

        <!-- Remove selected -->
        <div class="remove-wrap" v-if="images.length > 0">
          <button class="btn-remove" @click="removeSelected" :disabled="selectedIdx === null">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            Remove Selected
          </button>
        </div>

      </div>

      <div class="modal-footer">
        <button class="btn-ghost" @click="$emit('close')">Close</button>
        <button class="btn-primary" @click="save" :disabled="uploading">Save Images</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import API_BASE_URL from '@/services/api'

export default {
  name: 'ImageManagerModal',
  emits: ['close', 'save'],
  props: {
    productName: { type: String, default: '' },
    variantName: { type: String, default: '' },
    initial:     { type: Array,  default: () => [] },
  },
  data() {
    return {
      images:      this.initial.map(i => ({ ...i })),
      selectedIdx: this.initial.length > 0 ? 0 : null,
      urlInput:    '',
      uploading:   false,
      uploadError: null,
      dragIdx:     null,
      dragOverIdx: null,
    }
  },
  computed: {
    previewImage() {
      if (this.selectedIdx !== null && this.images[this.selectedIdx]) {
        return this.images[this.selectedIdx]
      }
      return this.images.find(i => i.is_main) || this.images[0] || null
    },
  },
  methods: {
    // Prepend API base for local /uploads/ paths
    fullUrl(url) {
      if (!url) return ''
      if (url.startsWith('http')) return url
      return `${API_BASE_URL}${url}`
    },

    selectThumb(i) { this.selectedIdx = i },

    setMain(i) {
      this.images = this.images.map((img, idx) => ({ ...img, is_main: idx === i ? 1 : 0 }))
    },

    // ── Upload ──
    triggerUpload() { this.$refs.fileInput.click() },
    async onFileAdd(e) {
      const file = e.target.files[0]
      if (!file || this.images.length >= 5) return

      this.uploading   = true
      this.uploadError = null

      try {
        const formData = new FormData()
        formData.append('image', file)
        const params = new URLSearchParams({ product: this.productName, variant: this.variantName })
        const { data } = await axios.post(`${API_BASE_URL}/api/upload/product-image?${params}`, formData)

        const isFirst = this.images.length === 0
        this.images.push({
          image_url:   data.url,
          is_main:     isFirst ? 1 : 0,
          image_order: this.images.length + 1,
        })
        this.selectedIdx = this.images.length - 1
      } catch (err) {
        this.uploadError = 'Upload failed. Please try again.'
        console.error(err)
      } finally {
        this.uploading = false
        e.target.value = ''
      }
    },

    addByUrl() {
      if (!this.urlInput.trim() || this.images.length >= 5) return
      const isFirst = this.images.length === 0
      this.images.push({
        image_url:   this.urlInput.trim(),
        is_main:     isFirst ? 1 : 0,
        image_order: this.images.length + 1,
      })
      this.selectedIdx = this.images.length - 1
      this.urlInput = ''
    },

    // ── Drag ──
    onDragStart(i, e) {
      this.dragIdx = i
      e.dataTransfer.effectAllowed = 'move'
      const ghost = e.target.cloneNode(true)
      ghost.style.position = 'absolute'
      ghost.style.top = '-999px'
      document.body.appendChild(ghost)
      e.dataTransfer.setDragImage(ghost, 36, 36)
      setTimeout(() => document.body.removeChild(ghost), 0)
    },
    onDragOver(i)  { if (this.dragIdx === null || this.dragIdx === i) return; this.dragOverIdx = i },
    onDragLeave()  { this.dragOverIdx = null },
    onDrop(i) {
      if (this.dragIdx === null || this.dragIdx === i) return
      const arr = [...this.images]
      const [moved] = arr.splice(this.dragIdx, 1)
      arr.splice(i, 0, moved)
      this.images      = arr
      this.selectedIdx = i
      this.dragIdx     = null
      this.dragOverIdx = null
    },
    onDragEnd() { this.dragIdx = null; this.dragOverIdx = null },

    // ── Remove ──
    removeSelected() {
      if (this.selectedIdx === null) return
      this.images.splice(this.selectedIdx, 1)
      if (this.images.length === 0) { this.selectedIdx = null; return }
      if (!this.images.some(i => i.is_main)) this.images[0].is_main = 1
      this.selectedIdx = Math.min(this.selectedIdx, this.images.length - 1)
    },

    // ── Save ──
    save() {
      const ordered = this.images.map((img, i) => ({ ...img, image_order: i + 1 }))
      this.$emit('save', ordered)
    },
  },
}
</script>

<style scoped>
.modal-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 20px 24px 16px; border-bottom: 1px solid #f1f5f9;
  position: sticky; top: 0; background: #fff; z-index: 1;
}
.modal-title { font-size: 16px; font-weight: 700; color: #0f172a; }
.modal-sub   { font-size: 12.5px; color: #94a3b8; margin-top: 2px; }
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

/* Preview */
.preview-area {
  width: 100%; height: 200px; border-radius: 10px;
  background: #f8fafc; border: 1px solid #f1f5f9;
  overflow: hidden; display: flex; align-items: center; justify-content: center;
}
.preview-img { width: 100%; height: 100%; }
.preview-img img { width: 100%; height: 100%; object-fit: contain; }
.preview-empty {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  color: #cbd5e1; font-size: 13px;
}

/* Thumbnails */
.thumb-row-wrap { display: flex; justify-content: space-between; align-items: center; }
.thumb-count { font-size: 11.5px; font-weight: 700; color: #64748b; }
.thumb-hint  { font-size: 11px; color: #94a3b8; }

.thumb-row { display: flex; gap: 8px; flex-wrap: wrap; }
.thumb {
  width: 72px; height: 72px; border-radius: 9px;
  border: 2px solid #f1f5f9; overflow: hidden;
  position: relative; cursor: pointer; flex-shrink: 0;
  transition: border-color .15s, opacity .15s, transform .15s;
  user-select: none;
}
.thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.thumb.selected  { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.18); }
.thumb.main      { border-color: #f59e0b; }
.thumb.selected.main { border-color: #6366f1; }
.thumb.dragging  { opacity: .35; transform: scale(0.95); }
.thumb.drag-over { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.3); transform: scale(1.06); }

.thumb-num {
  position: absolute; bottom: 3px; left: 4px;
  font-size: 9px; font-weight: 700; color: #fff;
  background: rgba(0,0,0,.45); border-radius: 3px; padding: 1px 4px;
  pointer-events: none;
}

/* ★ Star Button - Larger & More Prominent */
.thumb-star {
  position: absolute; top: 4px; right: 4px;
  font-size: 18px; background: rgba(0,0,0,.35); border: none; cursor: pointer;
  color: rgba(255,255,255,.8); transition: all .15s ease; line-height: 1; z-index: 2;
  width: 32px; height: 32px; border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  padding: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,.15);
}
.thumb-star.active { 
  color: #fbbf24; 
  background: rgba(245, 158, 11, .4);
  box-shadow: 0 0 0 2px rgba(245, 158, 11, .6), 0 2px 8px rgba(0,0,0,.2);
  font-size: 20px;
  transform: scale(1.1);
}
.thumb-star:hover  { 
  color: #fbbf24;
  background: rgba(245, 158, 11, .35);
  box-shadow: 0 0 0 2px rgba(245, 158, 11, .5), 0 2px 10px rgba(0,0,0,.2);
  transform: scale(1.05);
}

.drag-handle {
  position: absolute; bottom: 3px; right: 4px;
  color: rgba(255,255,255,.55); pointer-events: none; line-height: 1;
}
.thumb-add {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 4px; background: #f8fafc; border: 2px dashed #e2e8f0;
  color: #94a3b8; font-size: 10px; cursor: pointer;
}
.thumb-add:hover { border-color: #6366f1; color: #6366f1; background: #eef2ff; }
.thumb-add.uploading { cursor: default; border-color: #e2e8f0; color: #94a3b8; }
.hidden-input { display: none; }

/* Upload spinner */
.upload-spinner {
  width: 18px; height: 18px; border-radius: 50%;
  border: 2px solid #e2e8f0; border-top-color: #6366f1;
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.upload-error {
  font-size: 12px; color: #ef4444;
  background: #fef2f2; border: 1px solid #fca5a5;
  border-radius: 7px; padding: 8px 12px;
}

/* URL */
.url-row { display: flex; gap: 8px; }
.btn-add-url {
  padding: 9px 14px; border: none; border-radius: 8px;
  background: #6366f1; color: #fff;
  font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 600;
  cursor: pointer; white-space: nowrap;
}
.btn-add-url:hover { background: #4f46e5; }

/* Order list */
.order-section { display: flex; flex-direction: column; gap: 8px; }
.field-label-hint { font-size: 10.5px; color: #94a3b8; font-weight: 400; text-transform: none; letter-spacing: 0; }
.order-list    { display: flex; flex-direction: column; gap: 6px; }
.order-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; background: #f8fafc; border-radius: 8px;
  border: 1px solid #f1f5f9; cursor: pointer;
  transition: border-color .15s, background .15s;
}
.order-row:hover { background: #f1f5f9; }
.order-row-selected { border-color: #6366f1 !important; background: #eef2ff !important; }
.order-thumb { width: 32px; height: 32px; border-radius: 6px; overflow: hidden; flex-shrink: 0; }
.order-thumb img { width: 100%; height: 100%; object-fit: cover; }
.order-label { flex: 1; font-size: 13px; color: #334155; font-weight: 500; }
.order-pos { font-size: 12px; font-weight: 700; color: #94a3b8; font-family: 'DM Mono', monospace; }

/* Remove */
.remove-wrap { display: flex; }
.btn-remove {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 13px; border: 1px solid #fca5a5; border-radius: 8px;
  background: #fef2f2; color: #dc2626;
  font-size: 12.5px; font-family: 'DM Sans', sans-serif; font-weight: 600;
  cursor: pointer; transition: all .15s;
}
.btn-remove:hover:not(:disabled) { background: #fee2e2; }
.btn-remove:disabled { opacity: .4; cursor: not-allowed; }

.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: .05em; }
.field-input {
  padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px;
  font-size: 14px; font-family: 'DM Sans', sans-serif; color: #1e293b;
  outline: none; transition: border-color .15s; flex: 1;
}
.field-input:focus { border-color: #6366f1; }
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
  cursor: pointer;
}
.btn-primary:hover:not(:disabled) { background: #4f46e5; }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; }
</style>