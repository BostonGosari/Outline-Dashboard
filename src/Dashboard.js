import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./index";
import {
  setCategories,
  setAllCourses,
  setFilteredCourses,
  setSelectedCategory,
  setSearchTerm,
} from "./features/categorySlice";
import styled from "styled-components";

import { useNavigate } from "react-router-dom";
import CategoryEditor from "./CategoryEditor";

const DashboardPage = styled.div`
  width: 100%;
  height: 100%;
  background-color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  max-width: 1000px;
  width: 100%;
  padding: 20px;
  margin: 0px auto;

  @media screen and (max-width: 768px) {
    padding: 0 5%;
  }
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Chips = styled.div`
  display: flex;
  gap: 10px;
`;

const Chip = styled.button`
  font-family: "NanumSquare";
  padding: 5px 10px;
  font-size: 12px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  border: solid 1px black;
  background-color: ${(props) => (props.active ? "black" : "white")};
  color: ${(props) => (props.active ? "white" : "black")};

  &:hover {
    background-color: ${(props) => (props.active ? "#c0c0c0" : "#c0c0c0")};
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 7px;
  font-size: 14px;
  border: 1px solid black;
  width: 150px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const SearchButton = styled.button`
  padding: 8px 10px;
  font-size: 14px;
  border: none;
  cursor: pointer;
  background-color: black;
  color: white;

  &:hover {
    background-color: black;
  }
`;

const CourseGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0;
  margin-top: 20px;
`;

const CourseItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 15px;
  border: 1px solid #ccc;
  background-color: #fff;
  box-sizing: border-box;

  &:not(:nth-child(5n + 1)) {
    border-left: none;
  }

  &:not(:nth-last-child(-n + 5)) {
    border-bottom: none;
  }
`;

const CourseDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const CourseTitle = styled.h2`
  font-size: 16px;
  margin: 0;
  font-weight: bold;
  color: #333;
`;

const CourseLength = styled.p`
  font-size: 12px;
  margin: 5px 0 0 0;
  color: #555;
`;

const CourseImage = styled.img`
  width: 100%;
  height: auto;
  margin-bottom: 10px;
`;

const AddCourseButton = styled.button`
  width: 40px;
  height: 40px;
  font-size: 30px;
  font-weight: 200;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background-color: black;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #218838;
  }
`;

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    categories,
    allCourses,
    filteredCourses,
    selectedCategory,
    searchTerm,
  } = useSelector((state) => state.category);

  const [isShowing, setIsShowing] = useState(false); // 모달 상태 추가

  useEffect(() => {
    const fetchData = async () => {
      const allCoursesSnapshot = await getDocs(
        collection(db, "allGPSArtCourses")
      );
      const allCoursesData = allCoursesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      dispatch(setAllCourses(allCoursesData));

      const categoriesSnapshot = await getDocs(collection(db, "artCategories"));
      const categoryList = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 각 카테고리에 courseDetails 추가
      const updatedCategories = await Promise.all(
        categoryList.map(async (category) => {
          const courseDetails = await Promise.all(
            (category.courseIdList || []).map(async (courseId) => {
              const courseDoc = allCoursesData.find(
                (course) => course.id === courseId
              );
              return courseDoc || null;
            })
          );
          return { ...category, courseDetails: courseDetails.filter(Boolean) };
        })
      );

      dispatch(setCategories(updatedCategories));
      filterCourses("All", updatedCategories, allCoursesData);
    };

    fetchData();
  }, [dispatch]);

  const filterCourses = (categoryName, allCategories, allCourses) => {
    let filtered = categoryName === "All" ? allCourses : [];
    if (categoryName !== "All") {
      const selectedCat = allCategories.find(
        (cat) => cat.title === categoryName
      );
      if (selectedCat) filtered = selectedCat.courseDetails || [];
    }
    filtered = filtered.filter((course) =>
      course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    dispatch(setFilteredCourses(filtered));
    dispatch(setSelectedCategory(categoryName));
  };

  const handleSearch = () => {
    filterCourses(selectedCategory, categories, allCourses);
  };

  const handleAddCourse = () => {
    navigate("/add");
  };

  const handleReadMore = (courseId) => {
    navigate(`/details/${courseId}`);
  };

  const openModal = () => {
    setIsShowing(true);
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
              active={selectedCategory === "All"}
              onClick={() => filterCourses("All", categories, allCourses)}
            >
              All
            </Chip>
            {categories.map((category) => (
              <Chip
                key={category.id}
                active={selectedCategory === category.title}
                onClick={() =>
                  filterCourses(category.title, categories, allCourses)
                }
              >
                {category.title}
              </Chip>
            ))}
            <Chip onClick={openModal}>⚙️</Chip>
          </Chips>
          <SearchContainer>
            <SearchInput
              type="text"
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            />
            <SearchButton onClick={handleSearch}>Search</SearchButton>
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
                <CourseItem onClick={() => handleReadMore(course.id)}>
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
      <div>
        {isShowing != "" ? <CategoryEditor onClose={setIsShowing} /> : null}
      </div>
    </DashboardPage>
  );
}

export default Dashboard;
