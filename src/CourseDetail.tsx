import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Course } from "./types";

const Section = styled.section`
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  margin-bottom: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 600px;
`;

const Label = styled.label`
  font-size: 16px;
  margin-bottom: 5px;
`;

const Input = styled.input`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const TextArea = styled.textarea`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  min-height: 100px;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  background-color: black;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #333;
  }
`;

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      const docRef = doc(db, "allGPSArtCourses", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCourse({ id: docSnap.id, ...docSnap.data() } as Course);
      }
    };

    fetchCourse();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !id) return;

    try {
      const { id: _, ...courseData } = course;
      await updateDoc(doc(db, "allGPSArtCourses", id), courseData);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating course: ", error);
    }
  };

  if (!course) return <div>Loading...</div>;

  return (
    <Section>
      <Title>코스 상세 정보</Title>
      <Form onSubmit={handleSubmit}>
        <div>
          <Label>코스 이름</Label>
          <Input
            type="text"
            value={course.courseName}
            onChange={(e) =>
              setCourse({ ...course, courseName: e.target.value })
            }
          />
        </div>
        <div>
          <Label>코스 길이</Label>
          <Input
            type="number"
            value={course.courseLength}
            onChange={(e) =>
              setCourse({ ...course, courseLength: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <Label>설명</Label>
          <TextArea
            value={course.description}
            onChange={(e) =>
              setCourse({ ...course, description: e.target.value })
            }
          />
        </div>
        <Button type="submit">저장</Button>
      </Form>
    </Section>
  );
};

export default CourseDetail; 