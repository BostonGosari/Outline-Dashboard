import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Course, Category, HotSpot } from "../types";

interface CourseState {
  categories: Category[];
  allCourses: Course[];
  filteredCourses: Course[];
  selectedCategory: string;
  searchTerm: string;
  selectedCourse: Course | null;
  hotSpots: HotSpot[];
  loading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  categories: [],
  allCourses: [],
  filteredCourses: [],
  selectedCategory: '',
  searchTerm: '',
  selectedCourse: null,
  hotSpots: [],
  loading: false,
  error: null,
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    setAllCourses: (state, action: PayloadAction<Course[]>) => {
      state.allCourses = action.payload;
    },
    setFilteredCourses: (state, action: PayloadAction<Course[]>) => {
      state.filteredCourses = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSelectedCourse: (state, action: PayloadAction<Course | null>) => {
      state.selectedCourse = action.payload;
    },
    setHotSpots: (state, action: PayloadAction<HotSpot[]>) => {
      state.hotSpots = action.payload;
    },
    addHotSpot: (state, action: PayloadAction<HotSpot>) => {
      state.hotSpots.push(action.payload);
    },
    removeHotSpot: (state, action: PayloadAction<string>) => {
      state.hotSpots = state.hotSpots.filter(spot => spot.title !== action.payload);
    },
    updateHotSpot: (state, action: PayloadAction<{ title: string; updatedSpot: HotSpot }>) => {
      const index = state.hotSpots.findIndex(spot => spot.title === action.payload.title);
      if (index !== -1) {
        state.hotSpots[index] = action.payload.updatedSpot;
      }
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
  setCategories,
  setAllCourses,
  setFilteredCourses,
  setSelectedCategory,
  setSearchTerm,
  setSelectedCourse,
  setHotSpots,
  addHotSpot,
  removeHotSpot,
  updateHotSpot,
  setLoading,
  setError,
} = courseSlice.actions;

export default courseSlice.reducer; 