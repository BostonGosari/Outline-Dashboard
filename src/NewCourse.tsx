import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { NewCourseState, HotSpot, LocationInfo } from "./types";

const Section = styled.section`
  display: flex;
  flex-direction: column;
  max-width: 800px;
  width: 100%;
  padding: 20px;
  margin: 0 auto;
`;

const Label = styled.label`
  font-size: 14px;
  margin-bottom: 5px;
  color: #333;
`;

const Input = styled.input`
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  margin-bottom: 15px;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const TextArea = styled.textarea`
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  margin-bottom: 15px;
  width: 100%;
  min-height: 100px;
  box-sizing: border-box;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ChipContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
`;

const Chip = styled.button<{ active?: boolean }>`
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

const Button = styled.button`
  padding: 10px 20px;
  font-size: 14px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;

  &:hover {
    background-color: #0056b3;
  }
`;

const initialState: NewCourseState = {
  courseName: "",
  courseLength: 0,
  courseDuration: "0",
  description: "",
  level: "normal",
  alley: "none",
  regionDisplayName: "",
  producer: "",
  thumbnail: "",
  locationInfo: {
    center: {
      longitude: 0,
      latitude: 0
    },
    bounds: {
      north: 0,
      south: 0,
      east: 0,
      west: 0
    }
  },
  hotSpots: [],
};

const NewCourse: React.FC = () => {
  const [course, setCourse] = useState<NewCourseState>(initialState);
  const navigate = useNavigate();

  const handleChipChange = (field: keyof NewCourseState, value: string) => {
    setCourse((prevCourse) => ({
      ...prevCourse,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const docRef = await addDoc(collection(db, "allGPSArtCourses"), course);
      console.log("Document written with ID: ", docRef.id);
      navigate("/dashboard");
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <Section>
      <h1>Add New Course</h1>

      <Label>Course Name</Label>
      <Input
        type="text"
        value={course.courseName}
        onChange={(e) => setCourse({ ...course, courseName: e.target.value })}
      />

      <Label>Course Length (km)</Label>
      <Input
        type="number"
        value={course.courseLength}
        onChange={(e) =>
          setCourse({ ...course, courseLength: Number(e.target.value) })
        }
      />

      <Label>Course Duration (minutes)</Label>
      <Input
        type="number"
        value={course.courseDuration}
        onChange={(e) =>
          setCourse({ ...course, courseDuration: e.target.value })
        }
      />

      <Label>Course Description</Label>
      <TextArea
        value={course.description}
        onChange={(e) => setCourse({ ...course, description: e.target.value })}
      />

      <Label>Course Level</Label>
      <ChipContainer>
        <Chip
          active={course.level === "easy"}
          onClick={() => handleChipChange("level", "easy")}
        >
          Easy
        </Chip>
        <Chip
          active={course.level === "normal"}
          onClick={() => handleChipChange("level", "normal")}
        >
          Normal
        </Chip>
        <Chip
          active={course.level === "hard"}
          onClick={() => handleChipChange("level", "hard")}
        >
          Hard
        </Chip>
      </ChipContainer>

      <Label>Alley Type</Label>
      <ChipContainer>
        <Chip
          active={course.alley === "none"}
          onClick={() => handleChipChange("alley", "none")}
        >
          None
        </Chip>
        <Chip
          active={course.alley === "few"}
          onClick={() => handleChipChange("alley", "few")}
        >
          Few
        </Chip>
        <Chip
          active={course.alley === "lots"}
          onClick={() => handleChipChange("alley", "lots")}
        >
          Lots
        </Chip>
      </ChipContainer>

      <Label>Region Display Name</Label>
      <Input
        type="text"
        value={course.regionDisplayName}
        onChange={(e) =>
          setCourse({ ...course, regionDisplayName: e.target.value })
        }
      />

      <Label>Producer</Label>
      <Input
        type="text"
        value={course.producer}
        onChange={(e) => setCourse({ ...course, producer: e.target.value })}
      />

      <Label>Thumbnail URL</Label>
      <Input
        type="text"
        value={course.thumbnail}
        onChange={(e) => setCourse({ ...course, thumbnail: e.target.value })}
      />

      <Button onClick={handleSubmit}>Add Course</Button>
    </Section>
  );
};

export default NewCourse; 