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
  courseDuration: string;
  description: string;
  level: string;
  alley: string;
  regionDisplayName: string;
  producer: string;
  thumbnail: string;
  locationInfo?: {
    latitude: number;
    longitude: number;
  };
}

export interface HotSpot {
  title: string;
  spotDescription: string;
  location: {
    longitude: number;
    latitude: number;
  };
}

export interface CategoryState {
  categories: Category[];
  allCourses: Course[];
  filteredCourses: Course[];
  selectedCategory: string;
  searchTerm: string;
}

export interface RootState {
  category: CategoryState;
  auth: {
    user: {
      uid: string;
      email: string | null;
      displayName: string | null;
    } | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
  };
  course: {
    selectedCourse: Course | null;
    hotSpots: HotSpot[];
    loading: boolean;
    error: string | null;
  };
}

export interface StyledProps {
  active?: boolean;
}

export interface LocationInfo {
  latitude: number;
  longitude: number;
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