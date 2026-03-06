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

    <main class="pos-layout">

      <!-- ── LEFT: PRODUCTS ─────────────────────────────────── -->
      <section class="products-pane">

        <!-- Header -->
        <div class="pane-header">
          <div class="header-left">
            <div class="header-titles">
              <h1 class="pos-title">Point of Sale</h1>
              <p class="pos-meta">
                <span class="meta-dot" />
                {{ filteredProducts.length }} products
                <span class="meta-sep">·</span>
                {{ categories.length > 1 ? categories.length - 1 : 0 }} categories
              </p>
            </div>
          </div>

          <!-- Search -->
          <div class="search-wrap">
            <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
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

        <!-- Category filter -->
        <CategoryFilter
          :categories="categories"
          :selectedId="selectedCategoryId"
          @filter="selectedCategoryId = $event"
        />

        <!-- Product grid -->
        <div class="product-grid" v-if="filteredProducts.length > 0">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
            @add-to-cart="addToCart"
          />
        </div>

        <!-- Empty state -->
        <div class="empty-products" v-else>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d8d5cc" stroke-width="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          <p>No products found</p>
          <span>Try adjusting your search or category</span>
        </div>

      </section>

      <!-- ── RIGHT: ORDER SIDEBAR ────────────────────────────── -->
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
      categories: [],
      products: [],
      cart: [],
      selectedCategoryId: 0,
      barcode: '',
      searchQuery: '',
      pauseScanner: false,
      productPollInterval: null,
    };
  },

  computed: {
    filteredProducts() {
      let list = this.products;
      if (this.selectedCategoryId !== 0)
        list = list.filter((p) => p.category_id === this.selectedCategoryId);
      if (this.searchQuery.trim())
        list = list.filter((p) =>
          p.variant_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          p.inventoryName?.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      return list;
    },
    total() {
      return this.cart.reduce((sum, item) => sum + item.price * item.orderQty, 0);
    },
  },

  async created() {
    try {
      const [catRes, prodRes] = await Promise.all([
        axios.get('http://localhost:3000/api/categories'),
        axios.get('http://localhost:3000/api/variants'),
      ]);
      this.categories = [{ id: 0, name: 'All' }, ...catRes.data];
      this.products = prodRes.data;
    } catch (err) {
      console.error('Error loading POS data', err);
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
  },

  methods: {
    onDocClick(e) {
      // Don't steal focus from search input
      if (!this.pauseScanner) this.focusScanner();
    },

    focusScanner() {
      if (this.$refs.barcodeInput && !this.pauseScanner) {
        this.$refs.barcodeInput.focus();
      }
    },

    // ── Cart ──────────────────────────────────────────────────
    addToCart(product) {
      const existing = this.cart.find((i) => i.id === product.id);
      if (existing) {
        if (existing.orderQty >= product.quantity) {
          alert('Cannot exceed available stock');
          return;
        }
        existing.orderQty++;
      } else {
        if (product.quantity <= 0) return;
        this.cart.push({ ...product, orderQty: 1 });
      }
    },

    removeFromCart(id) {
      this.cart = this.cart.filter((item) => item.id !== id);
    },

    updateQty({ id, qty }) {
      const item = this.cart.find((i) => i.id === id);
      if (!item) return;
      const max = item.quantity;
      if (qty > max) { alert('Exceeds stock limit'); item.orderQty = max; }
      else if (qty < 1) { item.orderQty = 1; }
      else { item.orderQty = qty; }
    },

    resetCart() {
      this.cart = [];
    },

    // ── Product polling ───────────────────────────────────────
    async loadProducts() {
      try {
        const prodRes = await axios.get('http://localhost:3000/api/variants');
        this.products = prodRes.data.map((p) => {
          const inCart = this.cart.find((c) => c.id === p.id);
          return { ...p, orderQty: inCart ? inCart.orderQty : 0 };
        });
      } catch (err) {
        console.error('Failed to load products', err);
      }
    },

    // ── Keyboard shortcuts ────────────────────────────────────
    handleKeydown(event) {
      if (event.key === 'Delete') this.resetCart();
      if (event.key === 'Enter' && this.barcode === '') this.processPayment();
    },

    // ── Barcode scanner ───────────────────────────────────────
    async handleBarcode() {
      if (!this.barcode) return;
      const cleanedBarcode = this.barcode.trim().replace(/[\r\n]/g, '');
      try {
        const res = await axios.get(
          `http://localhost:3000/api/variants/barcode/${cleanedBarcode}`
        );
        if (res.data) {
          this.addToCart(res.data);
        } else {
          alert('Product not found!');
        }
      } catch (err) {
        alert('Product not found!');
      } finally {
        this.barcode = '';
        this.focusScanner();
      }
    },

    // ── Payment ───────────────────────────────────────────────
    async processPayment() {
      if (!this.cart.length) return;
      try {
        await axios.post('http://localhost:3000/api/orders', {
          items: this.cart.map((i) => ({ id: i.id, quantity: i.orderQty })),
        });
        alert('Payment successful!');
        this.cart = [];
        this.loadProducts().catch((err) => console.error(err));
      } catch (err) {
        alert(err.response?.data?.message || 'Payment failed');
      }
    },
  },
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Serif+Display&family=DM+Mono:wght@400;500&display=swap');
</style>

<style scoped>
/* ── Base ──────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.pos-wrapper {
  display: flex;
  min-height: 100vh;
  background: #f6f7fb;
  font-family: 'DM Sans', sans-serif;
  color: #1a1a18;
}

/* Hidden barcode input */
.barcode-input {
  position: fixed;
  opacity: 0;
  pointer-events: none;
  width: 1px; height: 1px;
  top: -9999px;
}

/* ── Main layout ───────────────────────────────────────────────── */
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

/* ── Products pane ─────────────────────────────────────────────── */
.products-pane {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e8e5dd;
  padding: 22px 22px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow: hidden;
}

/* Header */
.pane-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.pos-title {
  font-family: 'DM Serif Display', serif;
  font-size: 22px;
  font-weight: 400;
  color: #1a1a18;
  letter-spacing: -.01em;
  line-height: 1;
  margin-bottom: 5px;
}

.pos-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #9e9b93;
}

.meta-dot {
  width: 6px; height: 6px;
  background: #10b981; border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 0 rgba(16,185,129,.5);
  animation: live-pulse 2s ease infinite;
}
@keyframes live-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,.4); }
  50%      { box-shadow: 0 0 0 5px rgba(16,185,129,0); }
}
.meta-sep { color: #d8d5cc; }

/* Search */
.search-wrap {
  position: relative;
  width: 220px;
}
.search-icon {
  position: absolute; left: 11px; top: 50%;
  transform: translateY(-50%);
  color: #b5b2a9; pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 9px 12px 9px 34px;
  background: #faf8f3;
  border: 1px solid #e8e5dd;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; color: #1a1a18;
  outline: none;
  transition: border-color .18s;
}
.search-input::placeholder { color: #b5b2a9; }
.search-input:focus {
  border-color: #c9a96e;
  background: #fff;
}

/* Product grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(152px, 1fr));
  gap: 12px;
  overflow-y: auto;
  padding-right: 4px;
  padding-bottom: 8px;
}
.product-grid::-webkit-scrollbar { width: 4px; }
.product-grid::-webkit-scrollbar-track { background: transparent; }
.product-grid::-webkit-scrollbar-thumb { background: #dedad2; border-radius: 2px; }

/* Empty state */
.empty-products {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #9e9b93;
  text-align: center;
  padding: 48px 0;
}
.empty-products p    { font-size: 14px; font-weight: 500; color: #6b6860; }
.empty-products span { font-size: 12.5px; color: #b5b2a9; }

/* ── Order pane ────────────────────────────────────────────────── */
.order-pane {
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid #e8e5dd;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Responsive ────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .pos-layout {
    grid-template-columns: 1fr;
    max-height: none;
    overflow: visible;
  }
  .order-pane {
    min-height: 400px;
  }
}
</style>