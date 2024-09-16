import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./index";

const Section = styled.section`
  display: flex;
  flex-direction: column;
  font-family: "SF Pro", sans-serif;
  max-width: 1140px;
  padding-left: 51px;
  padding-right: 51px;
  height: 100vh;
  margin: 0px auto;

  @media screen and (max-width: 768px) {
    padding-left: 5%;
    padding-right: 5%;
  }

  .title {
    font-size: 36px;
    line-height: 57px;
    font-weight: 700;
    color: #e6e1e6;
    margin-bottom: 10px;
    margin-top: 135px;
  }

  @media screen and (max-width: 768px) {
    .title {
      font-size: 24px;
      line-height: 30px;
      font-weight: 700;
      color: #e6e1e6;
      margin-bottom: 10px;
      margin-top: 135px;
    }
  }

  .inputField {
    margin-bottom: 10px;
    padding: 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
  }

  .button {
    padding: 10px 20px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-bottom: 20px;
  }

  .button:hover {
    background-color: #45a049;
  }
`;

function EditCourse({ match, history }) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      const courseRef = doc(db, "allGPSArtCourses", match.params.id);
      const courseSnap = await getDoc(courseRef);

      if (courseSnap.exists()) {
        const course = courseSnap.data();
        setTitle(course.title);
        // Populate other fields as needed
      } else {
        console.log("No such course!");
      }
    };

    fetchCourse();
  }, [match.params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const courseRef = doc(db, "allGPSArtCourses", match.params.id);

    await updateDoc(courseRef, {
      title,
      // Update other fields as needed
    });

    history.push("/"); // Redirect to dashboard after saving the changes
  };

  return (
    <Section>
      <p className="title">Edit Course</p>
      <form onSubmit={handleSubmit}>
        <input
          className="inputField"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter course title"
          required
        />
        {/* Add more input fields here for other course details */}
        <button className="button" type="submit">
          Save Changes
        </button>
      </form>
    </Section>
  );
}

export default EditCourse;
