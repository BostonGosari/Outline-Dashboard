export interface Category {
  id: string;
  title: string;
  courseIdList: string[];
  courseDetails?: (Course | null)[];
}

export interface Course {
  id: string;
  courseName: string;
  courseLength: number;
  courseDuration: number;
  description: string;
  level: string;
  alley: string;
  regionDisplayName: string;
  producer: string;
  thumbnail: string;
  locationInfo?: LocationInfo;
}

export interface HotSpot {
  id: string;
  title: string;
  spotDescription: string;
  location: {
    longitude: number;
    latitude: number;
  };
}

export interface LocationInfo {
  center: {
    longitude: number;
    latitude: number;
  };
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface StyledProps {
  isOpen?: boolean;
  isSelected?: boolean;
  active?: boolean;
}

export interface CategoryState {
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

export interface UIState {
  isSidebarOpen: boolean;
  isModalOpen: boolean;
  modalType: string | null;
  loading: boolean;
  error: string | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    email: string;
    displayName: string;
  } | null;
  loading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
  course: CategoryState;
  ui: UIState;
}

export interface NewCourseState {
  courseName: string;
  courseLength: number;
  courseDuration: string;
  description: string;
  level: string;
  alley: string;
  regionDisplayName: string;
  producer: string;
  thumbnail: string;
  locationInfo?: LocationInfo;
  hotSpots: HotSpot[];
}

export interface CenterLocation {
  latitude: number;
  longitude: number;
}

export interface CategoryEditorProps {
  onClose: (value: boolean) => void;
}

export interface PasswordProtectProps {
  onLogin?: (value: boolean) => void;
} 