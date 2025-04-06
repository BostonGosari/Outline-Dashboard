import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "../features/categorySlice";
import authReducer from "../features/authSlice";
import courseReducer from "../features/courseSlice";
import { RootState } from "../types";

export const store = configureStore({
  reducer: {
    category: categoryReducer,
    auth: authReducer,
    course: courseReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type { RootState }; 