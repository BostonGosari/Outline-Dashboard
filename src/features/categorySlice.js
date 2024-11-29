import { createSlice } from "@reduxjs/toolkit";

const initialState = {
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
    setCategories(state, action) {
      state.categories = action.payload;
    },
    setAllCourses(state, action) {
      state.allCourses = action.payload;
    },
    setFilteredCourses(state, action) {
      state.filteredCourses = action.payload;
    },
    setSelectedCategory(state, action) {
      state.selectedCategory = action.payload;
    },
    setSearchTerm(state, action) {
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
