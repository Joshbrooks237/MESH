import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  sidebarOpen: true,
  theme: 'light',
  notifications: [],
  loading: false,
  modal: {
    open: false,
    type: null,
    data: null,
  },
  alerts: [],
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    openModal: (state, action) => {
      state.modal = {
        open: true,
        type: action.payload.type,
        data: action.payload.data || null,
      };
    },
    closeModal: (state) => {
      state.modal = {
        open: false,
        type: null,
        data: null,
      };
    },
    addAlert: (state, action) => {
      state.alerts.push({
        id: Date.now(),
        ...action.payload,
      });
    },
    removeAlert: (state, action) => {
      state.alerts = state.alerts.filter(
        (alert) => alert.id !== action.payload
      );
    },
    clearAllAlerts: (state) => {
      state.alerts = [];
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  addNotification,
  removeNotification,
  setLoading,
  openModal,
  closeModal,
  addAlert,
  removeAlert,
  clearAllAlerts,
} = uiSlice.actions;

export default uiSlice.reducer;
