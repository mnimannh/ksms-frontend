<template>
  <div class="pos-wrapper">
    <StaffSidebar />

    <main class="pos-content">
      
      <!-- LEFT: PRODUCTS -->
      <section class="item-section">
        <h2>Point of Sale (POS)</h2>

        <!-- ✅ FILTER COMPONENT -->
        <CategoryFilter
          :categories="categories"
          :selectedId="selectedCategoryId"
          @filter="selectedCategoryId = $event"
        />

        <!-- ✅ PRODUCT GRID -->
        <div class="product-grid">
          <ProductCard
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
            @add-to-cart="addToCart"
          />
        </div>
      </section>

      <!-- ✅ RIGHT: ORDER SIDEBAR -->
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
import StaffSidebar from '@/components/StaffSidebar.vue'
import CategoryFilter from '@/components/CategoryFilter.vue'
import ProductCard from '@/components/ProductCard.vue'
import OrderSidebar from '@/components/OrderSidebar.vue'
import axios from 'axios'

export default {
  name: 'StaffPOS',
  components: {
    StaffSidebar,
    CategoryFilter,
    ProductCard,
    OrderSidebar
  },

  data() {
    return {
      categories: [],
      products: [],
      cart: [],
      selectedCategoryId: 0
    }
  },

  computed: {
    filteredProducts() {
      if (this.selectedCategoryId === 0) return this.products
      return this.products.filter(
        p => p.category_id === this.selectedCategoryId
      )
    },

    // ✅ TOTAL ONLY (NO TAX)
    total() {
      return this.cart.reduce(
        (sum, item) => sum + item.price * item.orderQty,
        0
      )
    }
  },

  async created() {
    try {
      const [catRes, prodRes] = await Promise.all([
        axios.get('http://localhost:3000/api/categories'),
        axios.get('http://localhost:3000/api/variants')
      ])

      this.categories = [{ id: 0, name: 'All' }, ...catRes.data]
      this.products = prodRes.data
    } catch (err) {
      console.error('Error loading POS data', err)
    }
  },

  methods: {
    // -------------------
    // Add product to cart
    // -------------------
    addToCart(product) {
      const existing = this.cart.find(i => i.id === product.id)
      if (existing) {
        if (existing.orderQty >= product.quantity) {
          alert("Cannot exceed available stock")
          return
        }
        existing.orderQty++
      } else {
        if (product.quantity <= 0) return
        this.cart.push({ ...product, orderQty: 1 })
      }
    },

    // -------------------
    // Remove item from cart
    // -------------------
    removeFromCart(id) {
      this.cart = this.cart.filter(item => item.id !== id)
    },

    // -------------------
    // Update quantity
    // -------------------
    updateQty({ id, qty }) {
      const item = this.cart.find(i => i.id === id)
      if (!item) return

      const maxStock = item.quantity
      if (qty > maxStock) {
        alert("Exceeds stock limit")
        item.orderQty = maxStock
      } else if (qty < 1) {
        item.orderQty = 1
      } else {
        item.orderQty = qty
      }
    },

    // -------------------
    // Reset cart
    // -------------------
    resetCart() {
      this.cart = []
    },

    // -------------------
    // Load products from backend
    // -------------------
    async loadProducts() {
      try {
        const prodRes = await axios.get('http://localhost:3000/api/variants')
        this.products = prodRes.data
      } catch (err) {
        console.error("Failed to load products", err)
      }
    },

    // -------------------
    // Process payment
    // -------------------
    async processPayment() {
      if (!this.cart.length) return

      try {
        // Send cart to backend
        const res = await axios.post('http://localhost:3000/api/orders', {
          items: this.cart.map(i => ({ id: i.id, quantity: i.orderQty }))
        })

        // ✅ Payment successful
        alert(`Payment successful!`)

        // Clear cart immediately
        this.cart = []

        // Refresh products, non-blocking
        this.loadProducts().catch(err => console.error(err))
      } catch (err) {
        alert(err.response?.data?.message || "Payment failed")
      }
    }
  }
}
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
</style>