import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Category, Course, CategoryEditorProps } from "./types";

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
  max-width: 600px;
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

const CategoryEditor: React.FC<CategoryEditorProps> = ({ onClose }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [courseOrder, setCourseOrder] = useState<{ [key: string]: number }>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoriesAndCourses = async () => {
      const categoriesSnapshot = await getDocs(collection(db, "artCategories"));
      const categoriesData = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];

      setCategories(categoriesData);
      if (categoriesData.length > 0) {
        handleCategorySelect(categoriesData[0]);
      }

      const coursesSnapshot = await getDocs(collection(db, "allGPSArtCourses"));
      const coursesData = coursesSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          courseName: doc.data().courseName as string,
          ...doc.data(),
        }))
        .sort((a, b) => a.courseName.localeCompare(b.courseName)) as Course[];
      setAllCourses(coursesData);
    };

    fetchCategoriesAndCourses();
  }, []);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSelectedCourses(category.courseIdList || []);
    const initialOrder: { [key: string]: number } = {};
    category.courseIdList.forEach((courseId, index) => {
      initialOrder[courseId] = index + 1;
    });
    setCourseOrder(initialOrder);
  };

  const handleCourseToggle = (course: Course) => {
    if (selectedCourses.includes(course.id)) {
      setSelectedCourses(selectedCourses.filter((id) => id !== course.id));
      const newOrder = { ...courseOrder };
      delete newOrder[course.id];
      setCourseOrder(newOrder);
    } else {
      setSelectedCourses([...selectedCourses, course.id]);
      setCourseOrder({
        ...courseOrder,
        [course.id]: Object.keys(courseOrder).length + 1,
      });
    }
  };

  const saveCategory = async () => {
    if (!selectedCategory) return;

    const orderedCourseIds = Object.entries(courseOrder)
      .sort(([, a], [, b]) => a - b)
      .map(([id]) => id);

    const updatedCategory = {
      ...selectedCategory,
      courseIdList: orderedCourseIds,
    };

    try {
      await updateDoc(doc(db, "artCategories", selectedCategory.id), updatedCategory);
      onClose(false);
    } catch (error) {
      console.error("Error updating category: ", error);
    }
  };

  return createPortal(
    <Back>
      <CategoryEditorContainer>
        <CancelButton
          src="/cancel.png"
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
              {category.title}
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