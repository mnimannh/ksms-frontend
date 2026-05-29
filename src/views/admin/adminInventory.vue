<template>
  <div class="app-layout">
    <AdminSidebar />

    <main class="inv-main">
      <!-- ── Page Header ── -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Inventory</h1>
          <p class="page-sub">Manage categories, products, variants, and images</p>
        </div>
        <div class="header-stats">
          <div class="stat-chip">
            <span class="sc-val">{{ allCategories.length }}</span>
            <span class="sc-lbl">Categories</span>
          </div>
          <div class="stat-chip">
            <span class="sc-val">{{ allInventory.length }}</span>
            <span class="sc-lbl">Products</span>
          </div>
          <div class="stat-chip">
            <span class="sc-val">{{ allVariants.length }}</span>
            <span class="sc-lbl">Variants</span>
          </div>
        </div>
      </div>

      <!-- ── Panels ── -->
      <div class="panels-layout">
        <CategoryPanel
          :categories="allCategories"
          :selected-id="selectedCategoryId"
          :inventory-counts="inventoryCounts"
          @select="selectCategory"
          @add="openCategoryModal('add')"
          @edit="openCategoryModal('edit', $event)"
          @delete="confirmDelete('category', $event)"
        />

        <div class="panel-transition" :class="{ visible: selectedCategoryId }">
          <div class="panel-arrow no-panel" v-if="!selectedCategoryId">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <p>Select a category</p>
          </div>
          <InventoryPanel
            v-if="selectedCategoryId"
            :items="filteredInventory"
            :selected-id="selectedInventoryId"
            :category-name="selectedCategory?.name || ''"
            :cat-color="catColorFor(selectedCategoryId)"
            :variant-counts="variantCounts"
            @select="selectInventory"
            @add="openInventoryModal('add')"
            @edit="openInventoryModal('edit', $event)"
            @delete="confirmDelete('inventory', $event)"
          />
        </div>

        <div class="panel-transition wide-panel" :class="{ visible: selectedInventoryId }">
          <div class="panel-arrow no-panel" v-if="!selectedInventoryId">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <p>Select a product</p>
          </div>
          <VariantTable
            v-if="selectedInventoryId"
            :variants="filteredVariants"
            :inventory-name="selectedInventory?.inventoryName || ''"
            :image-counts="imageCounts"
            @add="openVariantModal('add')"
            @edit="openVariantModal('edit', $event)"
            @delete="confirmDelete('variant', $event)"
            @viewBarcode="goToBarcodes($event)"
            @manageImages="openImageModal($event)"
          />
        </div>
      </div>
    </main>

    <!-- ── Modals ── -->
    <Teleport to="body">
      <CategoryModal
        v-if="showCategoryModal"
        :mode="modalMode"
        :initial="modalTarget"
        @close="showCategoryModal = false"
        @save="saveCategory"
      />
      <InventoryModal
        v-if="showInventoryModal"
        :mode="modalMode"
        :initial="modalTarget"
        :categories="allCategories"
        :default-category-id="selectedCategoryId"
        @close="showInventoryModal = false"
        @save="saveInventory"
      />
      <VariantModal
        v-if="showVariantModal"
        :mode="modalMode"
        :initial="modalTarget"
        :inventory-id="selectedInventoryId"
        @close="showVariantModal = false"
        @save="saveVariant"
      />
      <ImageManagerModal
        v-if="showImageModal"
        :product-name="selectedInventory?.inventoryName || ''"
        :variant-name="imageModalVariant?.variant_name || ''"
        :initial="imagesFor(imageModalVariant?.id)"
        @close="showImageModal = false"
        @save="saveImages"
      />
    </Teleport>

    <!-- ── Delete Confirm ── -->
    <div class="delete-modal-backdrop" v-if="showDeleteConfirm" @click.self="showDeleteConfirm = false">
      <div class="delete-confirm-modal">
        <div class="confirm-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h3 class="confirm-title">Delete {{ deleteTarget?.type }}?</h3>
        <p class="confirm-sub">
          <strong>{{ deleteTarget?.name }}</strong> will be permanently deleted.
          <span v-if="deleteTarget?.type === 'category'">All products and variants under it will also be removed.</span>
          <span v-if="deleteTarget?.type === 'inventory'">All variants under it will also be removed.</span>
        </p>
        <div class="confirm-btns">
          <button class="btn-ghost" @click="showDeleteConfirm = false">Cancel</button>
          <button class="btn-danger" @click="executeDelete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import API_BASE_URL from "@/services/api";

import AdminSidebar       from '@/components/sidebar/adminSidebar.vue'
import CategoryPanel      from '@/components/admin-inventory/CategoryPanel.vue'
import InventoryPanel     from '@/components/admin-inventory/InventoryPanel.vue'
import VariantTable       from '@/components/admin-inventory/VariantTable.vue'
import CategoryModal      from '@/components/admin-inventory/CategoryModal.vue'
import InventoryModal     from '@/components/admin-inventory/InventoryModal.vue'
import VariantModal       from '@/components/admin-inventory/VariantModal.vue'
import ImageManagerModal  from '@/components/admin-inventory/ImageManagerModal.vue'

const PALETTE = ['#6366f1','#10b981','#f59e0b','#ef4444','#06b6d4','#8b5cf6','#ec4899','#14b8a6']

export default {
  name: 'AdminInventory',
  components: { AdminSidebar, CategoryPanel, InventoryPanel, VariantTable, CategoryModal, InventoryModal, VariantModal, ImageManagerModal },

  data() {
    return {
      allCategories: [],
      allInventory:  [],
      allVariants:   [],
      allImages:     [],

      selectedCategoryId:  null,
      selectedInventoryId: null,

      showCategoryModal:  false,
      showInventoryModal: false,
      showVariantModal:   false,
      showImageModal:     false,
      showDeleteConfirm:  false,
      modalMode:         'add',
      modalTarget:        null,
      deleteTarget:       null,
      imageModalVariant:  null,
    }
  },

  computed: {
    selectedCategory()  { return this.allCategories.find(c => c.id === this.selectedCategoryId)  || null },
    selectedInventory() { return this.allInventory.find(i  => i.id === this.selectedInventoryId) || null },

    filteredInventory() { return this.allInventory.filter(i => i.category_id  === this.selectedCategoryId)  },
    filteredVariants()  { return this.allVariants.filter(v  => v.inventory_id === this.selectedInventoryId) },

    inventoryCounts() {
      const map = {}
      this.allInventory.forEach(i => { map[i.category_id] = (map[i.category_id] || 0) + 1 })
      return map
    },
    variantCounts() {
      const map = {}
      this.allVariants.forEach(v => { map[v.inventory_id] = (map[v.inventory_id] || 0) + 1 })
      return map
    },
    imageCounts() {
      const map = {}
      this.allImages.forEach(img => { map[img.variant_id] = (map[img.variant_id] || 0) + 1 })
      return map
    },
  },

  methods: {
    catColorFor(id) { return PALETTE[(id - 1) % PALETTE.length] },

    selectCategory(cat)  { this.selectedCategoryId = cat.id; this.selectedInventoryId = null },
    selectInventory(inv) { this.selectedInventoryId = inv.id },

    // ── Fetches ──
    async fetchCategories() { const { data } = await axios.get(`${API_BASE_URL}/api/categories`);     this.allCategories = data },
    async fetchInventory()  { const { data } = await axios.get(`${API_BASE_URL}/api/inventory`);      this.allInventory  = data },
    async fetchVariants()   { const { data } = await axios.get(`${API_BASE_URL}/api/variants`);       this.allVariants   = data },
    async fetchImages()     { const { data } = await axios.get(`${API_BASE_URL}/api/product-images`); this.allImages     = data },

    // ── Category ──
    openCategoryModal(mode, cat = null) { this.modalMode = mode; this.modalTarget = cat; this.showCategoryModal = true },
    async saveCategory(data) {
      try {
        if (this.modalMode === 'add') {
          const { data: res } = await axios.post(`${API_BASE_URL}/api/categories`, data)
          this.allCategories.push({ id: res.id, ...data, created_at: new Date().toISOString() })
        } else {
          await axios.put(`${API_BASE_URL}/api/categories/${this.modalTarget.id}`, data)
          const idx = this.allCategories.findIndex(c => c.id === this.modalTarget.id)
          if (idx !== -1) this.allCategories[idx] = { ...this.allCategories[idx], ...data }
        }
        this.showCategoryModal = false
      } catch (err) { console.error(err) }
    },

    // ── Inventory ──
    openInventoryModal(mode, inv = null) { this.modalMode = mode; this.modalTarget = inv; this.showInventoryModal = true },
    async saveInventory(data) {
      try {
        if (this.modalMode === 'add') {
          const { data: res } = await axios.post(`${API_BASE_URL}/api/inventory`, data)
          this.allInventory.push({ id: res.id, ...data, lastUpdated: new Date().toISOString() })
        } else {
          await axios.put(`${API_BASE_URL}/api/inventory/${this.modalTarget.id}`, data)
          const idx = this.allInventory.findIndex(i => i.id === this.modalTarget.id)
          if (idx !== -1) this.allInventory[idx] = { ...this.allInventory[idx], ...data }
        }
        this.showInventoryModal = false
      } catch (err) { console.error(err) }
    },

    // ── Variant ──
    openVariantModal(mode, v = null) { this.modalMode = mode; this.modalTarget = v; this.showVariantModal = true },
    async saveVariant(data) {
      try {
        if (this.modalMode === 'add') {
          const { data: res } = await axios.post(`${API_BASE_URL}/api/variants`, data)
          this.allVariants.push({ id: res.id, ...data, lastUpdated: new Date().toISOString() })
        } else {
          await axios.put(`${API_BASE_URL}/api/variants/${this.modalTarget.id}`, data)
          const idx = this.allVariants.findIndex(v => v.id === this.modalTarget.id)
          if (idx !== -1) this.allVariants[idx] = { ...this.allVariants[idx], ...data }
        }
        this.showVariantModal = false
      } catch (err) { console.error(err) }
    },

    // ── Images ──
    openImageModal(variant) { this.imageModalVariant = variant; this.showImageModal = true },
    imagesFor(variantId) { if (!variantId) return []; return this.allImages.filter(i => i.variant_id === variantId) },
    async saveImages(images) {
      if (!this.imageModalVariant) return
      const vid = this.imageModalVariant.id

      // Skip blob:// URLs — file upload requires a separate upload endpoint
      const validImages = images.filter(img => img.image_url && !img.image_url.startsWith('blob:'))

      // Wipe all existing images for this variant then re-insert in order
      await axios.delete(`${API_BASE_URL}/api/product-images/variant/${vid}`)
      for (const img of validImages) {
        await axios.post(`${API_BASE_URL}/api/product-images`, {
          variant_id:  vid,
          image_url:   img.image_url,
          is_main:     img.is_main     ?? 0,
          image_order: img.image_order ?? 1,
        })
      }

      await this.fetchImages()
      this.showImageModal = false
    },

    // ── Delete ──
    confirmDelete(type, item) {
      this.deleteTarget = {
        type,
        id:   item.id,
        name: item.name || item.inventoryName || item.variant_name,
        item,
      }
      this.showDeleteConfirm = true
    },
    async executeDelete() {
      const { type, id } = this.deleteTarget
      try {
        if      (type === 'category')  await axios.delete(`${API_BASE_URL}/api/categories/${id}`)
        else if (type === 'inventory') await axios.delete(`${API_BASE_URL}/api/inventory/${id}`)
        else if (type === 'variant')   await axios.delete(`${API_BASE_URL}/api/variants/${id}`)
        await Promise.all([this.fetchCategories(), this.fetchInventory(), this.fetchVariants()])
        this.showDeleteConfirm = false
      } catch (err) { console.error(err) }
    },

    // ── Barcode ──
    goToBarcodes(variant) {
      sessionStorage.setItem('barcodeVariant', JSON.stringify(variant))
      this.$router.push({
        name: 'BarcodeSheet',
        query: {
          variantId:          variant.id,
          inventoryName:      this.selectedInventory?.inventoryName || '',
          _returnCategoryId:  this.selectedCategoryId,
          _returnInventoryId: this.selectedInventoryId,
        },
      })
    },
  },

  async created() {
    await Promise.all([this.fetchCategories(), this.fetchInventory(), this.fetchVariants(), this.fetchImages()])

    // Restore panel state when returning from BarcodeSheet
    const q = this.$route?.query || {}
    if (q._returnCategoryId)  this.selectedCategoryId  = Number(q._returnCategoryId)
    if (q._returnInventoryId) this.selectedInventoryId = Number(q._returnInventoryId)
  },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
</style>

<style>
.modal-backdrop {
  position: fixed; inset: 0; z-index: 10000;
  background: rgba(15, 23, 42, 0.45);
  display: flex; align-items: center; justify-content: center;
  padding: 20px; backdrop-filter: blur(2px);
}
.modal {
  position: relative; z-index: 10001;
  background: #fff; border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
  width: 100%; max-width: 500px;
  animation: popIn 0.2s ease-out;
}
@keyframes popIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);    }
}
</style>

<style>
.inv-modal-backdrop {
  position: fixed; inset: 0; z-index: 10000;
  background: rgba(15, 23, 42, 0.45);
  display: flex; align-items: center; justify-content: center;
  padding: 20px; backdrop-filter: blur(2px);
}
.inv-modal {
  position: relative; z-index: 10001;
  background: #fff; border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
  width: 100%; max-width: 500px;
  animation: modalPopIn 0.25s ease-out;
}
@keyframes modalPopIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to   { opacity: 1; transform: scale(1)    translateY(0);    }
}
</style>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.app-layout {
  display: flex; min-height: 100vh;
  background: #f6f7fb;
  font-family: 'DM Sans', sans-serif; color: #1e293b;
}

/* ── Base (mobile) ── */
.inv-main {
  flex: 1; padding: 16px 14px 36px;
  display: flex; flex-direction: column; gap: 14px;
  overflow: hidden;
}

.page-header {
  display: flex; flex-direction: column; gap: 12px;
}
.page-title { font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -.025em; }
.page-sub   { font-size: 13px; color: #94a3b8; margin-top: 2px; }

.header-stats { display: flex; gap: 8px; }
.stat-chip {
  display: flex; flex-direction: column; align-items: center;
  padding: 8px 14px; background: #fff;
  border: 1px solid #f1f5f9; border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,.03); min-width: 64px;
}
.sc-val { font-size: 16px; font-weight: 700; color: #0f172a; font-family: 'DM Mono', monospace; }
.sc-lbl { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; }

/* Single-column panels on mobile */
.panels-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px; flex: 1; min-height: 0;
  height: auto;
}
.panel-transition {
  opacity: 0; pointer-events: none;
  transition: opacity .2s ease;
}
.panel-transition.visible { opacity: 1; pointer-events: all; }

.no-panel {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 10px; min-height: 120px;
  background: #fff; border-radius: 14px;
  border: 2px dashed #e2e8f0;
  color: #cbd5e1; font-size: 13px; text-align: center;
}
.no-panel svg { color: #dde1e9; }

/* ── Delete Confirm Modal ── */
.delete-modal-backdrop {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(15,23,42,.45);
  display: flex; align-items: flex-end; justify-content: center;
  padding: 0;
}
.delete-confirm-modal {
  background: #fff; border-radius: 16px 16px 0 0;
  width: 100%; max-width: 100%;
  padding: 24px 20px 32px;
  box-shadow: 0 -8px 40px rgba(0,0,0,.18);
  display: flex; flex-direction: column; align-items: center;
  text-align: center; gap: 10px;
  animation: slideUp .2s ease;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
.confirm-icon {
  width: 48px; height: 48px; border-radius: 12px;
  background: #fef2f2; color: #ef4444;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 4px;
}
.confirm-title { font-size: 16px; font-weight: 700; color: #0f172a; }
.confirm-sub   { font-size: 13px; color: #64748b; line-height: 1.55; }
.confirm-btns  { display: flex; gap: 8px; margin-top: 8px; width: 100%; }
.btn-ghost {
  flex: 1; padding: 10px 18px; border: 1px solid #e2e8f0; border-radius: 8px;
  background: #fff; font-size: 13px; font-family: 'DM Sans', sans-serif;
  font-weight: 500; color: #64748b; cursor: pointer;
}
.btn-ghost:hover { background: #f8fafc; }
.btn-danger {
  flex: 1; padding: 10px 18px; border: none; border-radius: 8px;
  background: #ef4444; color: #fff;
  font-size: 13px; font-family: 'DM Sans', sans-serif;
  font-weight: 600; cursor: pointer; transition: background .15s;
}
.btn-danger:hover { background: #dc2626; }

/* ── Tablet (≥720px) ── */
@media (min-width: 720px) {
  .inv-main { padding: 20px 20px 40px; gap: 16px; }
  .page-header { flex-direction: row; align-items: center; justify-content: space-between; }
  .page-title { font-size: 24px; }
  .panels-layout { grid-template-columns: 220px 1fr; height: auto; }
  .wide-panel { grid-column: 1 / -1; }
  .stat-chip { padding: 8px 18px; min-width: 72px; }
  .sc-val { font-size: 18px; }
  .sc-lbl { font-size: 11px; }
  .delete-modal-backdrop { align-items: center; padding: 20px; }
  .delete-confirm-modal {
    border-radius: 14px; max-width: 380px;
    padding: 28px 28px 24px;
    animation: popIn .18s ease;
  }
  @keyframes popIn {
    from { opacity: 0; transform: scale(0.95) translateY(10px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .confirm-btns { width: auto; }
  .btn-ghost, .btn-danger { flex: none; }
}

/* ── Desktop (≥1100px) ── */
@media (min-width: 1100px) {
  .inv-main { padding: 28px 30px 48px; gap: 20px; }
  .panels-layout {
    grid-template-columns: 240px 1fr 1.6fr;
    height: calc(100vh - 180px);
  }
  .panel-transition { height: 100%; }
  .wide-panel { grid-column: auto; }
  .no-panel { height: 100%; min-height: unset; }
}
</style>