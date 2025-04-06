import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import courseReducer from "../features/courseSlice";
import uiReducer from "../features/uiSlice";
import { RootState } from "../types";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    course: courseReducer,
    ui: uiReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type { RootState }; 