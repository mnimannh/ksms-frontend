<template>
  <div class="admin-dashboard flex h-screen w-full overflow-hidden bg-slate-100">
    
    <AdminSidebar class="w-64 flex-shrink-0 h-full shadow-lg" />

    <main class="flex-1 overflow-y-auto p-8">
      <div class="max-w-7xl mx-auto">
        <header class="mb-8">
          <h1 class="text-4xl font-extrabold text-slate-900">Inventory Management</h1>
          <p class="text-slate-500 mt-2 text-lg">Manage your product categories, stock, and variants.</p>
        </header>

        <div class="mb-8">
          <button 
            @click="addCategory" 
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2"
          >
            <span class="text-xl">+</span> Add Category
          </button>
        </div>

        <div class="categories-container grid grid-cols-1 gap-6">
          <CategoryCard
            v-for="cat in categories"
            :key="cat.id"
            :category="cat"
            @edit="editCategory"
            @delete="deleteCategory"
            @add-inventory="addInventory"
            @edit-inventory="editInventory"
            @delete-inventory="deleteInventory"
            @add-variant="addVariant"
            @edit-variant="editVariant"
            @delete-variant="deleteVariant"
          />
          
          <div v-if="categories.length === 0" class="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-300">
             <p class="text-slate-400">No categories found. Click "+ Add Category" to begin.</p>
          </div>
        </div>
      </div>

      <div v-if="showCategoryModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <h2 class="text-2xl font-bold mb-6 text-slate-800">{{ editingCategory ? 'Edit Category' : 'Add Category' }}</h2>
          <input v-model="categoryForm.name" placeholder="Category Name" class="border border-slate-300 rounded-xl px-4 py-3 w-full mb-6 focus:ring-2 focus:ring-blue-500 outline-none transition-all"/>
          <div class="flex justify-end space-x-3">
            <button @click="closeCategoryModal" class="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition">Cancel</button>
            <button @click="saveCategory" class="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-md">Save Category</button>
          </div>
        </div>
      </div>

      <div v-if="showInventoryModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg">
          <h2 class="text-2xl font-bold mb-6 text-slate-800">{{ editingInventory ? 'Edit Inventory' : 'Add Inventory' }}</h2>
          <div class="space-y-4">
            <input v-model="inventoryForm.inventoryName" placeholder="Inventory Name" class="border border-slate-300 rounded-xl px-4 py-3 w-full"/>
            <select v-model="inventoryForm.category_id" class="border border-slate-300 rounded-xl px-4 py-3 w-full bg-white">
              <option value="" disabled>Select Category</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
            <textarea v-model="inventoryForm.description" placeholder="Description" class="border border-slate-300 rounded-xl px-4 py-3 w-full h-24"></textarea>
            <div>
              <label class="text-sm font-semibold text-slate-600 mb-1 block">Low Stock Threshold</label>
              <input type="number" v-model="inventoryForm.default_threshold" class="border border-slate-300 rounded-xl px-4 py-3 w-full"/>
            </div>
          </div>
          <div class="flex justify-end space-x-3 mt-8">
            <button @click="closeInventoryModal" class="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition">Cancel</button>
            <button @click="saveInventory" class="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition">Save Item</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import AdminSidebar from "@/components/adminSidebar.vue";
import CategoryCard from "@/components/CategoryCard.vue";
import axios from "axios";

export default {
  name: "InventoryManagement",
  components: { AdminSidebar, CategoryCard },
  data() {
    return {
      categories: [],
      inventory: [],
      variants: [],
      showCategoryModal: false,
      showInventoryModal: false,
      showVariantModal: false,
      categoryForm: { name: '' },
      inventoryForm: { inventoryName: '', category_id: '', description: '', default_threshold: 10 },
      variantForm: { inventory_id: '', variant_name: '', quantity: 0, price: 0, barcode: '' },
      editingCategory: null,
      editingInventory: null,
      editingVariant: null
    };
  },
  methods: {
    async fetchCategories() { try { const res = await axios.get('/api/categories'); this.categories = res.data; } catch (e) { console.error(e); } },
    async fetchInventory() { try { const res = await axios.get('/api/inventory'); this.inventory = res.data; } catch (e) { console.error(e); } },
    async fetchVariants() { try { const res = await axios.get('/api/variants'); this.variants = res.data; } catch (e) { console.error(e); } },

    closeCategoryModal() { this.showCategoryModal = false; this.editingCategory = null; },
    closeInventoryModal() { this.showInventoryModal = false; this.editingInventory = null; },
    closeVariantModal() { this.showVariantModal = false; this.editingVariant = null; },

    addCategory() { 
      this.categoryForm = { name: '' };
      this.editingCategory = null; 
      this.showCategoryModal = true; 
    },
    editCategory(cat) { 
      this.editingCategory = cat; 
      this.categoryForm = { ...cat }; 
      this.showCategoryModal = true; 
    },
    saveCategory() {
      const request = this.editingCategory 
        ? axios.put(`/api/categories/${this.editingCategory.id}`, this.categoryForm)
        : axios.post(`/api/categories`, this.categoryForm);
      
      request.then(() => { this.fetchCategories(); this.closeCategoryModal(); });
    },
    deleteCategory(id) { 
      if(confirm('Delete this category?')) axios.delete(`/api/categories/${id}`).then(() => this.fetchCategories()); 
    },

    addInventory(categoryId) { 
      this.inventoryForm = { inventoryName: '', category_id: categoryId || '', description: '', default_threshold: 10 };
      this.editingInventory = null;
      this.showInventoryModal = true; 
    },
    editInventory(item) { 
      this.editingInventory = item; 
      this.inventoryForm = { ...item }; 
      this.showInventoryModal = true; 
    },
    saveInventory() {
      const request = this.editingInventory 
        ? axios.put(`/api/inventory/${this.editingInventory.id}`, this.inventoryForm)
        : axios.post(`/api/inventory`, this.inventoryForm);
      
      request.then(() => { this.fetchInventory(); this.closeInventoryModal(); });
    },
    deleteInventory(id) { 
      if(confirm('Delete this item?')) axios.delete(`/api/inventory/${id}`).then(() => this.fetchInventory()); 
    }
  },
  mounted() {
    this.fetchCategories();
    this.fetchInventory();
    this.fetchVariants();
  }
};
</script>

<style scoped>
/* Scoped styles kept minimal to allow Tailwind to do the work */
.admin-dashboard {
  min-height: 100vh;
}
</style>