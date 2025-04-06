import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Dashboard from '../Dashboard';
import courseReducer from '../features/courseSlice';
import uiReducer from '../features/uiSlice';

const mockCourses = [
  {
    id: '1',
    courseName: '테스트 강의 1',
    courseLength: 5,
    courseDuration: 60,
    description: '테스트 설명 1',
    level: '초급',
    alley: '일반',
    regionDisplayName: '서울',
    producer: '테스트 제작자',
    thumbnail: 'test1.jpg'
  },
  {
    id: '2',
    courseName: '테스트 강의 2',
    courseLength: 10,
    courseDuration: 120,
    description: '테스트 설명 2',
    level: '중급',
    alley: '특별',
    regionDisplayName: '부산',
    producer: '테스트 제작자',
    thumbnail: 'test2.jpg'
  }
];

const mockCategories = [
  {
    id: '1',
    title: '카테고리 1',
    courseIdList: ['1']
  },
  {
    id: '2',
    title: '카테고리 2',
    courseIdList: ['2']
  }
];

const renderWithProviders = (component: React.ReactElement) => {
  const store = configureStore({
    reducer: {
      course: courseReducer,
      ui: uiReducer
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
    // Firestore 모의 구현
    jest.mock('../firebase', () => ({
      db: {
        collection: jest.fn().mockReturnThis(),
        doc: jest.fn().mockReturnThis(),
        getDocs: jest.fn().mockResolvedValue({
          docs: mockCourses.map(course => ({
            id: course.id,
            data: () => course
          }))
        })
      }
    }));
  });

  it('강의 목록이 정상적으로 렌더링되어야 합니다', async () => {
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('테스트 강의 1')).toBeInTheDocument();
      expect(screen.getByText('테스트 강의 2')).toBeInTheDocument();
    });
  });

  it('검색 기능이 정상적으로 작동해야 합니다', async () => {
    renderWithProviders(<Dashboard />);

    const searchInput = screen.getByPlaceholderText('강의 검색...');
    fireEvent.change(searchInput, { target: { value: '테스트 강의 1' } });

    await waitFor(() => {
      expect(screen.getByText('테스트 강의 1')).toBeInTheDocument();
      expect(screen.queryByText('테스트 강의 2')).not.toBeInTheDocument();
    });
  });

  it('카테고리 필터링이 정상적으로 작동해야 합니다', async () => {
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      const categoryButton = screen.getByText('카테고리 1');
      fireEvent.click(categoryButton);
    });

    await waitFor(() => {
      expect(screen.getByText('테스트 강의 1')).toBeInTheDocument();
      expect(screen.queryByText('테스트 강의 2')).not.toBeInTheDocument();
    });
  });

  it('새 강의 추가 버튼이 정상적으로 작동해야 합니다', () => {
    renderWithProviders(<Dashboard />);

    const addButton = screen.getByText('새 강의 추가');
    fireEvent.click(addButton);

    expect(window.location.pathname).toBe('/new-course');
  });

  it('강의 카드를 클릭하면 상세 페이지로 이동해야 합니다', async () => {
    renderWithProviders(<Dashboard />);

    await waitFor(() => {
      const courseCard = screen.getByText('테스트 강의 1');
      fireEvent.click(courseCard);
    });

    expect(window.location.pathname).toBe('/course/1');
  });
}); 