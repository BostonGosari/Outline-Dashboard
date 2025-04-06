import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  isModalOpen: boolean;
  modalType: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UIState = {
  isModalOpen: false,
  modalType: null,
  isLoading: false,
  error: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openModal(state, action: PayloadAction<string>) {
      state.isModalOpen = true;
      state.modalType = action.payload;
    },
    closeModal(state) {
      state.isModalOpen = false;
      state.modalType = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { openModal, closeModal, setLoading, setError } = uiSlice.actions;
export default uiSlice.reducer; 