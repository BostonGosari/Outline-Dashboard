import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "../features/categorySlice";
import authReducer from "../features/authSlice";
import { RootState } from "../types";

export const store = configureStore({
  reducer: {
    category: categoryReducer,
    auth: authReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type { RootState }; 