<template>
  <div class="pos-wrapper">
    <StaffSidebar />

    <main class="pos-content">

      <!-- Hidden scanner input -->
      <input
        ref="barcodeInput"
        v-model="barcode"
        @keyup.enter="handleBarcode"
        class="barcode-input"
      />

      <!-- LEFT: PRODUCTS -->
      <section class="item-section">
        <div class="item-section-header">
          <div>
            <h2 class="pos-title">Point of Sale</h2>
            <p class="pos-sub">Admin · {{ filteredProducts.length }} products</p>
          </div>
        </div>

        <CategoryFilter
          :categories="categories"
          :selectedId="selectedCategoryId"
          @filter="selectedCategoryId = $event"
        />

        <div class="product-grid">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
            @add-to-cart="addToCart"
          />
        </div>
      </section>

      <!-- RIGHT: ORDER SIDEBAR -->
      <section class="order-section">
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
import StaffSidebar from "@/components/sidebar/staffSidebar.vue";
import CategoryFilter from "@/components/pos/CategoryFilter.vue";
import ProductCard from "@/components/pos/ProductCard.vue";
import OrderSidebar from "@/components/pos/OrderSidebar.vue";
import axios from "axios";

export default {
  name: "StaffPOS",

  components: {
    StaffSidebar,
    CategoryFilter,
    ProductCard,
    OrderSidebar,
  },

  data() {
    return {
      categories: [],
      products: [],
      cart: [],
      selectedCategoryId: 0,
      barcode: "",
    };
  },

  computed: {
    filteredProducts() {
      if (this.selectedCategoryId === 0) return this.products;
      return this.products.filter(
        (p) => p.category_id === this.selectedCategoryId
      );
    },

    total() {
      return this.cart.reduce(
        (sum, item) => sum + item.price * item.orderQty,
        0
      );
    },
  },

  async created() {
    try {
      const [catRes, prodRes] = await Promise.all([
        axios.get("http://localhost:3000/api/categories"),
        axios.get("http://localhost:3000/api/variants"),
      ]);

      this.categories = [{ id: 0, name: "All" }, ...catRes.data];
      this.products = prodRes.data;
    } catch (err) {
      console.error("Error loading POS data", err);
    }
  },

  mounted() {
    // Keep scanner input focused
    this.focusScanner();
    document.addEventListener("click", this.focusScanner);

    // Keyboard shortcuts
    window.addEventListener("keydown", this.handleKeydown);
      // Start polling for products every 5 seconds
  this.productPollInterval = setInterval(this.loadProducts, 5000);
  },

  beforeUnmount() {
    document.removeEventListener("click", this.focusScanner);
    window.removeEventListener("keydown", this.handleKeydown);
      // Stop polling
  clearInterval(this.productPollInterval);
  },

  methods: {
    focusScanner() {
      if (this.$refs.barcodeInput) {
        this.$refs.barcodeInput.focus();
      }
    },

    addToCart(product) {
      const existing = this.cart.find((i) => i.id === product.id);
      if (existing) {
        if (existing.orderQty >= product.quantity) {
          alert("Cannot exceed available stock");
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

      const maxStock = item.quantity;
      if (qty > maxStock) {
        alert("Exceeds stock limit");
        item.orderQty = maxStock;
      } else if (qty < 1) {
        item.orderQty = 1;
      } else {
        item.orderQty = qty;
      }
    },

    resetCart() {
      this.cart = [];
    },

async loadProducts() {
  try {
    const prodRes = await axios.get("http://localhost:3000/api/variants");
    const newProducts = prodRes.data;

    // Merge new stock data into existing products
    this.products = newProducts.map((p) => {
      const inCart = this.cart.find((c) => c.id === p.id);
      return { ...p, orderQty: inCart ? inCart.orderQty : 0 };
    });
  } catch (err) {
    console.error("Failed to load products", err);
  }
},

    handleKeydown(event) {
      if (event.key === "Delete") this.resetCart();
      if (event.key === "Enter" && this.barcode === "") this.processPayment();
    },

    // --------------------------
    // Barcode scanning
    // --------------------------
async handleBarcode() {
  
  if (!this.barcode) return;

  // clean barcode: remove spaces and newline characters
  const cleanedBarcode = this.barcode.trim().replace(/[\r\n]/g, '');

  try {
    const res = await axios.get(
      `http://localhost:3000/api/variants/barcode/${cleanedBarcode}`
    );

    if (res.data) {
      this.addToCart(res.data);
    } else {
      console.warn('Product not found:', cleanedBarcode);
      alert('Product not found!');
    }
  } catch (err) {
    console.warn('Product not found:', cleanedBarcode);
    alert('Product not found!');
  } finally {
    this.barcode = '';
    this.focusScanner(); // keep input focused
  }
},

    // --------------------------
    // Payment
    // --------------------------
    async processPayment() {
      if (!this.cart.length) return;

      try {
        await axios.post("http://localhost:3000/api/orders", {
          items: this.cart.map((i) => ({ id: i.id, quantity: i.orderQty })),
        });

        alert("Payment successful!");
        this.cart = [];
        this.loadProducts().catch((err) => console.error(err));
      } catch (err) {
        alert(err.response?.data?.message || "Payment failed");
      }
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&family=DM+Serif+Display&display=swap');

.pos-wrapper {
  display: flex;
  background: #f5f4f0;
  min-height: 100vh;
  font-family: 'DM Sans', sans-serif;
  color: #1a1a18;
}

.pos-content {
  display: flex;
  padding: 24px;
  gap: 24px;
  margin-left: 250px; /* staff sidebar width */
  min-height: 100vh;
}

/* Left: Products (8/12 columns) */
.item-section {
  flex: 8;
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #e8e6e0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

.item-section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.pos-title {
  font-family: 'DM Serif Display', serif;
  font-size: 22px;
  font-weight: 400;
  color: #1a1a18;
  line-height: 1;
}

.pos-sub {
  font-size: 12px;
  color: #9e9b93;
  margin-top: 5px;
  letter-spacing: 0.03em;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: 14px;
}

/* ── Right: Order ── */
.order-section {
  flex: 4;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e8e6e0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ── Hidden barcode input ── */
.barcode-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* ── Scrollbars ── */
.item-section::-webkit-scrollbar {
  width: 4px;
}
.item-section::-webkit-scrollbar-track {
  background: transparent;
}
.item-section::-webkit-scrollbar-thumb {
  background: #d8d5cc;
  border-radius: 2px;
}
</style>