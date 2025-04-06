import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "../features/categorySlice";
import { RootState } from "../types";

export const store = configureStore({
  reducer: {
    category: categoryReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type { RootState }; 