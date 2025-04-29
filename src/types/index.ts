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
  title: string;
  centerLocation: { latitude: number; longitude: number };
  startLocation: { latitude: number; longitude: number };
  navigation: any[];
  regionDisplayName: string;
  producer: string;
  thumbnail: string;
  thumbnailNeon: string;
  thumbnailLong: string;
  distance: number;
  heading: number;
  coursePaths: { latitude: number; longitude: number }[];
  locationInfo: LocationInfo;
  level: string;
  alley: string;
  hotSpots: HotSpot[];
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
  name: string;
  isoCountryCode: string;
  administrativeArea: string;
  subAdministrativeArea: string;
  locality: string;
  subLocality: string;
  throughfare: string;
  subThroughfare: string;
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
  courseDuration: number;
  description: string;
  level: string;
  alley: string;
  regionDisplayName: string;
  producer: string;
  thumbnail: string;
  thumbnailNeon: string;
  thumbnailLong: string;
  locationInfo: LocationInfo;
  distance: number;
  heading: number;
  coursePaths: { latitude: number; longitude: number }[];
  hotSpots: HotSpot[];
  title: string;
  centerLocation: { latitude: number; longitude: number };
  startLocation: { latitude: number; longitude: number };
  navigation: any[];
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

export interface KMLParseResult {
  coordinates: number[][];
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  center: {
    latitude: number;
    longitude: number;
  };
  locationInfo: LocationInfo;
}

export interface GPXParseResult {
  coordinates: number[][];
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  center: {
    latitude: number;
    longitude: number;
  };
  locationInfo: LocationInfo;
}

export interface FileUploadResult {
  url: string;
  fileName: string;
} 