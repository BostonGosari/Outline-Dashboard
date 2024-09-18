import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./index";
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
  /* gap: 10px; */
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

const CourseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0; /* Remove the gap to ensure borders meet directly */
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

const CourseInfo = styled.div`
  display: flex;

  width: 100%;
  align-items: center;

  align-items: flex-start;
  flex-direction: column;
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
  const [categories, setCategories] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch all courses from the "allGPSArtCourses" collection
      const allCoursesSnapshot = await getDocs(
        collection(db, "allGPSArtCourses")
      );
      const allCoursesData = allCoursesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllCourses(allCoursesData);

      // Fetch categories and their associated courses
      const categoriesCollection = collection(db, "artCategories");
      const categoriesSnapshot = await getDocs(categoriesCollection);
      const categoryList = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      for (const category of categoryList) {
        const courseDetails = await Promise.all(
          category.courseIdList.map(async (courseId) => {
            const courseDoc = await getDoc(
              doc(db, "allGPSArtCourses", courseId)
            );
            if (courseDoc.exists()) {
              return { id: courseDoc.id, ...courseDoc.data() };
            }
            return null;
          })
        );
        category.courseDetails = courseDetails.filter(Boolean); // Filter out null values
      }

      setCategories(categoryList);
      filterCourses("All", categoryList, allCoursesData);
    };

    fetchData();
  }, []);

  const filterCourses = (categoryName, allCategories, allCourses) => {
    let filtered = [];

    if (categoryName === "All") {
      filtered = allCourses;
    } else {
      const selectedCat = allCategories.find(
        (cat) => cat.title === categoryName
      );
      if (selectedCat) {
        filtered = selectedCat.courseDetails;
      }
    }

    if (searchTerm) {
      filtered = filtered.filter((course) =>
        course.courseName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => a.courseName.localeCompare(b.courseName));

    setFilteredCourses(filtered);
    setSelectedCategory(categoryName);
  };

  const handleSearch = () => {
    filterCourses(selectedCategory, categories, allCourses);
  };

  const handleReadMore = (courseId) => {
    navigate(`/details/${courseId}`);
  };

  const handleAddCourse = () => {
    navigate(`/add`);
  };

  const handleEditCategory = () => {
    navigate(`/categoryeditor`);
  };
  const [isShowing, setIsShowing] = useState(false);
  const openModal = () => {
    setIsShowing(true);
  };
  return (
    <DashboardPage>
      <Section>
        <Top>
          <h1> OUTLINE </h1>
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
            <Chip onClick={() => openModal()}>⚙️</Chip>
          </Chips>
          <SearchContainer>
            <SearchInput
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchButton onClick={handleSearch}>Search</SearchButton>
          </SearchContainer>
        </TopBar>
        <CourseGrid>
          {filteredCourses.map((course) => (
            <CourseItem
              key={course.id}
              onClick={() => handleReadMore(course.id)}
            >
              <CourseImage
                src={course.thumbnail || "https://via.placeholder.com/150"}
                alt={course.courseName}
              />
              <CourseDetails>
                <CourseInfo>
                  <CourseTitle>{course.courseName}</CourseTitle>
                  <CourseLength>{`${course.regionDisplayName} `}</CourseLength>
                </CourseInfo>
              </CourseDetails>
            </CourseItem>
          ))}
        </CourseGrid>
      </Section>
      <div>
        {isShowing != "" ? <CategoryEditor onClose={setIsShowing} /> : null}
      </div>
    </DashboardPage>
  );
}

export default Dashboard;
