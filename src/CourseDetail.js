import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "./index";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import styled from "styled-components";

const Section = styled.section`
  display: flex;
  flex-direction: column;
  max-width: 1140px;
  margin: 0 auto;
  padding: 20px;
  font-family: "SF Pro", sans-serif;
`;

const Label = styled.label`
  margin-top: 10px;
  font-weight: bold;
`;

const Input = styled.input`
  margin-top: 5px;
  padding: 8px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
  width: 100%;
`;

const TextArea = styled.textarea`
  margin-top: 5px;
  padding: 8px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
  width: 100%;
`;

const FileInput = styled.input`
  margin-top: 5px;
  padding: 8px;
  font-size: 16px;
`;

const ThumbnailPreview = styled.img`
  margin-top: 10px;
  width: 200px;
  height: auto;
  border-radius: 5px;
  border: 1px solid #ccc;
`;

const ThumbnailContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 10px;
`;

const ThumbnailGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
  margin-top: 20px;
  align-self: flex-start;

  &:hover {
    background-color: #0056b3;
  }
`;

// KML 파일을 파싱해서 좌표 추출하는 함수
function parseKMLFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const xmlString = event.target.result;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");

      const coordinatesElements = xmlDoc.getElementsByTagName("coordinates");
      let coordinatesArray = [];

      if (coordinatesElements.length > 0) {
        const coordinatesText = coordinatesElements[0].textContent.trim();
        const coordinateStrings = coordinatesText.split(" ");

        coordinateStrings.forEach((coordinateString) => {
          const [longitude, latitude] = coordinateString.split(",").map(Number);
          if (!isNaN(latitude) && !isNaN(longitude)) {
            coordinatesArray.push({ latitude, longitude });
          }
        });

        resolve(coordinatesArray);
      } else {
        reject(new Error("No coordinates found in KML file"));
      }
    };

    reader.onerror = (error) => reject(error);

    reader.readAsText(file);
  });
}

function CourseDetails() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [xmlFile, setXmlFile] = useState(null);
  const navigate = useNavigate();
  const storage = getStorage();

  useEffect(() => {
    const fetchCourse = async () => {
      const docRef = doc(db, "allGPSArtCourses", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCourse(docSnap.data());
      } else {
        console.log("No such document!");
      }
    };

    fetchCourse();
  }, [id]);

  const handleUpdate = async () => {
    if (course) {
      const docRef = doc(db, "allGPSArtCourses", id);
      await updateDoc(docRef, course);
      navigate("/dashboard");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".kml")) {
      setXmlFile(file);

      parseKMLFile(file)
        .then((coordinates) => {
          setCourse((prevCourse) => ({
            ...prevCourse,
            coursePaths: coordinates,
          }));
        })
        .catch((error) => {
          console.error("Error parsing KML file:", error);
        });
    }
  };

  const handleThumbnailUpload = async (e, field) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Firebase Storage에 파일 업로드
        const storageRef = ref(
          storage,
          `thumbnails/${file.name}-${Date.now()}`
        );
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);

        // Firestore에 저장하기 전에 course 상태 업데이트
        setCourse((prevCourse) => ({
          ...prevCourse,
          [field]: downloadUrl, // Firebase Storage에서 얻은 URL을 해당 필드에 저장
        }));

        console.log(`Thumbnail uploaded and URL saved: ${downloadUrl}`);
      } catch (error) {
        console.error("Error uploading thumbnail:", error);
      }
    }
  };

  if (!course) return <p>Loading...</p>;

  return (
    <Section>
      <h1>Edit Course</h1>

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
        onChange={(e) => setCourse({ ...course, courseLength: e.target.value })}
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

      <Label>Thumbnails</Label>
      <ThumbnailContainer>
        <ThumbnailGroup>
          <Label>Main</Label>
          <FileInput
            type="file"
            onChange={(e) => handleThumbnailUpload(e, "thumbnail")}
            accept="image/*"
          />
          {course.thumbnail && (
            <ThumbnailPreview src={course.thumbnail} alt="Main Thumbnail" />
          )}
        </ThumbnailGroup>

        <ThumbnailGroup>
          <Label>Neon</Label>
          <FileInput
            type="file"
            onChange={(e) => handleThumbnailUpload(e, "thumbnailNeon")}
            accept="image/*"
          />
          {course.thumbnailNeon && (
            <ThumbnailPreview src={course.thumbnailNeon} alt="Neon Thumbnail" />
          )}
        </ThumbnailGroup>

        <ThumbnailGroup>
          <Label>Long</Label>
          <FileInput
            type="file"
            onChange={(e) => handleThumbnailUpload(e, "thumbnailLong")}
            accept="image/*"
          />
          {course.thumbnailLong && (
            <ThumbnailPreview src={course.thumbnailLong} alt="Long Thumbnail" />
          )}
        </ThumbnailGroup>
      </ThumbnailContainer>

      <Label>Course Paths (Upload KML)</Label>
      <FileInput type="file" onChange={handleFileUpload} accept=".kml" />

      <Label>Hot Spots</Label>
      {course.hotSpots.map((spot, index) => (
        <div key={index}>
          <Label>Title</Label>
          <Input
            type="text"
            value={spot.title}
            onChange={(e) => {
              const newHotSpots = [...course.hotSpots];
              newHotSpots[index].title = e.target.value;
              setCourse({ ...course, hotSpots: newHotSpots });
            }}
          />

          <Label>Description</Label>
          <TextArea
            value={spot.spotDescription}
            onChange={(e) => {
              const newHotSpots = [...course.hotSpots];
              newHotSpots[index].spotDescription = e.target.value;
              setCourse({ ...course, hotSpots: newHotSpots });
            }}
          />

          <Label>Location (Longitude, Latitude)</Label>
          <Input
            type="text"
            value={`${spot.location.longitude}, ${spot.location.latitude}`}
            onChange={(e) => {
              const [longitude, latitude] = e.target.value
                .split(",")
                .map(Number);
              const newHotSpots = [...course.hotSpots];
              newHotSpots[index].location = { longitude, latitude };
              setCourse({ ...course, hotSpots: newHotSpots });
            }}
          />
        </div>
      ))}

      <Button onClick={handleUpdate}>Update Course</Button>
    </Section>
  );
}

export default CourseDetails;
