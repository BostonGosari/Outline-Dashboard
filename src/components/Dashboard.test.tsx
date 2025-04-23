import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Dashboard from '../Dashboard';
import courseReducer from '../features/courseSlice';
import uiReducer from '../features/uiSlice';
import * as firebaseApp from 'firebase/app';
import * as firebaseFirestore from 'firebase/firestore';

const mockCourses = [
  {
    id: '1',
    courseName: '서울숲 러닝코스',
    courseLength: 5,
    courseDuration: 30,
    description: '서울숲 주변을 달리는 초급자용 코스',
    level: '초급',
    alley: '공원',
    regionDisplayName: '성동구',
    producer: 'OUTLINE',
    thumbnail: 'seoulforest.jpg',
    thumbnailNeon: 'seoulforest_neon.jpg',
    thumbnailLong: 'seoulforest_long.jpg',
    locationInfo: {
      name: '서울숲',
      isoCountryCode: 'KR',
      administrativeArea: '서울특별시',
      subAdministrativeArea: '성동구',
      locality: '성동구',
      subLocality: '성수동',
      throughfare: '서울숲길',
      subThroughfare: '123'
    },
    distance: 5.2,
    elevation: 50,
    difficulty: '초급',
    estimatedTime: 30,
    startPoint: '서울숲 입구',
    endPoint: '서울숲 출구',
    terrain: '포장도로',
    bestSeason: '봄/가을',
    heading: 0,
    coursePaths: [],
    hotSpots: [],
    title: '서울숲 러닝코스',
    centerLocation: { latitude: 37.5445, longitude: 127.0374 },
    startLocation: { latitude: 37.5445, longitude: 127.0374 },
    navigation: []
  },
  {
    id: '2',
    courseName: '한강 러닝코스',
    courseLength: 10,
    courseDuration: 60,
    description: '한강변을 따라 달리는 중급자용 코스',
    level: '중급',
    alley: '강변',
    regionDisplayName: '영등포구',
    producer: 'OUTLINE',
    thumbnail: 'hanriver.jpg',
    thumbnailNeon: 'hanriver_neon.jpg',
    thumbnailLong: 'hanriver_long.jpg',
    locationInfo: {
      name: '여의도한강공원',
      isoCountryCode: 'KR',
      administrativeArea: '서울특별시',
      subAdministrativeArea: '영등포구',
      locality: '영등포구',
      subLocality: '여의도동',
      throughfare: '여의동로',
      subThroughfare: '45'
    },
    distance: 10.5,
    elevation: 20,
    difficulty: '중급',
    estimatedTime: 60,
    startPoint: '여의도한강공원 입구',
    endPoint: '여의도한강공원 출구',
    terrain: '비포장도로',
    bestSeason: '여름',
    heading: 0,
    coursePaths: [],
    hotSpots: [],
    title: '한강 러닝코스',
    centerLocation: { latitude: 37.5259, longitude: 126.9321 },
    startLocation: { latitude: 37.5259, longitude: 126.9321 },
    navigation: []
  }
];

const mockCategories = [
  {
    id: '1',
    title: 'OUTLINE이 처음이라면',
    courseIdList: ['1']
  },
  {
    id: '2',
    title: '오늘의 ART TOP 5',
    courseIdList: ['2']
  },
  {
    id: '3',
    title: '강아지를 좋아한다면',
    courseIdList: ['1', '2']
  }
];

// Firebase 모킹
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn().mockResolvedValue({
    docs: [
      {
        id: '1',
        data: () => mockCourses[0]
      },
      {
        id: '2',
        data: () => mockCourses[1]
      }
    ]
  }),
  doc: jest.fn(),
  updateDoc: jest.fn()
}));

// 테스트 유틸리티 함수
const renderWithProviders = (component: React.ReactElement) => {
  const store = configureStore({
    reducer: {
      course: courseReducer,
      ui: uiReducer
    },
    preloadedState: {
      course: {
        categories: mockCategories,
        allCourses: mockCourses,
        filteredCourses: mockCourses,
        selectedCategory: '',
        searchTerm: '',
        selectedCourse: null,
        hotSpots: [],
        loading: false,
        error: null
      },
      ui: {
        isDarkMode: false,
        isMenuOpen: false,
        isSidebarOpen: false,
        isModalOpen: false,
        modalType: null,
        loading: false,
        error: null,
        severity: 'info'
      }
    }
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('Dashboard 컴포넌트', () => {
  beforeEach(() => {
    // 각 테스트 전에 모킹 초기화
    jest.clearAllMocks();
  });

  describe('초기 렌더링', () => {
    it('모든 러닝 코스가 표시되어야 합니다', async () => {
      renderWithProviders(<Dashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('서울숲 러닝코스')).toBeInTheDocument();
        expect(screen.getByText('한강 러닝코스')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('모든 카테고리가 표시되어야 합니다', async () => {
      renderWithProviders(<Dashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('OUTLINE이 처음이라면')).toBeInTheDocument();
        expect(screen.getByText('오늘의 ART TOP 5')).toBeInTheDocument();
        expect(screen.getByText('강아지를 좋아한다면')).toBeInTheDocument();
      });
    });
  });

  describe('검색 기능', () => {
    it('코스 이름으로 검색이 가능해야 합니다', async () => {
      renderWithProviders(<Dashboard />);
      
      const searchInput = screen.getByPlaceholderText('검색...');
      fireEvent.change(searchInput, { target: { value: '서울숲' } });

      await waitFor(() => {
        expect(screen.getByText('서울숲 러닝코스')).toBeInTheDocument();
        expect(screen.queryByText('한강 러닝코스')).not.toBeInTheDocument();
      });
    });

    it('지역명으로 검색이 가능해야 합니다', async () => {
      renderWithProviders(<Dashboard />);
      
      const searchInput = screen.getByPlaceholderText('검색...');
      fireEvent.change(searchInput, { target: { value: '영등포구' } });

      await waitFor(() => {
        expect(screen.queryByText('서울숲 러닝코스')).not.toBeInTheDocument();
        expect(screen.getByText('한강 러닝코스')).toBeInTheDocument();
      });
    });
  });

  describe('카테고리 필터링', () => {
    it('카테고리 선택 시 해당 카테고리의 코스만 표시되어야 합니다', async () => {
      renderWithProviders(<Dashboard />);
      
      const categoryButton = screen.getByText('OUTLINE이 처음이라면');
      fireEvent.click(categoryButton);

      await waitFor(() => {
        expect(screen.getByText('서울숲 러닝코스')).toBeInTheDocument();
        expect(screen.queryByText('한강 러닝코스')).not.toBeInTheDocument();
      });
    });

    it('전체 카테고리 선택 시 모든 코스가 표시되어야 합니다', async () => {
      renderWithProviders(<Dashboard />);
      
      const allButton = screen.getByText('전체');
      fireEvent.click(allButton);

      await waitFor(() => {
        expect(screen.getByText('서울숲 러닝코스')).toBeInTheDocument();
        expect(screen.getByText('한강 러닝코스')).toBeInTheDocument();
      });
    });
  });

  describe('카테고리 설정', () => {
    it('설정 버튼 클릭 시 CategoryEditor가 열려야 합니다', async () => {
      renderWithProviders(<Dashboard />);
      
      const settingsButton = screen.getByText('⚙️');
      fireEvent.click(settingsButton);

      await waitFor(() => {
        expect(screen.getByText('카테고리 편집')).toBeInTheDocument();
      });
    });
  });

  describe('코스 상세 정보', () => {
    it('코스 카드 클릭 시 해당 코스의 상세 페이지로 이동해야 합니다', async () => {
      renderWithProviders(<Dashboard />);
      
      const courseCard = screen.getByText('서울숲 러닝코스');
      fireEvent.click(courseCard);

      expect(window.location.pathname).toBe('/course/1');
    });
  });
}); 