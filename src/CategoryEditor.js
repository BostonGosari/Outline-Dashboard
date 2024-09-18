import { createPortal } from "react-dom";
import styled from "styled-components";
import cancel from "./assets/img/cancel.png";
import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "./index";
import { useNavigate } from "react-router-dom";

const Back = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
`;

const CategoryEditorContainer = styled.div`
  width: 600px;
  height: 600px;
  display: flex;
  z-index: 100;
  flex-direction: column;
  align-items: flex-start;
  position: fixed;
  top: calc(50% - 360px);
  left: calc(50% - 350px);

  border-radius: 30px;
  border: 1px solid #fff;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(30px);
  padding: 50px 50px;
`;

const CategoryList = styled.div`
  display: flex;
  gap: 10px;
`;

const CancelButton = styled.img`
  position: absolute;
  right: 20px;
  top: 20px;
  width: 20px;
  height: 20px;
  float: right;
  margin-right: 37px;
  margin-left: auto;
  margin-top: 27px;
  margin-bottom: 7px;
`;

const Chip = styled.button`
  font-family: "NanumSquare";
  padding: ${(props) =>
    props.active ? "8px" : "8px 12px"}; // 패딩을 약간 더 크게 조정하여 통일
  font-size: 12px;
  border-radius: 20px;
  cursor: pointer;
  border: solid 1px black;
  background-color: ${(props) => (props.active ? "black" : "transparent")};
  color: ${(props) => (props.active ? "white" : "black")};
  box-sizing: border-box;

  // 선택된 칩과 선택되지 않은 칩의 border 및 padding이 동일하게 적용되도록 설정
  display: flex;
  align-items: center;
  gap: 5px;
  height: 30px; // 일정한 높이로 설정

  &:hover {
    background-color: ${(props) => (props.active ? "#c0c0c0" : "#c0c0c0")};
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

function CategoryEditor(props) {
  const { onClose } = props;
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [courseOrder, setCourseOrder] = useState({});
  const navigate = useNavigate();

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
      // 선택 해제 시 해당 코스 삭제
      const newSelectedCourses = selectedCourses.filter(
        (id) => id !== course.id
      );

      // 새로운 순서로 courseOrder 업데이트
      const updatedOrder = {};
      newSelectedCourses.forEach((courseId, index) => {
        updatedOrder[courseId] = index + 1;
      });

      setSelectedCourses(newSelectedCourses);
      setCourseOrder(updatedOrder);
    } else {
      // 선택 시 추가
      setSelectedCourses([...selectedCourses, course.id]);
      setCourseOrder({
        ...courseOrder,
        [course.id]: Object.keys(courseOrder).length + 1,
      });
    }
  };

  const saveCategory = async () => {
    if (selectedCategory) {
      const categoryDoc = doc(db, "artCategories", selectedCategory.id);
      await updateDoc(categoryDoc, {
        courseIdList: selectedCourses,
      });
    }
    alert("카테고리가 업데이트되었습니당 🩵 ");
    onClose(false);
  };

  return createPortal(
    <Back>
      <CategoryEditorContainer>
        <CancelButton
          src={cancel}
          onClick={() => {
            onClose(false);
          }}
        ></CancelButton>
        <h1>카테고리 편집</h1>
        <h4>카테고리</h4>
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
    document.getElementById("categoryeditor")
  );
}

export default CategoryEditor;
