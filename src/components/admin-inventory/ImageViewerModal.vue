<template>
  <div class="modal-overlay" @mousedown.self="$emit('close')">
    <div class="modal-box img-modal">
      <div class="modal-header">
        <div>
          <span class="modal-title">Images</span>
          <span class="variant-label">{{ variant.variant_name }}</span>
        </div>
        <button class="modal-close" @click="$emit('close')">✕</button>
      </div>

      <div class="img-modal-body">
        <!-- Main Preview -->
        <div class="main-preview-wrap">
          <div class="main-preview" v-if="activeImage">
            <img :src="activeImage.image_url" :alt="variant.variant_name" class="main-img" />
            <div class="img-overlay-badges">
              <span v-if="activeImage.is_main" class="img-badge main">★ Main</span>
              <span class="img-badge order">#{{ activeImage.image_order }}</span>
            </div>
            <div class="img-overlay-actions">
              <button
                class="overlay-btn"
                :class="{ active: activeImage.is_main }"
                @click="setMain(activeImage)"
                title="Set as main image"
              >★ Set Main</button>
              <button class="overlay-btn danger" @click="removeImage(activeImage)" title="Remove image">✕ Remove</button>
            </div>
          </div>
          <div class="main-preview empty" v-else>
            <span class="preview-empty-icon">🖼</span>
            <span>No images yet</span>
          </div>
        </div>

        <!-- Thumbnails -->
        <div class="thumbs-section">
          <div class="thumbs-label">
            <span>{{ localImages.length }}/5 images</span>
            <span class="thumbs-hint">Click to preview · ★ to set main</span>
          </div>
          <div class="thumbs-grid">
            <div
              v-for="(img, i) in localImages"
              :key="img.id"
              class="thumb-card"
              :class="{ active: activeImage && activeImage.id === img.id, 'is-main': img.is_main }"
              @click="activeImage = img"
            >
              <img :src="img.image_url" :alt="`Image ${i+1}`" class="thumb-img" />
              <span v-if="img.is_main" class="thumb-main-star">★</span>
              <div class="thumb-order">{{ img.image_order }}</div>
            </div>

            <!-- Upload slot -->
            <div
              v-if="localImages.length < 5"
              class="thumb-card upload-slot"
              @click="triggerUpload"
              @dragover.prevent="dragOver = true"
              @dragleave="dragOver = false"
              @drop.prevent="onDrop"
              :class="{ 'drag-over': dragOver }"
            >
              <span class="upload-icon">+</span>
              <span class="upload-text">Add Photo</span>
              <input ref="fileInput" type="file" accept="image/*" multiple class="hidden-input" @change="onFileChange" />
            </div>
          </div>
        </div>

        <!-- Upload via URL -->
        <div class="url-upload-section">
          <div class="url-upload-label">Or add by URL</div>
          <div class="url-upload-row">
            <input
              v-model="imageUrl"
              class="form-input"
              placeholder="https://example.com/image.jpg"
              @keydown.enter="addByUrl"
            />
            <button class="btn-ghost" @click="addByUrl" :disabled="!imageUrl.trim() || localImages.length >= 5">Add</button>
          </div>
          <span v-if="urlError" class="form-error">{{ urlError }}</span>
        </div>

        <!-- Reorder hint -->
        <div v-if="localImages.length > 1" class="reorder-section">
          <span class="reorder-label">Image Order</span>
          <div class="reorder-list">
            <div
              v-for="(img, i) in localImages"
              :key="img.id"
              class="reorder-item"
            >
              <span class="reorder-num">{{ i + 1 }}</span>
              <img :src="img.image_url" class="reorder-thumb" />
              <span class="reorder-name">{{ img.is_main ? '★ Main' : `Image ${i+1}` }}</span>
              <div class="reorder-btns">
                <button :disabled="i === 0" class="reorder-btn" @click="moveUp(i)">↑</button>
                <button :disabled="i === localImages.length - 1" class="reorder-btn" @click="moveDown(i)">↓</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-ghost" @click="$emit('close')">Close</button>
        <button class="btn-primary" @click="saveImages">Save Images</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageViewerModal',
  props: {
    variant: Object,
  },
  emits: ['close', 'update-images'],
  data() {
    return {
      localImages: [],
      activeImage: null,
      imageUrl: '',
      urlError: '',
      dragOver: false,
      nextId: 100,
    }
  },
  created() {
    this.localImages = this.variant.images ? this.variant.images.map((img, i) => ({
      ...img,
      image_order: i + 1,
    })) : []
    this.activeImage = this.localImages[0] || null
  },
  methods: {
    setMain(img) {
      this.localImages.forEach(i => { i.is_main = 0 })
      img.is_main = 1
      // Bring to front
      const idx = this.localImages.indexOf(img)
      if (idx > 0) {
        this.localImages.splice(idx, 1)
        this.localImages.unshift(img)
        this.recalcOrder()
      }
      this.activeImage = img
    },
    removeImage(img) {
      const idx = this.localImages.indexOf(img)
      this.localImages.splice(idx, 1)
      this.recalcOrder()
      if (this.localImages.length > 0) {
        this.activeImage = this.localImages[Math.min(idx, this.localImages.length - 1)]
      } else {
        this.activeImage = null
      }
      // Ensure a main is set
      if (this.localImages.length > 0 && !this.localImages.some(i => i.is_main)) {
        this.localImages[0].is_main = 1
      }
    },
    addByUrl() {
      this.urlError = ''
      const url = this.imageUrl.trim()
      if (!url) return
      if (this.localImages.length >= 5) { this.urlError = 'Maximum 5 images allowed.'; return }
      if (!url.startsWith('http')) { this.urlError = 'Please enter a valid URL.'; return }
      const newImg = {
        id: this.nextId++,
        image_url: url,
        is_main: this.localImages.length === 0 ? 1 : 0,
        image_order: this.localImages.length + 1,
      }
      this.localImages.push(newImg)
      this.activeImage = newImg
      this.imageUrl = ''
    },
    triggerUpload() {
      this.$refs.fileInput.click()
    },
    onFileChange(e) {
      const files = Array.from(e.target.files)
      this.processFiles(files)
      e.target.value = ''
    },
    onDrop(e) {
      this.dragOver = false
      const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
      this.processFiles(files)
    },
    processFiles(files) {
      const available = 5 - this.localImages.length
      const toProcess = files.slice(0, available)
      toProcess.forEach(file => {
        const reader = new FileReader()
        reader.onload = (ev) => {
          const newImg = {
            id: this.nextId++,
            image_url: ev.target.result,
            is_main: this.localImages.length === 0 ? 1 : 0,
            image_order: this.localImages.length + 1,
          }
          this.localImages.push(newImg)
          if (!this.activeImage) this.activeImage = newImg
        }
        reader.readAsDataURL(file)
      })
    },
    moveUp(i) {
      if (i === 0) return
      const a = this.localImages[i - 1]
      this.localImages.splice(i - 1, 1, this.localImages[i])
      this.localImages.splice(i, 1, a)
      this.recalcOrder()
    },
    moveDown(i) {
      if (i >= this.localImages.length - 1) return
      const a = this.localImages[i + 1]
      this.localImages.splice(i + 1, 1, this.localImages[i])
      this.localImages.splice(i, 1, a)
      this.recalcOrder()
    },
    recalcOrder() {
      this.localImages.forEach((img, i) => { img.image_order = i + 1 })
    },
    saveImages() {
      this.$emit('update-images', { variantId: this.variant.id, images: [...this.localImages] })
      this.$emit('close')
    },
  }
}
</script>

<style scoped>
.img-modal { max-width: 680px; }
.variant-label {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 400;
}
.img-modal-body {
  padding: 0 24px 4px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
/* Main Preview */
.main-preview-wrap { }
.main-preview {
  position: relative;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--bg);
  border: 1px solid var(--border);
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.main-preview.empty {
  flex-direction: column;
  gap: 8px;
  color: var(--text-muted);
  font-size: 14px;
}
.preview-empty-icon { font-size: 36px; opacity: 0.3; }
.main-img { width: 100%; height: 100%; object-fit: contain; }
.img-overlay-badges {
  position: absolute; top: 10px; left: 10px;
  display: flex; gap: 6px;
}
.img-badge {
  font-size: 11px; font-weight: 600;
  padding: 3px 8px; border-radius: 20px;
}
.img-badge.main { background: var(--text-primary); color: #fff; }
.img-badge.order { background: rgba(0,0,0,0.4); color: #fff; backdrop-filter: blur(4px); }
.img-overlay-actions {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.5));
  padding: 24px 12px 12px;
  display: flex; gap: 8px; justify-content: flex-end;
  opacity: 0;
  transition: opacity 0.15s;
}
.main-preview:hover .img-overlay-actions { opacity: 1; }
.overlay-btn {
  padding: 5px 12px;
  border-radius: 6px;
  border: none;
  font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
  cursor: pointer;
  background: rgba(255,255,255,0.9);
  color: var(--text-primary);
  transition: all 0.15s;
}
.overlay-btn.active { background: var(--text-primary); color: #fff; }
.overlay-btn.danger { background: rgba(220,38,38,0.9); color: #fff; }

/* Thumbnails */
.thumbs-label {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 8px;
  font-size: 12px; color: var(--text-muted); font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.3px;
}
.thumbs-hint { font-size: 11px; font-weight: 400; text-transform: none; letter-spacing: 0; }
.thumbs-grid {
  display: flex; gap: 10px; flex-wrap: wrap;
}
.thumb-card {
  width: 72px; height: 72px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--border);
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: all 0.15s;
  background: var(--bg);
  flex-shrink: 0;
}
.thumb-card:hover { border-color: var(--accent); }
.thumb-card.active { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent); }
.thumb-card.is-main { border-color: #D97706; }
.thumb-img { width: 100%; height: 100%; object-fit: cover; }
.thumb-main-star {
  position: absolute; top: 3px; right: 3px;
  font-size: 10px; color: #D97706;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}
.thumb-order {
  position: absolute; bottom: 2px; left: 4px;
  font-size: 9px; color: #fff; font-weight: 700;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}
/* Upload slot */
.upload-slot {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 2px;
  border: 2px dashed var(--border);
  cursor: pointer;
}
.upload-slot:hover, .upload-slot.drag-over {
  border-color: var(--accent);
  background: var(--bg);
}
.upload-icon { font-size: 20px; color: var(--text-muted); line-height: 1; }
.upload-text { font-size: 10px; color: var(--text-muted); text-align: center; }
.hidden-input { display: none; }

/* URL upload */
.url-upload-section { }
.url-upload-label { font-size: 12px; color: var(--text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 8px; }
.url-upload-row { display: flex; gap: 8px; }
.url-upload-row .form-input { flex: 1; }
.form-error { color: var(--red); font-size: 12px; margin-top: 4px; display: block; }

/* Reorder */
.reorder-section { }
.reorder-label { font-size: 12px; color: var(--text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 8px; display: block; }
.reorder-list { display: flex; flex-direction: column; gap: 6px; }
.reorder-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg);
}
.reorder-num { font-size: 11px; color: var(--text-muted); width: 16px; text-align: center; font-weight: 600; }
.reorder-thumb { width: 32px; height: 32px; border-radius: 4px; object-fit: cover; }
.reorder-name { flex: 1; font-size: 13px; color: var(--text-secondary); }
.reorder-btns { display: flex; gap: 4px; }
.reorder-btn {
  width: 26px; height: 26px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--border); border-radius: 4px;
  background: #fff; cursor: pointer;
  font-size: 12px; color: var(--text-secondary);
  transition: all 0.1s;
}
.reorder-btn:hover:not(:disabled) { background: var(--text-primary); color: #fff; border-color: var(--text-primary); }
.reorder-btn:disabled { opacity: 0.3; cursor: not-allowed; }
</style>