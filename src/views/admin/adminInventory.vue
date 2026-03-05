<template>
  <div class="admin-layout">
    <AdminSidebar />

    <main class="inventory-main">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <span class="page-label">WAREHOUSE</span>
          <h1 class="page-title">Inventory</h1>
        </div>
        <div class="header-actions">
          <button class="btn-export">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
          </button>
          <button class="btn-add" @click="showAddModal = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Item
          </button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card" v-for="kpi in kpiCards" :key="kpi.label">
          <div class="kpi-icon" :style="{ background: kpi.bg }">
            <span v-html="kpi.icon"></span>
          </div>
          <div class="kpi-data">
            <span class="kpi-value">{{ kpi.value }}</span>
            <span class="kpi-label">{{ kpi.label }}</span>
          </div>
          <div class="kpi-trend" :class="kpi.trendUp ? 'up' : 'down'">
            <span>{{ kpi.trend }}</span>
          </div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-wrap">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            v-model="searchQuery"
            class="search-input"
            type="text"
            placeholder="Search items, SKU, supplier..."
          />
        </div>
        <div class="filters">
          <select v-model="selectedCategory" class="filter-select">
            <option value="">All Categories</option>
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
          <select v-model="selectedStatus" class="filter-select">
            <option value="">All Status</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
        <div class="view-toggle">
          <button :class="['toggle-btn', viewMode === 'table' ? 'active' : '']" @click="viewMode = 'table'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </button>
          <button :class="['toggle-btn', viewMode === 'grid' ? 'active' : '']" @click="viewMode = 'grid'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
        </div>
      </div>

      <!-- Table View -->
      <div v-if="viewMode === 'table'" class="table-wrapper">
        <table class="inventory-table">
          <thead>
            <tr>
              <th><input type="checkbox" @change="toggleAll" class="check-input" /></th>
              <th @click="sortBy('name')" class="sortable">
                Product <span class="sort-arrow">↕</span>
              </th>
              <th @click="sortBy('sku')" class="sortable">SKU <span class="sort-arrow">↕</span></th>
              <th @click="sortBy('category')" class="sortable">Category <span class="sort-arrow">↕</span></th>
              <th @click="sortBy('stock')" class="sortable">Stock <span class="sort-arrow">↕</span></th>
              <th @click="sortBy('price')" class="sortable">Unit Price <span class="sort-arrow">↕</span></th>
              <th>Status</th>
              <th>Supplier</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredItems" :key="item.id" class="table-row" :class="{ selected: selectedItems.includes(item.id) }">
              <td>
                <input type="checkbox" :value="item.id" v-model="selectedItems" class="check-input" />
              </td>
              <td>
                <div class="product-cell">
                  <div class="product-avatar" :style="{ background: item.color }">{{ item.name[0] }}</div>
                  <div>
                    <span class="product-name">{{ item.name }}</span>
                    <span class="product-id">#{{ item.id }}</span>
                  </div>
                </div>
              </td>
              <td><span class="sku-badge">{{ item.sku }}</span></td>
              <td>{{ item.category }}</td>
              <td>
                <div class="stock-cell">
                  <span class="stock-number" :class="{ low: item.stock < 20, critical: item.stock === 0 }">{{ item.stock }}</span>
                  <div class="stock-bar-bg">
                    <div class="stock-bar-fill" :style="{ width: Math.min((item.stock / item.maxStock) * 100, 100) + '%', background: item.stock < 20 ? '#f59e0b' : '#10b981' }"></div>
                  </div>
                </div>
              </td>
              <td class="price-cell">₱{{ item.price.toLocaleString() }}</td>
              <td>
                <span class="status-badge" :class="item.status.toLowerCase().replace(' ', '-')">
                  {{ item.status }}
                </span>
              </td>
              <td class="supplier-cell">{{ item.supplier }}</td>
              <td>
                <div class="action-menu">
                  <button class="action-btn edit" @click="editItem(item)" title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button class="action-btn delete" @click="confirmDelete(item)" title="Delete">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="table-footer">
          <span class="table-count">Showing {{ filteredItems.length }} of {{ items.length }} items</span>
          <div class="pagination">
            <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">‹</button>
            <button
              v-for="p in totalPages"
              :key="p"
              class="page-btn"
              :class="{ active: currentPage === p }"
              @click="currentPage = p"
            >{{ p }}</button>
            <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">›</button>
          </div>
        </div>
      </div>

      <!-- Grid View -->
      <div v-else class="grid-view">
        <div v-for="item in filteredItems" :key="item.id" class="grid-card">
          <div class="grid-card-header" :style="{ background: item.color }">
            <span class="grid-initial">{{ item.name[0] }}</span>
            <span class="status-badge" :class="item.status.toLowerCase().replace(' ', '-')">{{ item.status }}</span>
          </div>
          <div class="grid-card-body">
            <h3 class="grid-name">{{ item.name }}</h3>
            <span class="sku-badge">{{ item.sku }}</span>
            <div class="grid-stats">
              <div><span class="stat-label">Stock</span><span class="stat-val" :class="{ low: item.stock < 20 }">{{ item.stock }}</span></div>
              <div><span class="stat-label">Price</span><span class="stat-val">₱{{ item.price.toLocaleString() }}</span></div>
              <div><span class="stat-label">Category</span><span class="stat-val">{{ item.category }}</span></div>
            </div>
          </div>
          <div class="grid-card-footer">
            <button class="action-btn edit" @click="editItem(item)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </button>
            <button class="action-btn delete" @click="confirmDelete(item)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      <div v-if="showAddModal || showEditModal" class="modal-overlay" @click.self="closeModals">
        <div class="modal">
          <div class="modal-header">
            <h2>{{ showEditModal ? 'Edit Item' : 'Add New Item' }}</h2>
            <button class="modal-close" @click="closeModals">×</button>
          </div>
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-group">
                <label>Product Name</label>
                <input v-model="form.name" type="text" placeholder="e.g. Office Chair" />
              </div>
              <div class="form-group">
                <label>SKU</label>
                <input v-model="form.sku" type="text" placeholder="e.g. CHR-001" />
              </div>
              <div class="form-group">
                <label>Category</label>
                <select v-model="form.category">
                  <option v-for="cat in categories" :key="cat">{{ cat }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Supplier</label>
                <input v-model="form.supplier" type="text" placeholder="Supplier name" />
              </div>
              <div class="form-group">
                <label>Stock Quantity</label>
                <input v-model.number="form.stock" type="number" placeholder="0" min="0" />
              </div>
              <div class="form-group">
                <label>Unit Price (₱)</label>
                <input v-model.number="form.price" type="number" placeholder="0.00" min="0" />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeModals">Cancel</button>
            <button class="btn-save" @click="saveItem">{{ showEditModal ? 'Update Item' : 'Add Item' }}</button>
          </div>
        </div>
      </div>

      <!-- Delete Confirm Modal -->
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal modal-sm">
          <div class="modal-header">
            <h2>Confirm Delete</h2>
            <button class="modal-close" @click="showDeleteModal = false">×</button>
          </div>
          <div class="modal-body">
            <p class="delete-warning">Are you sure you want to remove <strong>{{ itemToDelete?.name }}</strong> from inventory? This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="showDeleteModal = false">Cancel</button>
            <button class="btn-delete" @click="deleteItem">Delete Item</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import AdminSidebar from '@/components/sidebar/AdminSidebar.vue'

export default {
  name: 'AdminInventory',
  components: { AdminSidebar },

  data() {
    return {
      searchQuery: '',
      selectedCategory: '',
      selectedStatus: '',
      viewMode: 'table',
      currentPage: 1,
      itemsPerPage: 8,
      selectedItems: [],
      showAddModal: false,
      showEditModal: false,
      showDeleteModal: false,
      itemToDelete: null,
      sortKey: 'name',
      sortOrder: 1,

      form: { name: '', sku: '', category: '', supplier: '', stock: 0, price: 0 },

      categories: ['Furniture', 'Electronics', 'Office Supplies', 'Equipment', 'Cleaning', 'Beverages'],

      kpiCards: [
        { label: 'Total Items',    value: '1,284',  trend: '+12 this month', trendUp: true,  bg: 'linear-gradient(135deg,#e0f2fe,#bae6fd)', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>' },
        { label: 'Low Stock',      value: '38',     trend: '+5 since last week', trendUp: false, bg: 'linear-gradient(135deg,#fef9c3,#fde68a)', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' },
        { label: 'Out of Stock',   value: '7',      trend: '-2 restocked', trendUp: true,  bg: 'linear-gradient(135deg,#fee2e2,#fecaca)', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>' },
        { label: 'Total Value',    value: '₱2.4M',  trend: '+8.3% this quarter', trendUp: true,  bg: 'linear-gradient(135deg,#d1fae5,#a7f3d0)', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 1 0 0 7h5a3.5 3.5 0 1 1 0 7H6"/></svg>' },
      ],

      items: [
        { id: 1001, name: 'Ergonomic Chair',     sku: 'CHR-001', category: 'Furniture',       stock: 45,  maxStock: 100, price: 8500,  status: 'In Stock',    supplier: 'FurniPro Inc.',    color: '#6366f1' },
        { id: 1002, name: 'Standing Desk',        sku: 'DSK-002', category: 'Furniture',       stock: 12,  maxStock: 50,  price: 15000, status: 'Low Stock',   supplier: 'DeskMaster Co.',   color: '#8b5cf6' },
        { id: 1003, name: 'HP LaserJet Printer',  sku: 'PRT-003', category: 'Electronics',     stock: 0,   maxStock: 20,  price: 22000, status: 'Out of Stock',supplier: 'TechGear PH',      color: '#06b6d4' },
        { id: 1004, name: 'Whiteboard 4x6ft',     sku: 'WBD-004', category: 'Office Supplies', stock: 28,  maxStock: 60,  price: 3200,  status: 'In Stock',    supplier: 'OfficeHub',        color: '#10b981' },
        { id: 1005, name: 'Conference Projector', sku: 'PRJ-005', category: 'Electronics',     stock: 6,   maxStock: 15,  price: 45000, status: 'Low Stock',   supplier: 'TechGear PH',      color: '#f59e0b' },
        { id: 1006, name: 'Paper Ream (500s)',    sku: 'PPR-006', category: 'Office Supplies', stock: 210, maxStock: 500, price: 280,   status: 'In Stock',    supplier: 'PaperWorld PH',    color: '#3b82f6' },
        { id: 1007, name: 'Coffee Machine',       sku: 'CFM-007', category: 'Beverages',       stock: 4,   maxStock: 10,  price: 18500, status: 'Low Stock',   supplier: 'BrewMaster Corp',  color: '#ef4444' },
        { id: 1008, name: 'Industrial Vacuum',    sku: 'VAC-008', category: 'Cleaning',        stock: 9,   maxStock: 20,  price: 12000, status: 'In Stock',    supplier: 'CleanTech PH',     color: '#14b8a6' },
        { id: 1009, name: 'UPS Battery 1500VA',   sku: 'UPS-009', category: 'Equipment',       stock: 17,  maxStock: 30,  price: 6800,  status: 'In Stock',    supplier: 'PowerSafe Inc.',   color: '#f97316' },
        { id: 1010, name: 'Filing Cabinet',       sku: 'CAB-010', category: 'Furniture',       stock: 0,   maxStock: 25,  price: 4500,  status: 'Out of Stock',supplier: 'FurniPro Inc.',    color: '#a855f7' },
      ],
    }
  },

  computed: {
    filteredItems() {
      return this.items
        .filter(item => {
          const q = this.searchQuery.toLowerCase()
          const matchSearch = !q || item.name.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q) || item.supplier.toLowerCase().includes(q)
          const matchCat    = !this.selectedCategory || item.category === this.selectedCategory
          const matchStatus = !this.selectedStatus   || item.status   === this.selectedStatus
          return matchSearch && matchCat && matchStatus
        })
        .sort((a, b) => {
          const va = a[this.sortKey], vb = b[this.sortKey]
          return va < vb ? -this.sortOrder : va > vb ? this.sortOrder : 0
        })
    },
    totalPages() {
      return Math.ceil(this.filteredItems.length / this.itemsPerPage)
    },
  },

  methods: {
    sortBy(key) {
      if (this.sortKey === key) this.sortOrder *= -1
      else { this.sortKey = key; this.sortOrder = 1 }
    },
    toggleAll(e) {
      this.selectedItems = e.target.checked ? this.filteredItems.map(i => i.id) : []
    },
    editItem(item) {
      this.form = { ...item }
      this.showEditModal = true
    },
    confirmDelete(item) {
      this.itemToDelete = item
      this.showDeleteModal = true
    },
    deleteItem() {
      this.items = this.items.filter(i => i.id !== this.itemToDelete.id)
      this.showDeleteModal = false
      this.itemToDelete = null
    },
    saveItem() {
      if (this.showEditModal) {
        const idx = this.items.findIndex(i => i.id === this.form.id)
        if (idx !== -1) {
          this.form.status = this.form.stock === 0 ? 'Out of Stock' : this.form.stock < 20 ? 'Low Stock' : 'In Stock'
          this.$set(this.items, idx, { ...this.items[idx], ...this.form })
        }
      } else {
        const newItem = {
          ...this.form,
          id: Date.now(),
          maxStock: this.form.stock * 2 || 100,
          status: this.form.stock === 0 ? 'Out of Stock' : this.form.stock < 20 ? 'Low Stock' : 'In Stock',
          color: `hsl(${Math.floor(Math.random() * 360)}, 65%, 55%)`,
        }
        this.items.push(newItem)
      }
      this.closeModals()
    },
    closeModals() {
      this.showAddModal  = false
      this.showEditModal = false
      this.form = { name: '', sku: '', category: '', supplier: '', stock: 0, price: 0 }
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f4f6fb;
  font-family: 'Sora', sans-serif;
}

/* ── MAIN ── */
.inventory-main {
  flex: 1;
  padding: 36px 40px;
  overflow-y: auto;
}

/* ── HEADER ── */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 32px;
}
.page-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  color: #94a3b8;
  margin-bottom: 4px;
}
.page-title {
  font-size: 30px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.5px;
}
.header-actions { display: flex; gap: 12px; }

.btn-export, .btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-family: 'Sora', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all .2s;
  border: none;
}
.btn-export {
  background: #fff;
  color: #475569;
  border: 1.5px solid #e2e8f0;
}
.btn-export:hover { background: #f8fafc; border-color: #cbd5e1; }
.btn-add {
  background: #1e3a5f;
  color: #fff;
  box-shadow: 0 4px 14px rgba(30,58,95,.25);
}
.btn-add:hover { background: #162d4a; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(30,58,95,.3); }

/* ── KPI CARDS ── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}
.kpi-card {
  background: #fff;
  border-radius: 16px;
  padding: 22px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1.5px solid #f1f5f9;
  transition: transform .2s, box-shadow .2s;
}
.kpi-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.07); }
.kpi-icon {
  width: 48px; height: 48px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.kpi-data { flex: 1; }
.kpi-value { display: block; font-size: 22px; font-weight: 700; color: #0f172a; }
.kpi-label { font-size: 12px; color: #94a3b8; font-weight: 500; }
.kpi-trend { font-size: 11px; font-weight: 600; white-space: nowrap; }
.kpi-trend.up   { color: #10b981; }
.kpi-trend.down { color: #f59e0b; }

/* ── TOOLBAR ── */
.toolbar {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}
.search-wrap {
  position: relative;
  flex: 1;
  max-width: 360px;
}
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}
.search-input {
  width: 100%;
  padding: 10px 14px 10px 42px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-family: 'Sora', sans-serif;
  font-size: 13px;
  background: #fff;
  color: #0f172a;
  outline: none;
  transition: border-color .2s;
}
.search-input:focus { border-color: #1e3a5f; }
.filters { display: flex; gap: 10px; }
.filter-select {
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-family: 'Sora', sans-serif;
  font-size: 13px;
  color: #475569;
  background: #fff;
  outline: none;
  cursor: pointer;
  transition: border-color .2s;
}
.filter-select:focus { border-color: #1e3a5f; }
.view-toggle {
  display: flex;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  margin-left: auto;
}
.toggle-btn {
  padding: 9px 13px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #94a3b8;
  transition: all .15s;
}
.toggle-btn.active { background: #1e3a5f; color: #fff; }

/* ── TABLE ── */
.table-wrapper {
  background: #fff;
  border-radius: 16px;
  border: 1.5px solid #f1f5f9;
  overflow: hidden;
}
.inventory-table {
  width: 100%;
  border-collapse: collapse;
}
.inventory-table thead tr {
  background: #f8fafc;
  border-bottom: 1.5px solid #f1f5f9;
}
.inventory-table th {
  padding: 14px 16px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #94a3b8;
  white-space: nowrap;
}
.sortable { cursor: pointer; user-select: none; }
.sortable:hover { color: #475569; }
.sort-arrow { opacity: .5; font-size: 10px; }

.table-row {
  border-bottom: 1px solid #f8fafc;
  transition: background .15s;
}
.table-row:hover { background: #f8fafc; }
.table-row.selected { background: #eff6ff; }
.table-row td { padding: 14px 16px; font-size: 13px; color: #334155; vertical-align: middle; }

.check-input {
  width: 16px; height: 16px;
  accent-color: #1e3a5f;
  cursor: pointer;
}

.product-cell { display: flex; align-items: center; gap: 12px; }
.product-avatar {
  width: 36px; height: 36px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 15px; color: #fff;
  flex-shrink: 0;
}
.product-name { display: block; font-weight: 600; color: #0f172a; font-size: 13px; }
.product-id   { display: block; font-size: 11px; color: #94a3b8; font-family: 'JetBrains Mono', monospace; }

.sku-badge {
  background: #f1f5f9;
  color: #475569;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 500;
}

.stock-cell { display: flex; align-items: center; gap: 10px; }
.stock-number { font-weight: 700; font-size: 14px; color: #0f172a; min-width: 28px; }
.stock-number.low      { color: #f59e0b; }
.stock-number.critical { color: #ef4444; }
.stock-bar-bg {
  width: 60px; height: 6px;
  background: #f1f5f9;
  border-radius: 99px;
  overflow: hidden;
}
.stock-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width .4s;
}

.price-cell { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: #0f172a; }
.supplier-cell { color: #64748b; font-size: 12px; }

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.status-badge.in-stock     { background: #d1fae5; color: #065f46; }
.status-badge.low-stock    { background: #fef3c7; color: #92400e; }
.status-badge.out-of-stock { background: #fee2e2; color: #991b1b; }

.action-menu { display: flex; gap: 6px; }
.action-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 7px 10px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-family: 'Sora', sans-serif;
  font-size: 12px;
  font-weight: 600;
  transition: all .15s;
}
.action-btn.edit   { background: #eff6ff; color: #1d4ed8; }
.action-btn.delete { background: #fff1f2; color: #be123c; }
.action-btn.edit:hover   { background: #dbeafe; }
.action-btn.delete:hover { background: #ffe4e6; }

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1.5px solid #f1f5f9;
}
.table-count { font-size: 12px; color: #94a3b8; }
.pagination { display: flex; gap: 4px; }
.page-btn {
  min-width: 32px; height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  background: #fff;
  font-family: 'Sora', sans-serif;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
  transition: all .15s;
}
.page-btn.active { background: #1e3a5f; color: #fff; border-color: #1e3a5f; }
.page-btn:disabled { opacity: .4; cursor: not-allowed; }
.page-btn:not(:disabled):not(.active):hover { background: #f8fafc; }

/* ── GRID VIEW ── */
.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}
.grid-card {
  background: #fff;
  border-radius: 16px;
  border: 1.5px solid #f1f5f9;
  overflow: hidden;
  transition: transform .2s, box-shadow .2s;
}
.grid-card:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,.08); }
.grid-card-header {
  padding: 24px 20px 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.grid-initial {
  width: 44px; height: 44px;
  background: rgba(255,255,255,.25);
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 18px; color: #fff;
}
.grid-card-body { padding: 16px 20px; }
.grid-name { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
.grid-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
.grid-stats > div { display: flex; flex-direction: column; gap: 2px; }
.stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 600; }
.stat-val   { font-size: 13px; font-weight: 700; color: #0f172a; }
.stat-val.low { color: #f59e0b; }
.grid-card-footer {
  padding: 14px 20px;
  border-top: 1px solid #f1f5f9;
  display: flex; gap: 10px;
}
.grid-card-footer .action-btn { flex: 1; justify-content: center; }

/* ── MODAL ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15,23,42,.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn .2s ease;
}
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

.modal {
  background: #fff;
  border-radius: 20px;
  width: 600px;
  max-width: 95vw;
  box-shadow: 0 25px 60px rgba(0,0,0,.18);
  animation: slideUp .25s ease;
}
.modal.modal-sm { width: 420px; }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 24px 28px 20px;
  border-bottom: 1.5px solid #f1f5f9;
}
.modal-header h2 { font-size: 18px; font-weight: 700; color: #0f172a; }
.modal-close {
  width: 32px; height: 32px;
  border-radius: 8px;
  border: none;
  background: #f1f5f9;
  color: #64748b;
  font-size: 18px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.modal-close:hover { background: #e2e8f0; }

.modal-body { padding: 24px 28px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 12px; font-weight: 600; color: #64748b; }
.form-group input,
.form-group select {
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-family: 'Sora', sans-serif;
  font-size: 13px;
  color: #0f172a;
  outline: none;
  transition: border-color .2s;
  background: #fff;
}
.form-group input:focus,
.form-group select:focus { border-color: #1e3a5f; }

.delete-warning { font-size: 14px; color: #475569; line-height: 1.6; }
.delete-warning strong { color: #0f172a; }

.modal-footer {
  display: flex; gap: 12px; justify-content: flex-end;
  padding: 20px 28px 24px;
  border-top: 1.5px solid #f1f5f9;
}
.btn-cancel, .btn-save, .btn-delete {
  padding: 10px 22px;
  border-radius: 10px;
  font-family: 'Sora', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all .15s;
}
.btn-cancel { background: #f1f5f9; color: #475569; }
.btn-cancel:hover { background: #e2e8f0; }
.btn-save   { background: #1e3a5f; color: #fff; }
.btn-save:hover { background: #162d4a; }
.btn-delete { background: #ef4444; color: #fff; }
.btn-delete:hover { background: #dc2626; }

/* ── RESPONSIVE ── */
@media (max-width: 1200px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) {
  .inventory-main { padding: 24px 20px; }
  .kpi-grid { grid-template-columns: 1fr 1fr; }
  .toolbar  { flex-wrap: wrap; }
  .form-grid { grid-template-columns: 1fr; }
}
</style>