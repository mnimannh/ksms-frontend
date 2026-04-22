<template>
  <div class="pos-wrapper">
    <StaffSidebar />

    <!-- Hidden barcode scanner input -->
    <input
      ref="barcodeInput"
      v-model="barcode"
      @keyup.enter="handleBarcode"
      class="barcode-input"
      aria-hidden="true"
    />

    <!-- Receipt Modal -->
    <transition name="modal-fade">
      <div v-if="receipt.show" class="receipt-overlay" @click.self="closeReceipt">
        <div class="receipt-modal">

          <!-- Store header -->
          <div class="rct-head">
            <p class="rct-store">K S M S</p>
            <p class="rct-sub">Point of Sale</p>
            <p class="rct-addr">Koperasi KVSA</p>
          </div>

          <div class="rct-rule"></div>

          <!-- Meta -->
          <div class="rct-meta">
            <div class="rct-meta-row"><span>Order #</span><span>{{ receipt.orderNo }}</span></div>
            <div class="rct-meta-row"><span>Date</span><span>{{ receipt.date }}</span></div>
            <div class="rct-meta-row"><span>Cashier</span><span>{{ receipt.cashier }}</span></div>
          </div>

          <div class="rct-rule"></div>

          <!-- Column headers -->
          <div class="rct-col-head">
            <span class="col-item">ITEM</span>
            <span class="col-qty">QTY</span>
            <span class="col-unit">UNIT</span>
            <span class="col-total">TOTAL</span>
          </div>

          <div class="rct-rule rct-rule--dashed"></div>

          <!-- Items -->
          <div class="rct-items">
            <div v-for="item in receipt.items" :key="item.id" class="rct-item-row">
              <span class="col-item rct-name">{{ item.inventoryName }} {{ item.variant_name }}</span>
              <span class="col-qty">{{ item.orderQty }}</span>
              <span class="col-unit">{{ Number(item.price).toFixed(2) }}</span>
              <span class="col-total">{{ (item.price * item.orderQty).toFixed(2) }}</span>
            </div>
          </div>

          <div class="rct-rule rct-rule--dashed"></div>

          <!-- Totals -->
          <div class="rct-totals">
            <div class="rct-sub-row"><span>Subtotal</span><span>RM {{ receipt.total }}</span></div>
            <div class="rct-sub-row"><span>Tax (0%)</span><span>RM 0.00</span></div>
            <div class="rct-grand"><span>TOTAL</span><span>RM {{ receipt.total }}</span></div>
          </div>

          <div class="rct-rule"></div>

          <p class="rct-thanks">Thank you! Come again. 🙏</p>
          <p class="rct-powered">Powered by KSMS</p>

          <!-- Actions -->
          <div class="receipt-actions">
            <button class="btn-skip" @click="closeReceipt">
              <span class="key-hint">Del</span> Skip
            </button>
            <button class="btn-print" @click="printReceipt">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
              </svg>
              <span class="key-hint key-hint--white">P</span> Print Receipt
            </button>
          </div>
        </div>
      </div>
    </transition>


    <!-- Notification Toast -->
    <transition name="toast-fade">
      <div v-if="notification.show" :class="['notification-toast', `notification-${notification.type}`]">
        <div class="notification-content">
          <svg v-if="notification.type === 'success'" class="notification-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else-if="notification.type === 'error'" class="notification-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <svg v-else-if="notification.type === 'warning'" class="notification-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <svg v-else-if="notification.type === 'info'" class="notification-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <div class="notification-text">
            <p class="notification-title">{{ notification.title }}</p>
            <p v-if="notification.message" class="notification-message">{{ notification.message }}</p>
          </div>
        </div>
        <button @click="closeNotification" class="notification-close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </transition>

    <main class="pos-layout">

      <!-- ── LEFT: PRODUCTS ── -->
      <section class="products-pane">
        <div class="pane-header">
          <div class="header-titles">
            <h1 class="pos-title">Point of <span class="accent">Sale</span></h1>
            <p class="pos-meta">
              <span class="meta-dot" />
              {{ filteredProducts.length }} products · {{ categories.length > 1 ? categories.length - 1 : 0 }} categories
            </p>
          </div>
          <div class="search-wrap">
            <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search products…"
              class="search-input"
              @focus="pauseScanner = true"
              @blur="pauseScanner = false; focusScanner()"
            />
          </div>
        </div>

        <CategoryFilter
          :categories="categories"
          :selectedId="selectedCategoryId"
          @filter="selectedCategoryId = $event"
        />

        <div class="product-grid" v-if="filteredProducts.length > 0">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
            @add-to-cart="addToCart"
          />
        </div>

        <div class="empty-products" v-else>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          <p>No products found</p>
          <span>Try adjusting your search or category</span>
        </div>
      </section>

      <!-- ── RIGHT: ORDER SIDEBAR ── -->
      <section class="order-pane">
        <OrderSidebar
          :cart="cart"
          @remove="removeFromCart"
          @update-qty="updateQty"
          @checkout="processPayment"
          @new-order="resetCart"
        />
      </section>

    </main>
  </div>
</template>

<script>
import API_BASE_URL from '@/services/api';
import StaffSidebar from '@/components/sidebar/staffSidebar.vue';
import CategoryFilter from '@/components/pos/CategoryFilter.vue';
import ProductCard from '@/components/pos/ProductCard.vue';
import OrderSidebar from '@/components/pos/OrderSidebar.vue';
import axios from 'axios';

export default {
  name: 'StaffPOS',
  components: { StaffSidebar, CategoryFilter, ProductCard, OrderSidebar },

  data() {
    return {
      categories: [], products: [], cart: [],
      selectedCategoryId: 0, barcode: '', searchQuery: '',
      pauseScanner: false, productPollInterval: null,
      notification: { show: false, type: 'info', title: '', message: '' },
      notificationTimer: null,
      receipt: { show: false, items: [], total: '0.00', date: '', orderNo: '', cashier: '' },
      cashierName: localStorage.getItem('userName') || 'Staff',
    };
  },

  computed: {
    filteredProducts() {
      let list = this.products;
      if (this.selectedCategoryId !== 0) list = list.filter(p => p.category_id === this.selectedCategoryId);
      if (this.searchQuery.trim()) {
        list = list.filter(p =>
          p.variant_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          p.inventoryName?.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
      return list;
    },
    total() { return this.cart.reduce((sum, i) => sum + i.price * i.orderQty, 0); },
  },

  async created() {
    try {
      const [catRes, prodRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/categories`),
        axios.get(`${API_BASE_URL}/api/variants/pos`),
      ]);
      this.categories = [{ id: 0, name: 'All' }, ...catRes.data];
      this.products = prodRes.data;
    } catch (err) {
      console.error('Error loading POS data', err);
      this.showNotification('error', 'Failed to Load', 'Could not load products. Please refresh.');
    }
  },

  mounted() {
    this.focusScanner();
    document.addEventListener('click', this.onDocClick);
    window.addEventListener('keydown', this.handleKeydown);
    this.productPollInterval = setInterval(this.loadProducts, 5000);
  },

  beforeUnmount() {
    document.removeEventListener('click', this.onDocClick);
    window.removeEventListener('keydown', this.handleKeydown);
    clearInterval(this.productPollInterval);
    if (this.notificationTimer) clearTimeout(this.notificationTimer);
  },

  methods: {
    showNotification(type, title, message = '', duration = 4000) {
      if (this.notificationTimer) clearTimeout(this.notificationTimer);
      this.notification = { show: true, type, title, message };
      this.notificationTimer = setTimeout(() => this.closeNotification(), duration);
    },
    closeNotification() {
      this.notification.show = false;
      if (this.notificationTimer) { clearTimeout(this.notificationTimer); this.notificationTimer = null; }
    },
    onDocClick() { if (!this.pauseScanner) this.focusScanner(); },
    focusScanner() { if (this.$refs.barcodeInput && !this.pauseScanner) this.$refs.barcodeInput.focus(); },

    addToCart(product) {
      const existing = this.cart.find(i => i.id === product.id);
      if (existing) {
        if (existing.orderQty >= product.quantity) { this.showNotification('warning', 'Stock Limit Reached', `Cannot exceed available stock for ${product.variant_name}`); return; }
        existing.orderQty++;
        this.showNotification('success', 'Quantity Updated', `${product.variant_name} (Qty: ${existing.orderQty})`, 2000);
      } else {
        if (product.quantity <= 0) { this.showNotification('error', 'Out of Stock', `${product.variant_name} is currently unavailable`); return; }
        this.cart.push({ ...product, orderQty: 1 });
        this.showNotification('success', 'Added to Cart', product.variant_name, 2000);
      }
    },
    removeFromCart(id) {
      const item = this.cart.find(i => i.id === id);
      if (item) { this.cart = this.cart.filter(i => i.id !== id); this.showNotification('info', 'Removed from Cart', item.variant_name, 2000); }
    },
    updateQty({ id, qty }) {
      const item = this.cart.find(i => i.id === id);
      if (!item) return;
      if (qty > item.quantity) { this.showNotification('warning', 'Exceeds Stock', `Only ${item.quantity} available`); item.orderQty = item.quantity; }
      else if (qty < 1) { item.orderQty = 1; }
      else { item.orderQty = qty; }
    },
    resetCart() { this.cart = []; this.showNotification('info', 'Cart Cleared', 'Ready for new order', 2000); },

    async loadProducts() {
      try {
        const prodRes = await axios.get(`${API_BASE_URL}/api/variants/pos`);
        this.products = prodRes.data.map(p => { const inCart = this.cart.find(c => c.id === p.id); return { ...p, orderQty: inCart ? inCart.orderQty : 0 }; });
      } catch (err) { console.error('Failed to load products', err); }
    },

    handleKeydown(event) {
      if (this.receipt.show) {
        if (event.key === 'p' || event.key === 'P') { event.preventDefault(); this.printReceipt(); }
        if (event.key === 'Delete') this.closeReceipt();
        return;
      }
      if (event.key === 'Delete') this.resetCart();
      if (event.key === 'Enter' && this.barcode === '') this.processPayment();
    },

    async handleBarcode() {
      if (!this.barcode) return;
      const cleaned = this.barcode.trim().replace(/[\r\n]/g, '');
      try {
        const res = await axios.get(`${API_BASE_URL}/api/variants/barcode/${cleaned}`);
        if (res.data) this.addToCart(res.data);
        else this.showNotification('error', 'Product Not Found', `Barcode "${cleaned}" does not exist`);
      } catch { this.showNotification('error', 'Barcode Error', 'Unable to process barcode. Please try again.'); }
      finally { this.barcode = ''; this.focusScanner(); }
    },

    async processPayment() {
      if (!this.cart.length) { this.showNotification('warning', 'Empty Cart', 'Add items before proceeding to payment'); return; }
      try {
        await axios.post(`${API_BASE_URL}/api/orders`, { items: this.cart.map(i => ({ id: i.id, quantity: i.orderQty })) });
        this.receipt = {
          show: true,
          items: [...this.cart],
          total: this.total.toFixed(2),
          date: new Date().toLocaleString('en-MY', { dateStyle: 'medium', timeStyle: 'short' }),
          orderNo: Date.now().toString().slice(-6),
          cashier: this.cashierName,
        };
        this.cart = [];
        this.loadProducts().catch(console.error);
      } catch (err) {
        this.showNotification('error', 'Payment Failed', err.response?.data?.message || 'An unexpected error occurred');
      }
    },

    closeReceipt() {
      this.receipt.show = false;
      this.showNotification('success', 'Payment Successful', `Total: RM${this.receipt.total}`, 3000);
    },

    printReceipt() {
      const items = this.receipt.items.map(item => `
        <div class="pr-item-row">
          <span class="pc-item">${item.inventoryName || ''} ${item.variant_name}</span>
          <span class="pc-qty">${item.orderQty}</span>
          <span class="pc-unit">${Number(item.price).toFixed(2)}</span>
          <span class="pc-tot">${(item.price * item.orderQty).toFixed(2)}</span>
        </div>
      `).join('');

      const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Receipt #${this.receipt.orderNo}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Courier New', monospace; font-size: 11px; width: 72mm; padding: 6mm 4mm; color: #000; }
    .pr-head { text-align: center; margin-bottom: 8px; }
    .pr-store { font-size: 18px; font-weight: bold; letter-spacing: .2em; }
    .pr-sub   { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; margin-top: 2px; }
    .pr-addr  { font-size: 10px; color: #555; margin-top: 2px; }
    .pr-rule  { border: none; border-top: 1px solid #000; margin: 6px 0; }
    .pr-rule.dashed { border-top: 1px dashed #999; }
    .pr-meta  { display: flex; flex-direction: column; gap: 3px; margin: 4px 0; }
    .pr-meta-row { display: flex; justify-content: space-between; font-size: 10px; }
    .pr-col-head { display: grid; grid-template-columns: 1fr 20px 44px 48px; gap: 3px; font-size: 9px; font-weight: bold; text-transform: uppercase; color: #555; margin: 4px 0 2px; }
    .pc-qty, .pc-unit, .pc-tot { text-align: right; }
    .pr-item-row { display: grid; grid-template-columns: 1fr 20px 44px 48px; gap: 3px; font-size: 10px; margin: 3px 0; }
    .pr-total { display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; margin: 4px 0; }
    .pr-thanks  { text-align: center; margin-top: 10px; font-size: 11px; }
    .pr-powered { text-align: center; font-size: 9px; color: #aaa; margin-top: 3px; }
  </style>
</head>
<body>
  <div class="pr-head">
    <p class="pr-store">K S M S</p>
    <p class="pr-sub">Point of Sale</p>
    <p class="pr-addr">Koperasi KVSA</p>
  </div>
  <hr class="pr-rule"/>
  <div class="pr-meta">
    <div class="pr-meta-row"><span>Order #</span><span>${this.receipt.orderNo}</span></div>
    <div class="pr-meta-row"><span>Date</span><span>${this.receipt.date}</span></div>
    <div class="pr-meta-row"><span>Cashier</span><span>${this.receipt.cashier}</span></div>
  </div>
  <hr class="pr-rule"/>
  <div class="pr-col-head">
    <span class="pc-item">ITEM</span><span class="pc-qty">QTY</span><span class="pc-unit">UNIT</span><span class="pc-tot">TOTAL</span>
  </div>
  <hr class="pr-rule dashed"/>
  ${items}
  <hr class="pr-rule dashed"/>
  <div class="pr-meta-row"><span>Subtotal</span><span>RM ${this.receipt.total}</span></div>
  <div class="pr-meta-row"><span>Tax (0%)</span><span>RM 0.00</span></div>
  <hr class="pr-rule dashed"/>
  <div class="pr-total"><span>TOTAL</span><span>RM ${this.receipt.total}</span></div>
  <hr class="pr-rule"/>
  <p class="pr-thanks">Thank you! Come again.</p>
  <p class="pr-powered">Powered by KSMS</p>
</body>
</html>`;

      const win = window.open('', '_blank', 'width=350,height=600');
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); win.close(); }, 300);
    },
  },
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');

</style>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.pos-wrapper {
  display: flex;
  min-height: 100vh;
  background: #f6f7fb;
  font-family: 'DM Sans', sans-serif;
  color: #1e293b;
}

.barcode-input { position: fixed; opacity: 0; pointer-events: none; width: 1px; height: 1px; top: -9999px; }

/* ── Toast ── */
.notification-toast {
  position: fixed; top: 20px; right: 20px;
  max-width: 380px; padding: 14px 16px;
  background: #fff; border-radius: 12px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 4px 20px rgba(0,0,0,.1);
  display: flex; align-items: flex-start; gap: 12px;
  z-index: 9999; animation: slideIn .25s ease-out;
}
@keyframes slideIn { from { opacity:0; transform:translateX(80px); } to { opacity:1; transform:translateX(0); } }

.notification-content { display: flex; align-items: flex-start; gap: 10px; flex: 1; }
.notification-icon { flex-shrink: 0; margin-top: 1px; }
.notification-text { display: flex; flex-direction: column; gap: 2px; }
.notification-title { font-size: 13.5px; font-weight: 600; margin: 0; }
.notification-message { font-size: 12.5px; color: #64748b; margin: 0; line-height: 1.4; }
.notification-close { flex-shrink: 0; background: none; border: none; padding: 3px; cursor: pointer; color: #94a3b8; display: flex; align-items: center; transition: color .15s; }
.notification-close:hover { color: #475569; }

.notification-success { border-color: #bbf7d0; background: #f0fdf4; }
.notification-success .notification-icon { color: #10b981; }
.notification-success .notification-title { color: #047857; }
.notification-error { border-color: #fecaca; background: #fef2f2; }
.notification-error .notification-icon { color: #ef4444; }
.notification-error .notification-title { color: #dc2626; }
.notification-warning { border-color: #fde68a; background: #fffbeb; }
.notification-warning .notification-icon { color: #f59e0b; }
.notification-warning .notification-title { color: #d97706; }
.notification-info { border-color: #bfdbfe; background: #eff6ff; }
.notification-info .notification-icon { color: #3b82f6; }
.notification-info .notification-title { color: #1d4ed8; }

.toast-fade-enter-active, .toast-fade-leave-active { transition: all .25s ease; }
.toast-fade-leave-to { opacity: 0; transform: translateX(80px); }

/* ── Layout ── */
.pos-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 16px;
  padding: 20px 20px 20px 16px;
  min-height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

/* ── Products pane ── */
.products-pane {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  padding: 22px 22px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}

.pane-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; gap: 16px; flex-wrap: wrap;
}

.pos-title {
  font-size: 22px; font-weight: 600;
  color: #0f172a; letter-spacing: -.02em; line-height: 1; margin-bottom: 5px;
}
.accent { color: #6366f1; }

.pos-meta {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: #94a3b8;
}
.meta-dot {
  width: 6px; height: 6px; background: #10b981; border-radius: 50%; flex-shrink: 0;
  animation: live-pulse 2s ease infinite;
}
@keyframes live-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,.4); }
  50%      { box-shadow: 0 0 0 5px rgba(16,185,129,0); }
}

.search-wrap { position: relative; width: 220px; }
.search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
.search-input {
  width: 100%; padding: 9px 12px 9px 34px;
  background: #f8fafc; border: 1px solid #f1f5f9;
  border-radius: 10px; font-family: 'DM Sans', sans-serif;
  font-size: 13px; color: #1e293b; outline: none; transition: border-color .18s, box-shadow .18s;
}
.search-input::placeholder { color: #cbd5e1; }
.search-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); background: #fff; }

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(152px, 1fr));
  gap: 12px; overflow-y: auto;
  padding-right: 4px; padding-bottom: 8px;
}
.product-grid::-webkit-scrollbar { width: 4px; }
.product-grid::-webkit-scrollbar-track { background: transparent; }
.product-grid::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

.empty-products {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 10px; padding: 48px 0; text-align: center;
}
.empty-products p    { font-size: 14px; font-weight: 500; color: #475569; }
.empty-products span { font-size: 12.5px; color: #94a3b8; }

/* ── Order pane ── */
.order-pane {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Receipt Modal ── */
.receipt-overlay {
  position: fixed; inset: 0;
  background: rgba(15,23,42,.55); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 9998; padding: 20px;
}
.receipt-modal {
  background: #fafafa;
  border-radius: 4px;
  width: 100%; max-width: 360px;
  padding: 28px 24px 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,.25), 2px 2px 0 #e2e8f0;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  font-family: 'DM Mono', monospace;
  /* paper tear effect */
  border-top: 2px dashed #e2e8f0;
}

/* Header */
.rct-head { text-align: center; }
.rct-store { font-size: 1.5rem; font-weight: 700; color: #0f172a; letter-spacing: .2em; }
.rct-sub   { font-size: 11px; color: #64748b; letter-spacing: .1em; text-transform: uppercase; margin-top: 2px; }
.rct-addr  { font-size: 10px; color: #94a3b8; margin-top: 3px; }

.rct-rule { width: 100%; height: 1px; background: #e2e8f0; border: none; }
.rct-rule--dashed { background: none; border-top: 1px dashed #e2e8f0; }

/* Meta */
.rct-meta { width: 100%; display: flex; flex-direction: column; gap: 4px; }
.rct-meta-row { display: flex; justify-content: space-between; font-size: 11.5px; color: #475569; }

/* Column headers */
.rct-col-head { display: grid; grid-template-columns: 1fr 28px 52px 56px; width: 100%; gap: 4px; }
.rct-col-head span { font-size: 10px; font-weight: 700; color: #94a3b8; letter-spacing: .08em; }
.col-qty, .col-unit, .col-total { text-align: right; }

/* Items */
.rct-items { width: 100%; display: flex; flex-direction: column; gap: 6px; }
.rct-item-row { display: grid; grid-template-columns: 1fr 28px 52px 56px; gap: 4px; align-items: start; }
.rct-name { font-size: 12px; color: #0f172a; font-weight: 500; line-height: 1.35; word-break: break-word; }
.col-qty   { font-size: 12px; color: #64748b; text-align: right; }
.col-unit  { font-size: 12px; color: #64748b; text-align: right; }
.col-total { font-size: 12px; color: #0f172a; font-weight: 600; text-align: right; }

/* Totals */
.rct-totals { width: 100%; display: flex; flex-direction: column; gap: 4px; }
.rct-sub-row { display: flex; justify-content: space-between; font-size: 12px; color: #64748b; }
.rct-grand   { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 4px; }

.rct-thanks  { font-size: 12px; color: #64748b; text-align: center; }
.rct-powered { font-size: 10px; color: #cbd5e1; text-align: center; letter-spacing: .06em; }

/* Actions */
.receipt-actions { display: flex; gap: 8px; width: 100%; margin-top: 6px; }
.btn-skip {
  flex: 1; padding: 10px; border: 1px solid #e2e8f0; border-radius: 10px;
  background: #f8fafc; font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 500; color: #64748b; cursor: pointer;
  transition: background .15s; display: flex; align-items: center; justify-content: center; gap: 6px;
}
.btn-skip:hover { background: #f1f5f9; }
.btn-print {
  flex: 2; padding: 10px; border: none; border-radius: 10px;
  background: #6366f1; color: #fff;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  gap: 7px; transition: background .15s;
}
.btn-print:hover { background: #4f46e5; }

.key-hint {
  display: inline-flex; align-items: center; justify-content: center;
  background: #e2e8f0; color: #475569;
  font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 700;
  padding: 1px 5px; border-radius: 4px; border: 1px solid #cbd5e1;
}
.key-hint--white {
  background: rgba(255,255,255,.2); color: #fff; border-color: rgba(255,255,255,.3);
}

.modal-fade-enter-active, .modal-fade-leave-active { transition: all .2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .receipt-modal, .modal-fade-leave-to .receipt-modal { transform: translateY(12px) scale(.97); }

/* ── Print styles (screen only) ── */
.print-only { display: none; }

@media (max-width: 900px) {
  .pos-layout { grid-template-columns: 1fr; max-height: none; overflow: visible; }
  .order-pane { min-height: 400px; }
  .pane-body { flex-direction: column; }
  .category-col { width: 100%; }
}
</style>
