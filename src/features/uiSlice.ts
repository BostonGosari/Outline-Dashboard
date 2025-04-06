import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  isSidebarOpen: boolean;
  isModalOpen: boolean;
  modalType: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: UIState = {
  isSidebarOpen: true,
  isModalOpen: false,
  modalType: null,
  loading: false,
  error: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    setModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isModalOpen = action.payload;
    },
    setModalType: (state, action: PayloadAction<string | null>) => {
      state.modalType = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setSidebarOpen,
  setModalOpen,
  setModalType,
  setLoading,
  setError,
} = uiSlice.actions;

export default uiSlice.reducer; 