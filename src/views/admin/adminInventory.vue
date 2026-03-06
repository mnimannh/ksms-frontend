<template>
  <div class="admin-root">
    <AdminSidebar />

    <!-- Main Content -->
    <main class="main-content">
      <!-- Header -->
      <header class="top-bar">
        <div class="top-bar-left">
          <h1 class="page-title">{{ currentTab.label }}</h1>
          <span class="page-subtitle">{{ currentTab.subtitle }}</span>
        </div>
        <div class="top-bar-right">
          <div class="search-wrap">
            <span class="search-icon">⌕</span>
            <input v-model="searchQuery" class="search-input" :placeholder="`Search ${currentTab.label}...`" />
          </div>
          <button class="btn-primary" @click="handleAdd">
            <span>+</span> Add {{ currentTab.singular }}
          </button>
        </div>
      </header>

      <!-- Tab Nav -->
      <div class="tab-nav">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key; searchQuery = ''"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          {{ tab.label }}
          <span class="tab-count">
            {{ tab.key === 'categories' ? categories.length : tab.key === 'inventory' ? inventory.length : allVariants.length }}
          </span>
        </button>

        <div class="tab-spacer"></div>

      </div>

      <!-- Panels -->
      <CategoriesPanel
        v-if="activeTab === 'categories'"
        :categories="filteredCategories"
        :inventory="inventory"
        @edit="openEditCategory"
        @delete="deleteCategory"
        @add="openAddCategory"
      />

      <InventoryPanel
        v-else-if="activeTab === 'inventory'"
        :inventory="filteredInventory"
        :categories="categories"
        :variants="variants"
        @edit="openEditInventory"
        @delete="deleteInventory"
        @view-variants="openVariants"
        @add="openAddInventory"
      />

      <VariantsPanel
        v-else-if="activeTab === 'variants'"
        :variants="filteredVariants"
        :inventory="inventory"
        @edit="openEditVariant"
        @delete="deleteVariant"
        @view-images="openImageViewer"
        @add="openAddVariant"
      />
    </main>

    <!-- MODALS -->
    <CategoryModal
      v-if="modals.category"
      :editing="editingItem"
      @save="saveCategory"
      @close="modals.category = false"
    />

    <InventoryModal
      v-if="modals.inventory"
      :editing="editingItem"
      :categories="categories"
      @save="saveInventory"
      @close="modals.inventory = false"
    />

    <VariantModal
      v-if="modals.variant"
      :editing="editingItem"
      :inventory="inventory"
      @save="saveVariant"
      @close="modals.variant = false"
    />

    <ImageViewerModal
      v-if="modals.images"
      :variant="selectedVariant"
      @close="modals.images = false"
      @update-images="updateVariantImages"
    />

    <!-- Toast -->
    <transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <span class="toast-icon">{{ toast.type === 'success' ? '✓' : '✕' }}</span>
        {{ toast.message }}
      </div>
    </transition>

    <!-- Delete Confirm -->
    <ConfirmDialog
      v-if="confirmDialog.show"
      :message="confirmDialog.message"
      @confirm="confirmDialog.action(); confirmDialog.show = false"
      @cancel="confirmDialog.show = false"
    />
  </div>
</template>

<script>
import AdminSidebar from '@/components/sidebar/AdminSidebar.vue'
import CategoriesPanel from '@/components/admin-inventory/CategoriesPanel.vue'
import InventoryPanel from '@/components/admin-inventory/InventoryPanel.vue'
import VariantsPanel from '@/components/admin-inventory/VariantsPanel.vue'
import CategoryModal from '@/components/admin-inventory/CategoryModal.vue'
import InventoryModal from '@/components/admin-inventory/InventoryModal.vue'
import VariantModal from '@/components/admin-inventory/VariantModal.vue'
import ImageViewerModal from '@/components/admin-inventory/ImageViewerModal.vue'
import ConfirmDialog from '@/components/admin-inventory/ConfirmDialog.vue'

export default {
  name: 'AdminInventory',
  components: {
    AdminSidebar,
    CategoriesPanel, InventoryPanel, VariantsPanel,
    CategoryModal, InventoryModal, VariantModal,
    ImageViewerModal, ConfirmDialog,
  },
  data() {
    return {
      activeTab: 'categories',
      searchQuery: '',
      editingItem: null,
      selectedVariant: null,
      modals: { category: false, inventory: false, variant: false, images: false },
      toast: { show: false, message: '', type: 'success' },
      confirmDialog: { show: false, message: '', action: null },

      tabs: [
        { key: 'categories', label: 'Categories', singular: 'Category', icon: '⊞', subtitle: 'Manage product categories' },
        { key: 'inventory',  label: 'Inventory',  singular: 'Product',  icon: '◫', subtitle: 'Manage products & stock'  },
        { key: 'variants',   label: 'Variants',   singular: 'Variant',  icon: '◈', subtitle: 'Manage SKUs & pricing'    },
      ],

      // --- HARDCODED DATA ---
      categories: [
        { id: 1, name: 'Beverages',    created_at: '2024-01-10' },
        { id: 2, name: 'Snacks',       created_at: '2024-01-12' },
        { id: 3, name: 'Dairy',        created_at: '2024-01-15' },
        { id: 4, name: 'Frozen Foods', created_at: '2024-02-01' },
      ],
      inventory: [
        { id: 1, inventoryName: 'Air Milo Tin',          category_id: 1, description: 'Classic chocolate malt drink in tin', default_threshold: 10, lastUpdated: '2024-06-01' },
        { id: 2, inventoryName: 'Teh Tarik',             category_id: 1, description: 'Malaysian pulled milk tea',           default_threshold: 15, lastUpdated: '2024-06-03' },
        { id: 3, inventoryName: 'Keropok Lekor',         category_id: 2, description: 'Malaysian fish cracker sticks',      default_threshold: 20, lastUpdated: '2024-06-05' },
        { id: 4, inventoryName: 'Dutch Lady Fresh Milk', category_id: 3, description: 'Full cream fresh milk',              default_threshold:  8, lastUpdated: '2024-06-07' },
        { id: 5, inventoryName: 'Nestle Ice Cream',      category_id: 4, description: 'Vanilla ice cream tub',              default_threshold:  5, lastUpdated: '2024-06-08' },
      ],
      variants: [
        { id: 1, inventory_id: 1, variant_name: 'Air Milo Tin 500ml',          quantity: 120, price:  3.50, barcode: 'MLO-500-TIN',  threshold: 10, lastUpdated: '2024-06-01', images: [
          { id: 1, image_url: 'https://placehold.co/400x400/1a1a2e/ffffff?text=Milo+500ml',      is_main: 1, image_order: 1 },
          { id: 2, image_url: 'https://placehold.co/400x400/16213e/ffffff?text=Milo+500ml+Side', is_main: 0, image_order: 2 },
        ]},
        { id: 2, inventory_id: 1, variant_name: 'Air Milo Tin 1000ml',         quantity:  45, price:  6.20, barcode: 'MLO-1000-TIN', threshold: 10, lastUpdated: '2024-06-01', images: [
          { id: 3, image_url: 'https://placehold.co/400x400/0f3460/ffffff?text=Milo+1000ml', is_main: 1, image_order: 1 },
        ]},
        { id: 3, inventory_id: 2, variant_name: 'Teh Tarik 250ml',             quantity: 200, price:  1.80, barcode: 'TTK-250',      threshold: 20, lastUpdated: '2024-06-03', images: [] },
        { id: 4, inventory_id: 2, variant_name: 'Teh Tarik 500ml',             quantity:   8, price:  3.00, barcode: 'TTK-500',      threshold: 15, lastUpdated: '2024-06-03', images: [] },
        { id: 5, inventory_id: 3, variant_name: 'Keropok Lekor Original 100g', quantity:   0, price:  2.50, barcode: 'KPK-100-ORI', threshold: 20, lastUpdated: '2024-06-05', images: [] },
        { id: 6, inventory_id: 3, variant_name: 'Keropok Lekor Spicy 100g',    quantity:  55, price:  2.80, barcode: 'KPK-100-SPY', threshold: 20, lastUpdated: '2024-06-05', images: [] },
        { id: 7, inventory_id: 4, variant_name: 'Dutch Lady 1L',               quantity:  30, price:  7.90, barcode: 'DL-FRESH-1L', threshold:  8, lastUpdated: '2024-06-07', images: [] },
        { id: 8, inventory_id: 5, variant_name: 'Nestle Vanilla 750ml',        quantity:   3, price: 12.50, barcode: 'NST-VAN-750', threshold:  5, lastUpdated: '2024-06-08', images: [] },
      ],
    }
  },
  computed: {
    currentTab()     { return this.tabs.find(t => t.key === this.activeTab) },
    allVariants()    { return this.variants },
    lowStockCount()  { return this.variants.filter(v => v.quantity > 0 && v.quantity <= v.threshold).length },
    outOfStockCount(){ return this.variants.filter(v => v.quantity === 0).length },
    filteredCategories() {
      if (!this.searchQuery) return this.categories
      return this.categories.filter(c => c.name.toLowerCase().includes(this.searchQuery.toLowerCase()))
    },
    filteredInventory() {
      if (!this.searchQuery) return this.inventory
      return this.inventory.filter(i => i.inventoryName.toLowerCase().includes(this.searchQuery.toLowerCase()))
    },
    filteredVariants() {
      if (!this.searchQuery) return this.variants
      return this.variants.filter(v =>
        v.variant_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        v.barcode.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    },
  },
  methods: {
    handleAdd() {
      this.editingItem = null
      if      (this.activeTab === 'categories') this.modals.category  = true
      else if (this.activeTab === 'inventory')  this.modals.inventory = true
      else                                      this.modals.variant   = true
    },

    openEditCategory(cat)   { this.editingItem = { ...cat };  this.modals.category  = true },
    openEditInventory(item) { this.editingItem = { ...item }; this.modals.inventory = true },
    openEditVariant(v)      { this.editingItem = { ...v };    this.modals.variant   = true },
    openAddCategory()       { this.editingItem = null; this.modals.category  = true },
    openAddInventory()      { this.editingItem = null; this.modals.inventory = true },
    openAddVariant()        { this.editingItem = null; this.modals.variant   = true },

    openVariants(item)        { this.activeTab = 'variants'; this.searchQuery = item.inventoryName },
    openImageViewer(variant)  { this.selectedVariant = variant; this.modals.images = true },

    saveCategory(data) {
      if (data.id) {
        const i = this.categories.findIndex(c => c.id === data.id)
        this.categories.splice(i, 1, data)
        this.showToast('Category updated successfully')
      } else {
        this.categories.push({ ...data, id: Date.now(), created_at: new Date().toISOString().split('T')[0] })
        this.showToast('Category created successfully')
      }
      this.modals.category = false
    },
    deleteCategory(id) {
      this.confirmDelete('Delete this category? All linked products will be removed.', () => {
        this.categories = this.categories.filter(c => c.id !== id)
        this.inventory  = this.inventory.filter(i => i.category_id !== id)
        this.showToast('Category deleted')
      })
    },

    saveInventory(data) {
      if (data.id) {
        const i = this.inventory.findIndex(p => p.id === data.id)
        this.inventory.splice(i, 1, data)
        this.showToast('Product updated successfully')
      } else {
        this.inventory.push({ ...data, id: Date.now(), lastUpdated: new Date().toISOString().split('T')[0] })
        this.showToast('Product created successfully')
      }
      this.modals.inventory = false
    },
    deleteInventory(id) {
      this.confirmDelete('Delete this product? All variants will be removed.', () => {
        this.inventory = this.inventory.filter(p => p.id !== id)
        this.variants  = this.variants.filter(v => v.inventory_id !== id)
        this.showToast('Product deleted')
      })
    },

    saveVariant(data) {
      if (data.id) {
        const i = this.variants.findIndex(v => v.id === data.id)
        this.variants.splice(i, 1, { ...this.variants[i], ...data })
        this.showToast('Variant updated successfully')
      } else {
        this.variants.push({ ...data, id: Date.now(), lastUpdated: new Date().toISOString().split('T')[0], images: [] })
        this.showToast('Variant created successfully')
      }
      this.modals.variant = false
    },
    deleteVariant(id) {
      this.confirmDelete('Delete this variant permanently?', () => {
        this.variants = this.variants.filter(v => v.id !== id)
        this.showToast('Variant deleted')
      })
    },

    updateVariantImages({ variantId, images }) {
      const v = this.variants.find(v => v.id === variantId)
      if (v) v.images = images
    },

    confirmDelete(message, action) {
      this.confirmDialog = { show: true, message, action }
    },
    showToast(message, type = 'success') {
      this.toast = { show: true, message, type }
      setTimeout(() => { this.toast.show = false }, 3000)
    },
  },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:            #f1f5f9;
  --surface:       #FFFFFF;
  --border:        #E8E5DF;
  --border-strong: #D0CBC3;
  --text-primary:  #1C1917;
  --text-secondary:#78716C;
  --text-muted:    #A8A29E;
  --accent:        #1C1917;
  --accent-hover:  #44403C;
  --green:         #16A34A;
  --green-bg:      #DCFCE7;
  --amber:         #D97706;
  --amber-bg:      #FEF3C7;
  --red:           #DC2626;
  --red-bg:        #FEE2E2;
  --radius:        12px;
  --radius-sm:     8px;
  --shadow:        0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md:     0 4px 16px rgba(0,0,0,0.08);
  --shadow-lg:     0 12px 40px rgba(0,0,0,0.12);
}

body { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text-primary); }

.admin-root {
  display: flex;
  min-height: 100vh;
  background: var(--bg);
}

/* MAIN — offset by AdminSidebar width via CSS var; override --sidebar-width in AdminSidebar if needed */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0 36px 36px;
  margin-left: var(--sidebar-width);
}

/* TOP BAR */
.top-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 32px 0 20px; gap: 16px;
}
.top-bar-left { display: flex; align-items: baseline; gap: 12px; }
.page-title {
  font-family: 'Syne', sans-serif;
  font-size: 24px; font-weight: 700; letter-spacing: -0.5px;
  color: var(--text-primary);
}
.page-subtitle { font-size: 13px; color: var(--text-muted); }
.top-bar-right { display: flex; align-items: center; gap: 12px; }

/* TAB NAV */
.tab-nav {
  display: flex; align-items: center; gap: 4px;
  border-bottom: 2px solid var(--border);
  margin-bottom: 24px;
}
.tab-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 16px;
  border: none; background: transparent;
  font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 400;
  color: var(--text-muted); cursor: pointer;
  border-bottom: 2px solid transparent; margin-bottom: -2px;
  transition: all 0.15s; white-space: nowrap;
}
.tab-btn:hover { color: var(--text-primary); }
.tab-btn.active { color: var(--text-primary); font-weight: 500; border-bottom-color: var(--text-primary); }
.tab-icon { font-size: 15px; opacity: 0.7; }
.tab-count {
  font-size: 11px; font-weight: 600;
  background: var(--bg); border: 1px solid var(--border);
  color: var(--text-muted); padding: 1px 7px; border-radius: 20px;
}
.tab-btn.active .tab-count { background: var(--text-primary); border-color: var(--text-primary); color: #fff; }
.tab-spacer { flex: 1; }
.stock-pills { display: flex; gap: 8px; align-items: center; padding-bottom: 2px; }
.stock-pill {
  display: flex; align-items: center; gap: 5px;
  font-size: 12px; font-weight: 500;
  padding: 4px 10px; border-radius: 20px;
  border: 1px solid var(--border); background: var(--surface);
  color: var(--text-secondary);
}
.pill-dot { width: 6px; height: 6px; border-radius: 50%; }
.pill-dot.amber { background: var(--amber); }
.pill-dot.red   { background: var(--red);   }

/* SEARCH */
.search-wrap { position: relative; display: flex; align-items: center; }
.search-icon {
  position: absolute; left: 12px;
  font-size: 18px; color: var(--text-muted);
  pointer-events: none; line-height: 1;
}
.search-input {
  padding: 9px 14px 9px 36px;
  border: 1px solid var(--border); border-radius: var(--radius-sm);
  background: var(--surface);
  font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--text-primary);
  width: 220px; outline: none; transition: border-color 0.15s;
}
.search-input:focus { border-color: var(--accent); }
.search-input::placeholder { color: var(--text-muted); }

/* BUTTONS */
.btn-primary {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 18px; background: var(--accent); color: #fff;
  border: none; border-radius: var(--radius-sm);
  font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
  cursor: pointer; transition: background 0.15s; white-space: nowrap;
}
.btn-primary:hover { background: var(--accent-hover); }

.btn-ghost {
  padding: 6px 12px; background: transparent; color: var(--text-secondary);
  border: 1px solid var(--border); border-radius: var(--radius-sm);
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 400;
  cursor: pointer; transition: all 0.15s;
}
.btn-ghost:hover { background: var(--bg); border-color: var(--border-strong); color: var(--text-primary); }

.btn-icon {
  width: 32px; height: 32px;
  display: flex; align-items: center; justify-content: center;
  background: transparent; border: 1px solid var(--border); border-radius: var(--radius-sm);
  cursor: pointer; font-size: 14px; color: var(--text-secondary); transition: all 0.15s;
}
.btn-icon:hover { background: var(--bg); border-color: var(--border-strong); color: var(--text-primary); }
.btn-icon.danger:hover { background: var(--red-bg); border-color: var(--red); color: var(--red); }

/* CARDS */
.card {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 20px; transition: box-shadow 0.15s, border-color 0.15s;
}
.card:hover { box-shadow: var(--shadow-md); border-color: var(--border-strong); }

/* BADGES */
.badge {
  display: inline-flex; align-items: center;
  padding: 3px 9px; border-radius: 20px;
  font-size: 11px; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.3px;
}
.badge-green   { background: var(--green-bg); color: var(--green); }
.badge-amber   { background: var(--amber-bg); color: var(--amber); }
.badge-red     { background: var(--red-bg);   color: var(--red);   }
.badge-neutral { background: var(--bg); color: var(--text-secondary); border: 1px solid var(--border); }

/* TABLE */
.table-wrap { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.data-table th {
  text-align: left; padding: 10px 14px;
  font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.5px;
  color: var(--text-muted); border-bottom: 2px solid var(--border); white-space: nowrap;
}
.data-table td {
  padding: 13px 14px; border-bottom: 1px solid var(--border);
  color: var(--text-primary); vertical-align: middle;
}
.data-table tr:last-child td { border-bottom: none; }
.data-table tr:hover td { background: #FAFAF8; }
.data-table .actions { display: flex; gap: 6px; justify-content: flex-end; }

/* MODAL */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(28,25,23,0.45); backdrop-filter: blur(4px);
  z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px;
}
.modal-box {
  background: var(--surface); border-radius: 16px;
  width: 100%; max-width: 500px;
  box-shadow: var(--shadow-lg); overflow: hidden; animation: modalIn 0.2s ease;
}
@keyframes modalIn {
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to   { opacity: 1; transform: none; }
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px 24px 0; margin-bottom: 20px;
}
.modal-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: var(--text-primary); }
.modal-close {
  width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
  border: none; background: var(--bg); border-radius: 50%;
  cursor: pointer; font-size: 16px; color: var(--text-secondary); transition: all 0.15s;
}
.modal-close:hover { background: var(--border); color: var(--text-primary); }
.modal-body { padding: 0 24px 24px; display: flex; flex-direction: column; gap: 16px; }
.modal-footer {
  padding: 16px 24px; background: var(--bg); border-top: 1px solid var(--border);
  display: flex; justify-content: flex-end; gap: 10px;
}

/* FORMS */
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 12px; font-weight: 500; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.3px; }
.form-input, .form-select, .form-textarea {
  padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm);
  background: var(--surface); font-family: 'DM Sans', sans-serif; font-size: 14px;
  color: var(--text-primary); outline: none; transition: border-color 0.15s; width: 100%;
}
.form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--accent); }
.form-textarea { resize: vertical; min-height: 80px; }

/* TOAST */
.toast {
  position: fixed; bottom: 28px; right: 28px;
  background: var(--text-primary); color: #fff;
  padding: 12px 20px; border-radius: var(--radius-sm); font-size: 14px;
  display: flex; align-items: center; gap: 10px;
  box-shadow: var(--shadow-lg); z-index: 999; font-family: 'DM Sans', sans-serif;
}
.toast.error { background: var(--red); }
.toast-icon { font-size: 16px; }
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }

/* EMPTY STATE */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; padding: 64px 24px; gap: 12px;
  color: var(--text-muted); text-align: center;
}
.empty-icon  { font-size: 40px; opacity: 0.3; }
.empty-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 600; color: var(--text-secondary); }
.empty-desc  { font-size: 13px; }
</style>