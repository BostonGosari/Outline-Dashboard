import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CategoryState, Category, Course } from "../types";

const initialState: CategoryState = {
  categories: [],
  allCourses: [],
  filteredCourses: [],
  selectedCategory: "All",
  searchTerm: "",
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setCategories(state, action: PayloadAction<Category[]>) {
      state.categories = action.payload;
    },
    setAllCourses(state, action: PayloadAction<Course[]>) {
      state.allCourses = action.payload;
    },
    setFilteredCourses(state, action: PayloadAction<Course[]>) {
      state.filteredCourses = action.payload;
    },
    setSelectedCategory(state, action: PayloadAction<string>) {
      state.selectedCategory = action.payload;
    },
    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
    },
  },
});

export const {
  setCategories,
  setAllCourses,
  setFilteredCourses,
  setSelectedCategory,
  setSearchTerm,
} = categorySlice.actions;

export default categorySlice.reducer; 