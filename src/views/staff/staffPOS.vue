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
        <h2>Point of Sale (POS)</h2>

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
  },

  beforeUnmount() {
    document.removeEventListener("click", this.focusScanner);
    window.removeEventListener("keydown", this.handleKeydown);
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
        this.products = prodRes.data;
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
.pos-wrapper {
  display: flex;
  background: #f8f9fa;
  min-height: 100vh;
}

.pos-content {
  flex: 1;
  display: flex;
  padding: 20px;
  gap: 20px;
  margin-left: 250px;
}

.item-section {
  flex: 2;
  background: white;
  border-radius: 8px;
  padding: 15px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 15px;
}

.order-section {
  flex: 1;
  min-width: 350px;
}

.barcode-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
</style>