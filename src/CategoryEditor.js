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

const ThumbnailSection = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;

  .thumbnail-preview {
    max-width: 200px;
    margin-top: 10px;
  }
`;

function CategoryEditor() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [courseOrder, setCourseOrder] = useState({});
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(""); // 미리보기 URL
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
    setThumbnailUrl(category.thumbnailUrl || ""); // 카테고리의 썸네일 URL 설정
  };

  const handleCourseToggle = (course) => {
    if (selectedCourses.includes(course.id)) {
      // 선택 해제 시 순서 제거
      setSelectedCourses(selectedCourses.filter((id) => id !== course.id));
      const updatedOrder = { ...courseOrder };
      delete updatedOrder[course.id];
      setCourseOrder(updatedOrder);
    } else {
      // 새로운 순서를 부여하고 선택된 코스에 추가
      setSelectedCourses([...selectedCourses, course.id]);
      setCourseOrder({
        ...courseOrder,
        [course.id]: Object.keys(courseOrder).length + 1,
      });
    }
  };

  // 썸네일 파일 선택 처리
  const handleThumbnailChange = (e) => {
    if (e.target.files[0]) {
      setThumbnail(e.target.files[0]); // 썸네일 파일 저장
      setThumbnailUrl(URL.createObjectURL(e.target.files[0])); // 미리보기 설정
    }
  };

  // 파일 업로드 후 URL 반환 함수
  const uploadThumbnail = async (file) => {
    const storageRef = ref(storage, `thumbnails/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const saveCategory = async () => {
    if (selectedCategory) {
      let thumbnailDownloadUrl = thumbnailUrl;

      // 썸네일이 선택되었다면 Firestorage에 업로드 후 URL 얻기
      if (thumbnail) {
        thumbnailDownloadUrl = await uploadThumbnail(thumbnail);
      }

      // 카테고리 업데이트
      const categoryDoc = doc(db, "artCategories", selectedCategory.id);
      await updateDoc(categoryDoc, {
        courseIdList: selectedCourses,
        thumbnailUrl: thumbnailDownloadUrl, // Firestore에 썸네일 URL 저장
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
    setThumbnail(null);
    setThumbnailUrl("");
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

      <ThumbnailSection>
        <label htmlFor="thumbnail">Change Thumbnail:</label>
        <input type="file" id="thumbnail" onChange={handleThumbnailChange} />
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt="Thumbnail Preview"
            className="thumbnail-preview"
          />
        )}
      </ThumbnailSection>

      <SaveButton onClick={saveCategory}>Update Category</SaveButton>
      <SaveButton onClick={home}>Home</SaveButton>
    </CategoryEditorContainer>
  );
}

export default CategoryEditor;
