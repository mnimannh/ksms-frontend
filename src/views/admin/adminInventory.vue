<template>
  <div class="app-layout">
    <AdminSidebar />

    <main class="inv-main">

      <!-- ── Page Header ── -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Inventory</h1>
          <p class="page-sub">Manage categories, products and variants</p>
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

      <!-- ── Three-Panel Layout ── -->
      <div class="panels-layout">

        <!-- Panel 1: Categories -->
        <CategoryPanel
          :categories="allCategories"
          :selected-id="selectedCategoryId"
          :inventory-counts="inventoryCounts"
          @select="selectCategory"
          @add="openCategoryModal('add')"
          @edit="openCategoryModal('edit', $event)"
          @delete="confirmDelete('category', $event)"
        />

        <!-- Panel 2: Inventory (shown when category selected) -->
        <div class="panel-transition" :class="{ visible: selectedCategoryId }">
          <div class="panel-arrow no-panel" v-if="!selectedCategoryId">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="9 18 15 12 9 6"/></svg>
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

        <!-- Panel 3: Variants (shown when inventory selected) -->
        <div class="panel-transition wide-panel" :class="{ visible: selectedInventoryId }">
          <div class="panel-arrow no-panel" v-if="!selectedInventoryId">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="9 18 15 12 9 6"/></svg>
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
      :variant-name="imageModalVariant?.variant_name || ''"
      :initial="imagesFor(imageModalVariant?.id)"
      @close="showImageModal = false"
      @save="saveImages"
    /></Teleport>

    <!-- ── Delete Confirm ── -->
    <div class="delete-modal-backdrop" v-if="showDeleteConfirm" @click.self="showDeleteConfirm = false">
      <div class="delete-confirm-modal">
        <div class="confirm-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
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
import AdminSidebar       from '@/components/sidebar/AdminSidebar.vue'
import CategoryPanel      from '@/components/admin-inventory/CategoryPanel.vue'
import InventoryPanel     from '@/components/admin-inventory/InventoryPanel.vue'
import VariantTable       from '@/components/admin-inventory/VariantTable.vue'
import CategoryModal      from '@/components/admin-inventory/CategoryModal.vue'
import InventoryModal     from '@/components/admin-inventory/InventoryModal.vue'
import VariantModal       from '@/components/admin-inventory/VariantModal.vue'
import ImageManagerModal  from '@/components/admin-inventory/ImageManagerModal.vue'

const PALETTE = ['#6366f1','#10b981','#f59e0b','#ef4444','#06b6d4','#8b5cf6','#ec4899','#14b8a6']

// ── Hardcoded seed data (replace with API calls) ──────────────────────────────
let _catId  = 5
let _invId  = 8
let _varId  = 10
let _imgId  = 20

const SEED_CATEGORIES = [
  { id:1, name:'Beverages',  created_at:'2024-01-01' },
  { id:2, name:'Dry Goods',  created_at:'2024-01-01' },
  { id:3, name:'Condiments', created_at:'2024-01-01' },
  { id:4, name:'Cleaning',   created_at:'2024-01-01' },
  { id:5, name:'Frozen',     created_at:'2024-01-01' },
]

const SEED_INVENTORY = [
  { id:1, inventoryName:'Air Milo Tin',      category_id:1, description:'Chocolate malt drink',   default_threshold:10 },
  { id:2, inventoryName:'Nescafe 3in1',      category_id:1, description:'Instant coffee sachets',  default_threshold:10 },
  { id:3, inventoryName:'Mineral Water',     category_id:1, description:'Drinking water bottles',  default_threshold:20 },
  { id:4, inventoryName:'Basmati Rice',      category_id:2, description:'Long grain basmati rice', default_threshold:5  },
  { id:5, inventoryName:'Sugar',             category_id:2, description:'White refined sugar',     default_threshold:8  },
  { id:6, inventoryName:'Cooking Oil',       category_id:3, description:'Palm cooking oil',        default_threshold:6  },
  { id:7, inventoryName:'Latex Gloves',      category_id:4, description:'Disposable latex gloves', default_threshold:20 },
  { id:8, inventoryName:'Frozen Chicken',    category_id:5, description:'Whole frozen chicken',    default_threshold:10 },
]

const SEED_VARIANTS = [
  { id:1,  inventory_id:1, variant_name:'500ml',   barcode:'6009001001001', price:3.50,  quantity:120, threshold:10 },
  { id:2,  inventory_id:1, variant_name:'1000ml',  barcode:'6009001001002', price:6.20,  quantity:45,  threshold:10 },
  { id:3,  inventory_id:2, variant_name:'10 Sachets', barcode:'6009002001001', price:5.50, quantity:80, threshold:10 },
  { id:4,  inventory_id:2, variant_name:'20 Sachets', barcode:'6009002001002', price:10.90,quantity:30, threshold:10 },
  { id:5,  inventory_id:3, variant_name:'500ml',   barcode:'6009003001001', price:0.90,  quantity:200, threshold:20 },
  { id:6,  inventory_id:3, variant_name:'1.5L',    barcode:'6009003001002', price:2.10,  quantity:150, threshold:20 },
  { id:7,  inventory_id:4, variant_name:'5kg',     barcode:'6009004001001', price:18.00, quantity:48,  threshold:5  },
  { id:8,  inventory_id:4, variant_name:'10kg',    barcode:'6009004001002', price:32.00, quantity:22,  threshold:5  },
  { id:9,  inventory_id:5, variant_name:'1kg',     barcode:'6009005001001', price:3.20,  quantity:6,   threshold:8  },
  { id:10, inventory_id:6, variant_name:'5L',      barcode:'6009006001001', price:38.00, quantity:0,   threshold:6  },
]

const SEED_IMAGES = [
  { id:1, variant_id:1, image_url:'https://placehold.co/300x300/eef2ff/6366f1?text=Milo+500ml',  is_main:1, image_order:1 },
  { id:2, variant_id:1, image_url:'https://placehold.co/300x300/1e293b/fff?text=Milo+500ml+Side',is_main:0, image_order:2 },
  { id:3, variant_id:2, image_url:'https://placehold.co/300x300/eef2ff/6366f1?text=Milo+1000ml', is_main:1, image_order:1 },
  { id:4, variant_id:5, image_url:'https://placehold.co/300x300/f0fdf4/10b981?text=Water+500ml', is_main:1, image_order:1 },
]

export default {
  name: 'AdminInventory',
  components: { AdminSidebar, CategoryPanel, InventoryPanel, VariantTable, CategoryModal, InventoryModal, VariantModal, ImageManagerModal },

  data() {
    return {
      allCategories: [...SEED_CATEGORIES],
      allInventory:  [...SEED_INVENTORY],
      allVariants:   [...SEED_VARIANTS],
      allImages:     [...SEED_IMAGES],

      selectedCategoryId:  null,
      selectedInventoryId: null,

      // Modal state
      showCategoryModal:  false,
      showInventoryModal: false,
      showVariantModal:   false,
      showImageModal:     false,
      showDeleteConfirm:  false,
      modalMode:   'add',
      modalTarget: null,

      deleteTarget:      null,
      imageModalVariant: null,
    }
  },

  computed: {
    selectedCategory() {
      return this.allCategories.find(c => c.id === this.selectedCategoryId) || null
    },
    selectedInventory() {
      return this.allInventory.find(i => i.id === this.selectedInventoryId) || null
    },

    filteredInventory() {
      return this.allInventory.filter(i => i.category_id === this.selectedCategoryId)
    },
    filteredVariants() {
      return this.allVariants.filter(v => v.inventory_id === this.selectedInventoryId)
    },

    // Counts for panel badges
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

    selectCategory(cat) {
      this.selectedCategoryId  = cat.id
      this.selectedInventoryId = null
    },
    selectInventory(inv) {
      this.selectedInventoryId = inv.id
    },

    // ── Category CRUD ──
    openCategoryModal(mode, cat = null) {
      this.modalMode   = mode
      this.modalTarget = cat
      this.showCategoryModal = true
    },
    saveCategory(data) {
      if (this.modalMode === 'add') {
        this.allCategories.push({ id: ++_catId, ...data, created_at: new Date().toISOString() })
      } else {
        const idx = this.allCategories.findIndex(c => c.id === this.modalTarget.id)
        if (idx !== -1) this.allCategories[idx] = { ...this.allCategories[idx], ...data }
      }
      this.showCategoryModal = false
    },

    // ── Inventory CRUD ──
    openInventoryModal(mode, inv = null) {
      this.modalMode   = mode
      this.modalTarget = inv
      this.showInventoryModal = true
    },
    saveInventory(data) {
      if (this.modalMode === 'add') {
        this.allInventory.push({ id: ++_invId, ...data, lastUpdated: new Date().toISOString() })
      } else {
        const idx = this.allInventory.findIndex(i => i.id === this.modalTarget.id)
        if (idx !== -1) this.allInventory[idx] = { ...this.allInventory[idx], ...data }
      }
      this.showInventoryModal = false
    },

    // ── Variant CRUD ──
    openVariantModal(mode, v = null) {
      this.modalMode   = mode
      this.modalTarget = v
      this.showVariantModal = true
    },
    saveVariant(data) {
      if (this.modalMode === 'add') {
        this.allVariants.push({ id: ++_varId, ...data, lastUpdated: new Date().toISOString() })
      } else {
        const idx = this.allVariants.findIndex(v => v.id === this.modalTarget.id)
        if (idx !== -1) this.allVariants[idx] = { ...this.allVariants[idx], ...data }
      }
      this.showVariantModal = false
    },

    // ── Images ──
    openImageModal(variant) {
      this.imageModalVariant = variant
      this.showImageModal = true
    },
    imagesFor(variantId) {
      if (!variantId) return []
      return this.allImages.filter(i => i.variant_id === variantId)
    },
    saveImages(images) {
      if (!this.imageModalVariant) return
      const vid = this.imageModalVariant.id
      this.allImages = this.allImages.filter(i => i.variant_id !== vid)
      images.forEach(img => {
        this.allImages.push({ id: ++_imgId, variant_id: vid, ...img })
      })
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
    executeDelete() {
      const { type, id } = this.deleteTarget
      if (type === 'category') {
        const invIds = this.allInventory.filter(i => i.category_id === id).map(i => i.id)
        this.allVariants = this.allVariants.filter(v => !invIds.includes(v.inventory_id))
        this.allInventory = this.allInventory.filter(i => i.category_id !== id)
        this.allCategories = this.allCategories.filter(c => c.id !== id)
        if (this.selectedCategoryId === id) { this.selectedCategoryId = null; this.selectedInventoryId = null }
      } else if (type === 'inventory') {
        this.allVariants  = this.allVariants.filter(v => v.inventory_id !== id)
        this.allInventory = this.allInventory.filter(i => i.id !== id)
        if (this.selectedInventoryId === id) this.selectedInventoryId = null
      } else if (type === 'variant') {
        this.allImages   = this.allImages.filter(i => i.variant_id !== id)
        this.allVariants = this.allVariants.filter(v => v.id !== id)
      }
      this.showDeleteConfirm = false
    },

    // ── Barcode Sheet ──
    goToBarcodes(variant) {
      // Pass only the single clicked variant — not all variants
      this.$router.push({
        name: 'BarcodeSheet',
        query: { inventoryName: this.selectedInventory?.inventoryName },
        state: { variant },
      })
    },
  },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
</style>
<style>
/* Move these here (Unscoped) */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000; 
  background: rgba(15, 23, 42, 0.45);
  display: flex; 
  align-items: center; 
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(2px); /* Optional: adds a nice modern touch */
}

.modal {
  position: relative;
  z-index: 10001;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 500px;
  animation: popIn 0.2s ease-out;
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>

<style>
/* Use unique names to avoid Bootstrap 5 conflicts */
.inv-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 10000; 
  background: rgba(15, 23, 42, 0.45); /* Semi-transparent navy */
  display: flex; 
  align-items: center; 
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(2px);
}

.inv-modal {
  position: relative;
  z-index: 10001;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 500px;
  animation: modalPopIn 0.25s ease-out; /* Match the keyframe name below */
}

@keyframes modalPopIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.app-layout {
  display: flex;
  min-height: 100vh;
  background: #f6f7fb;
  font-family: 'DM Sans', sans-serif;
  color: #1e293b;
}

.inv-main {
  flex: 1;
  padding: 28px 30px 48px;
  display: flex; flex-direction: column; gap: 20px;
  overflow: hidden;
}

/* ── Page Header ── */
.page-header {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 14px;
}
.page-title { font-size: 24px; font-weight: 700; color: #0f172a; letter-spacing: -.025em; }
.page-sub   { font-size: 13px; color: #94a3b8; margin-top: 2px; }

.header-stats { display: flex; gap: 10px; }
.stat-chip {
  display: flex; flex-direction: column; align-items: center;
  padding: 8px 18px; background: #fff;
  border: 1px solid #f1f5f9; border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,.03);
  min-width: 72px;
}
.sc-val { font-size: 18px; font-weight: 700; color: #0f172a; font-family: 'DM Mono', monospace; }
.sc-lbl { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; }

/* ── Three-Panel Layout ── */
.panels-layout {
  display: grid;
  grid-template-columns: 240px 1fr 1.6fr;
  gap: 14px;
  flex: 1;
  min-height: 0;
  height: calc(100vh - 180px);
}

.panel-transition {
  opacity: 0; pointer-events: none;
  transition: opacity .2s ease;
  height: 100%;
}
.panel-transition.visible { opacity: 1; pointer-events: all; }

.wide-panel { }

/* Empty placeholder inside panel slot */
.no-panel {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 10px; height: 100%;
  background: #fff; border-radius: 14px;
  border: 2px dashed #e2e8f0;
  color: #cbd5e1; font-size: 13px; text-align: center;
}
.no-panel svg { color: #dde1e9; }



/* ── Delete confirm modal ── */
.delete-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15,23,42,.45);
  display: flex;
  align-items: center;
  justify-content: center;
}
.delete-confirm-modal {
  background: #fff; border-radius: 14px;
  width: 100%; max-width: 380px;
  padding: 28px 28px 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,.18);
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px;
  animation: popIn .18s ease;
}

.confirm-icon {
  width: 48px; height: 48px; border-radius: 12px;
  background: #fef2f2; color: #ef4444;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 4px;
}
.confirm-title { font-size: 16px; font-weight: 700; color: #0f172a; }
.confirm-sub   { font-size: 13.5px; color: #64748b; line-height: 1.55; }
.confirm-btns  { display: flex; gap: 8px; margin-top: 8px; }
.btn-ghost {
  padding: 8px 18px; border: 1px solid #e2e8f0; border-radius: 8px;
  background: #fff; font-size: 13px; font-family: 'DM Sans', sans-serif;
  font-weight: 500; color: #64748b; cursor: pointer;
}
.btn-ghost:hover { background: #f8fafc; }
.btn-danger {
  padding: 8px 18px; border: none; border-radius: 8px;
  background: #ef4444; color: #fff;
  font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 600;
  cursor: pointer; transition: background .15s;
}
.btn-danger:hover { background: #dc2626; }

/* ── Responsive ── */
@media (max-width: 1100px) {
  .panels-layout { grid-template-columns: 220px 1fr; height: auto; }
  .wide-panel    { grid-column: 1 / -1; }
}
@media (max-width: 720px) {
  .panels-layout { grid-template-columns: 1fr; height: auto; }
  .inv-main      { padding: 16px 14px 36px; }
}
</style>