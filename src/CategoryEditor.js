import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "./index";
import { useNavigate } from "react-router-dom";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Firebase Storage 관련 모듈

const CategoryEditorContainer = styled.div`
  max-width: 1080px;
  padding: 20px;
  margin: 0px auto;
`;

const CategoryList = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

const Chip = styled.button`
  padding: 8px 10px;
  font-size: 14px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  border: solid 1px black;
  background-color: ${(props) => (props.active ? "black" : "white")};
  color: ${(props) => (props.active ? "white" : "black")};
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  box-sizing: border-box;

  &:hover {
    background-color: ${(props) => (props.active ? "#c0c0c0" : "#c0c0c0")};
  }
`;

const OrderCircle = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: white;
  background-color: black;
`;

const CourseList = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const SaveButton = styled.button`
  padding: 10px;
  margin-top: 50px;
  margin-right: 10px;
  font-size: 14px;
  border-radius: 20px;
  background-color: blue;
  color: white;
  cursor: pointer;
`;

function CategoryEditor() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [courseOrder, setCourseOrder] = useState({});
  const navigate = useNavigate();

  const storage = getStorage(); // Firebase Storage 인스턴스

  useEffect(() => {
    const fetchCategoriesAndCourses = async () => {
      // Fetch categories
      const categoriesSnapshot = await getDocs(collection(db, "artCategories"));
      const categoriesData = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 첫 번째 카테고리를 기본 선택
      setCategories(categoriesData);
      if (categoriesData.length > 0) {
        const firstCategory = categoriesData[0];
        handleCategorySelect(firstCategory);
      }

      // Fetch and sort all courses by name (가나다순)
      const coursesSnapshot = await getDocs(collection(db, "allGPSArtCourses"));
      const coursesData = coursesSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => a.courseName.localeCompare(b.courseName)); // 가나다순 정렬
      setAllCourses(coursesData);
    };

    fetchCategoriesAndCourses();
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedCourses(category.courseIdList || []);
    // 선택된 카테고리의 기존 순서를 초기화
    const initialOrder = {};
    category.courseIdList.forEach((courseId, index) => {
      initialOrder[courseId] = index + 1;
    });
    setCourseOrder(initialOrder);
  };

  const handleCourseToggle = (course) => {
    if (selectedCourses.includes(course.id)) {
      setSelectedCourses(selectedCourses.filter((id) => id !== course.id));
      const updatedOrder = { ...courseOrder };
      delete updatedOrder[course.id];
      setCourseOrder(updatedOrder);
    } else {
      setSelectedCourses([...selectedCourses, course.id]);
      setCourseOrder({
        ...courseOrder,
        [course.id]: Object.keys(courseOrder).length + 1,
      });
    }
  };

  const saveCategory = async () => {
    if (selectedCategory) {
      // 카테고리 업데이트
      const categoryDoc = doc(db, "artCategories", selectedCategory.id);
      await updateDoc(categoryDoc, {
        courseIdList: selectedCourses,
      });
    }
    resetForm();
  };

  const home = () => {
    navigate(`/dashboard`);
  };

  const resetForm = () => {
    setSelectedCategory(null);
    setSelectedCourses([]);
    setCourseOrder({});
  };

  return (
    <CategoryEditorContainer>
      <h2>Edit Categories</h2>

      <CategoryList>
        {categories.map((category) => (
          <Chip
            key={category.id}
            active={selectedCategory && selectedCategory.id === category.id}
            onClick={() => handleCategorySelect(category)}
          >
            {category.title}
          </Chip>
        ))}
      </CategoryList>

      <h3>Select Courses</h3>
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

      <SaveButton onClick={saveCategory}>Update Category</SaveButton>
      <SaveButton onClick={home}>Home</SaveButton>
    </CategoryEditorContainer>
  );
}

export default CategoryEditor;
