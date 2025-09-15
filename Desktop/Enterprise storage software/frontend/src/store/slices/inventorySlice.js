import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Async thunks for inventory operations
export const fetchProducts = createAsyncThunk(
  'inventory/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/inventory/products`, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch products');
    }
  }
);

export const createProduct = createAsyncThunk(
  'inventory/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/inventory/products`, productData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create product');
    }
  }
);

export const fetchInventoryItems = createAsyncThunk(
  'inventory/fetchItems',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/inventory/items`, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch inventory items');
    }
  }
);

// Initial state
const initialState = {
  products: [],
  inventoryItems: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },
};

// Inventory slice
const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload);
        state.pagination.totalItems += 1;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch inventory items
      .addCase(fetchInventoryItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInventoryItems.fulfilled, (state, action) => {
        state.loading = false;
        state.inventoryItems = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchInventoryItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentPage } = inventorySlice.actions;
export default inventorySlice.reducer;
