import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./services/firebase";
import {
  setCategories,
  setAllCourses,
  setFilteredCourses,
  setSelectedCategory,
  setSearchTerm,
} from "./features/courseSlice";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import CategoryEditor from "./CategoryEditor";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { Category, Course } from "./types";

const DashboardPage = styled.div`
  padding: 20px;
  background-color: white;
  min-height: 100vh;
`;

const Section = styled.section`
  max-width: 1200px;
  margin: 0 auto;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h1 {
    font-size: 24px;
    margin: 0;
  }
`;

const AddCourseButton = styled.button`
  background-color: black;
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #333;
  }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Chips = styled.div`
  display: flex;
  gap: 10px;
`;

const Chip = styled.div<{ active?: boolean }>`
  padding: 5px 15px;
  border-radius: 20px;
  background-color: ${(props) => (props.active ? "black" : "#f0f0f0")};
  color: ${(props) => (props.active ? "white" : "black")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => (props.active ? "black" : "#e0e0e0")};
  }
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const SearchInput = styled.input`
  padding: 8px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  width: 200px;
`;

const SearchButton = styled.button`
  padding: 8px 15px;
  border: none;
  border-radius: 20px;
  background-color: black;
  color: white;
  cursor: pointer;

  &:hover {
    background-color: #333;
  }
`;

const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const CourseItem = styled.div`
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const CourseImage = styled.img`
  width: 100%;
  height: 350px;
  object-fit: cover;
`;

const CourseDetails = styled.div`
  padding: 15px;
`;

const CourseTitle = styled.h3`
  margin: 0 0 5px 0;
  font-size: 18px;
`;

const CourseLength = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
`;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isShowing, setIsShowing] = useState(false);
  
  const { 
    categories, 
    allCourses, 
    filteredCourses, 
    selectedCategory, 
    searchTerm 
  } = useAppSelector((state) => state.course);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data from Firebase...');
        const categoriesSnapshot = await getDocs(collection(db, 'artCategories'));
        console.log('Categories snapshot:', categoriesSnapshot.docs.length);
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
        console.log('Processed categories:', categoriesData);
        dispatch(setCategories(categoriesData));

        const coursesSnapshot = await getDocs(collection(db, 'allGPSArtCourses'));
        console.log('Courses snapshot:', coursesSnapshot.docs.length);
        const coursesData = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Course[];
        console.log('Processed courses:', coursesData);
        dispatch(setAllCourses(coursesData));
        dispatch(setFilteredCourses(coursesData));
      } catch (error) {
        console.error('데이터 가져오기 실패:', error);
      }
    };

    fetchData();
  }, [dispatch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    dispatch(setSearchTerm(value));
    filterCourses(value, selectedCategory);
  };

  const filterCourses = (search: string, category: string) => {
    let filtered = [...allCourses];

    if (category && category !== "All") {
      const categoryObj = categories.find((cat) => cat.id === category);
      if (categoryObj) {
        filtered = categoryObj.courseIdList
          .map(courseId => filtered.find(course => course.id === courseId))
          .filter((course): course is Course => course !== undefined);
      }
    }

    if (search) {
      filtered = filtered.filter(
        (course) =>
          course.courseName.toLowerCase().includes(search.toLowerCase()) ||
          course.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    dispatch(setFilteredCourses(filtered));
  };

  const handleCategoryClick = (categoryId: string) => {
    dispatch(setSelectedCategory(categoryId));
    filterCourses(searchTerm, categoryId);
  };

  const handleAddCourse = () => {
    navigate('/course/new');
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  return (
    <DashboardPage>
      <Section>
        <Top>
          <h1>OUTLINE</h1>
          <AddCourseButton onClick={handleAddCourse}>+</AddCourseButton>
        </Top>

        <TopBar>
          <Chips>
            <Chip
              active={selectedCategory === "All" || selectedCategory === ""}
              onClick={() => handleCategoryClick("All")}
            >
              전체
            </Chip>
            {categories.map((category) => (
              <Chip
                key={category.id}
                active={selectedCategory === category.id}
                onClick={() => handleCategoryClick(category.id)}
              >
                {category.title}
              </Chip>
            ))}
            <Chip onClick={() => setIsShowing(true)}>⚙️</Chip>
          </Chips>
          <SearchContainer>
            <SearchInput
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="검색..."
            />
          </SearchContainer>
        </TopBar>

        <CourseGrid>
          <AnimatePresence mode="wait">
            {filteredCourses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
              >
                <CourseItem onClick={() => handleCourseClick(course.id)}>
                  <CourseImage src={course.thumbnail} alt={course.courseName} />
                  <CourseDetails>
                    <CourseTitle>{course.courseName}</CourseTitle>
                    <CourseLength>{course.regionDisplayName}</CourseLength>
                  </CourseDetails>
                </CourseItem>
              </motion.div>
            ))}
          </AnimatePresence>
        </CourseGrid>
      </Section>
      {isShowing && <CategoryEditor onClose={setIsShowing} />}
    </DashboardPage>
  );
};

export default Dashboard; 