import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { createPortal } from "react-dom";
import { Category, Course, CategoryEditorProps } from "./types";
import { fetchCategoriesAndCourses, updateCategory } from "./services/firebase";
import cancelImg from "./assets/img/cancel.png";

const Back = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const CategoryEditorContainer = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
`;

const CancelButton = styled.img`
  width: 20px;
  height: 20px;
  cursor: pointer;
  position: absolute;
  top: 20px;
  right: 20px;
`;

const CategoryList = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const Chip = styled.button<{ active: boolean }>`
  padding: 5px 15px;
  font-size: 14px;
  border: 1px solid ${(props) => (props.active ? "#007bff" : "#ccc")};
  background-color: ${(props) => (props.active ? "#007bff" : "white")};
  color: ${(props) => (props.active ? "white" : "#333")};
  border-radius: 15px;
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.active ? "#0056b3" : "#f8f9fa")};
  }
`;

const OrderCircle = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
  background-color: black;
`;

const CourseList = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;

`;

const ActionButtons = styled.div`
  margin-top: 100px;
  display: flex;
  width: 100%;
  justify-content: center;
`;

const SaveButton = styled.button`
  font-family: "NanumSquare";
  padding: 10px 20px;
  font-size: 14px;
  border-radius: 20px;
  background-color: black;
  border: none;
  color: white;
`;

const EditIcon = styled.svg`
  width: 12px;
  height: 12px;
  margin-left: 6px;
  cursor: pointer;
  fill: currentColor;
`;

const ChipContent = styled.div`
  display: flex;
  align-items: center;
  min-width: fit-content;
`;

const EditInput = styled.input.attrs<{ value: string }>(props => ({
  style: {
    width: `${props.value.length * 10}px`
  }
}))`
  border: none;
  background: transparent;
  font-size: 14px;
  min-width: 50px;
  color: inherit;
  outline: none;
  padding: 0;
`;

const CategoryEditor: React.FC<CategoryEditorProps> = ({ onClose }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [courseOrder, setCourseOrder] = useState<{ [key: string]: number }>({});
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const { courses, categories } = await fetchCategoriesAndCourses();
        setAllCourses(courses);
        setCategories(categories);
        
        // 첫 번째 카테고리가 있다면 선택
        if (categories.length > 0) {
          const firstCategory = categories[0];
          setSelectedCategory(firstCategory);
          
          // 선택된 코스 설정
          const courseList = firstCategory.courseIdList || [];
          const validCourses = courseList.filter(courseId => 
            courses.some(course => course.id === courseId)
          );
          
          setSelectedCourses(validCourses);
          
          // 순서 설정
          const newOrder: { [key: string]: number } = {};
          validCourses.forEach((courseId, index) => {
            newOrder[courseId] = index + 1;
          });
          setCourseOrder(newOrder);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    
    // 현재 저장된 courseIdList를 가져오거나 빈 배열 사용
    const existingCourses = category.courseIdList || [];
    
    // 중복 제거 및 실제 존재하는 코스 확인
    const uniqueCourses = Array.from(new Set(existingCourses));
    const validCourses = uniqueCourses.filter(courseId => 
      allCourses.some(course => course.id === courseId)
    );

    setSelectedCourses(validCourses);
    
    // 순서를 1부터 순차적으로 다시 설정
    const newOrder: { [key: string]: number } = {};
    validCourses.forEach((courseId, index) => {
      newOrder[courseId] = index + 1;
    });
    setCourseOrder(newOrder);
  };

  const handleCourseToggle = (course: Course) => {
    let newSelectedCourses: string[];
    
    if (selectedCourses.includes(course.id)) {
      // 코스 제거
      newSelectedCourses = selectedCourses.filter((id) => id !== course.id);
    } else {
      // 코스 추가
      newSelectedCourses = [...selectedCourses, course.id];
    }

    // 순서를 1부터 순차적으로 다시 설정
    const newOrder: { [key: string]: number } = {};
    newSelectedCourses.forEach((courseId, index) => {
      newOrder[courseId] = index + 1;
    });

    setSelectedCourses(newSelectedCourses);
    setCourseOrder(newOrder);
  };

  const saveCategory = async () => {
    if (!selectedCategory) return;

    try {
      await updateCategory(selectedCategory.id, {
        ...selectedCategory,
        courseIdList: selectedCourses,
      });
      onClose(false);
    } catch (error) {
      console.error("Error updating category: ", error);
    }
  };

  const handleEditClick = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation();
    setEditingCategoryId(category.id);
    setEditingTitle(category.title);
  };

  const handleTitleChange = async (categoryId: string) => {
    if (!editingTitle.trim()) return;

    try {
      await updateCategory(categoryId, {
        title: editingTitle.trim()
      });

      setCategories(categories.map(cat => 
        cat.id === categoryId ? { ...cat, title: editingTitle.trim() } : cat
      ));
      setEditingCategoryId(null);
    } catch (error) {
      console.error("Error updating category title: ", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, categoryId: string) => {
    if (e.key === 'Enter') {
      handleTitleChange(categoryId);
    }
  };

  return createPortal(
    <Back>
      <CategoryEditorContainer>
        <CancelButton
          src={cancelImg}
          onClick={() => {
            onClose(false);
          }}
        />
        <h1>카테고리 편집</h1>
        <h4>카테고리</h4>
        <CategoryList>
          {categories.map((category) => (
            <Chip
              key={category.id}
              active={selectedCategory?.id === category.id}
              onClick={() => handleCategorySelect(category)}
            >
              <ChipContent>
                {editingCategoryId === category.id ? (
                  <EditInput
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => handleTitleChange(category.id)}
                    onKeyPress={(e) => handleKeyPress(e, category.id)}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    {category.title}
                    <EditIcon
                      viewBox="0 0 24 24"
                      onClick={(e) => handleEditClick(e, category)}
                    >
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </EditIcon>
                  </>
                )}
              </ChipContent>
            </Chip>
          ))}
        </CategoryList>

        <h4>코스</h4>
        <CourseList>
          {allCourses.map((course) => (
            <Chip
              key={course.id}
              active={selectedCourses.includes(course.id)}
              onClick={() => handleCourseToggle(course)}
            >
              {selectedCourses.includes(course.id) && (
                <OrderCircle>{courseOrder[course.id]}</OrderCircle>
              )}
              {course.courseName}
            </Chip>
          ))}
        </CourseList>
        <ActionButtons>
          <SaveButton onClick={saveCategory}>업데이트</SaveButton>
        </ActionButtons>
      </CategoryEditorContainer>
    </Back>,
    document.getElementById("categoryeditor") as HTMLElement
  );
};

export default CategoryEditor; 