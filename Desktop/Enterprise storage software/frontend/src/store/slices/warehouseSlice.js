import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Async thunks for warehouse operations
export const fetchWarehouses = createAsyncThunk(
  'warehouse/fetchWarehouses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/warehouse`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data.warehouses;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch warehouses');
    }
  }
);

export const fetchWarehouseZones = createAsyncThunk(
  'warehouse/fetchZones',
  async (warehouseId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/warehouse/${warehouseId}/zones`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return { warehouseId, zones: response.data.zones };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch warehouse zones');
    }
  }
);

export const fetchWarehouseLocations = createAsyncThunk(
  'warehouse/fetchLocations',
  async ({ warehouseId, zoneId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/warehouse/${warehouseId}/locations`, {
        params: { zoneId },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return { warehouseId, zoneId, locations: response.data.locations };
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch warehouse locations');
    }
  }
);

// Initial state
const initialState = {
  warehouses: [],
  zones: {},
  locations: {},
  currentWarehouse: null,
  loading: false,
  error: null,
};

// Warehouse slice
const warehouseSlice = createSlice({
  name: 'warehouse',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentWarehouse: (state, action) => {
      state.currentWarehouse = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch warehouses
      .addCase(fetchWarehouses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses = action.payload;
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch zones
      .addCase(fetchWarehouseZones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarehouseZones.fulfilled, (state, action) => {
        state.loading = false;
        state.zones[action.payload.warehouseId] = action.payload.zones;
      })
      .addCase(fetchWarehouseZones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch locations
      .addCase(fetchWarehouseLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarehouseLocations.fulfilled, (state, action) => {
        state.loading = false;
        const key = `${action.payload.warehouseId}-${action.payload.zoneId || 'all'}`;
        state.locations[key] = action.payload.locations;
      })
      .addCase(fetchWarehouseLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentWarehouse } = warehouseSlice.actions;
export default warehouseSlice.reducer;
