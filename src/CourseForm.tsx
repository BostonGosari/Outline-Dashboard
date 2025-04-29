import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, addDoc, collection } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "./services/firebase";
import { Course, LocationInfo } from "./types";
import CourseFileUpload from "./components/CourseFileUpload";

interface ChipProps {
  active: boolean;
}

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

const ChipContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const Chip = styled.button<ChipProps>`
  padding: 10px;
  font-size: 14px;
  border: ${(props) => (props.active ? "2px solid #007bff" : "1px solid #ccc")};
  background-color: ${(props) => (props.active ? "#007bff" : "transparent")};
  color: ${(props) => (props.active ? "#fff" : "#000")};
  border-radius: 20px;
  cursor: pointer;

  &:hover {
    background-color: #007bff;
    color: #fff;
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #28a745;
  color: white;
  margin-top: 20px;
  align-self: flex-start;

  &:hover {
    background-color: #218838;
  }
`;

const initialState: Course = {
  id: "",
  courseName: "",
  courseLength: 0,
  courseDuration: 0,
  description: "",
  title: "없어져야할 필드",
  centerLocation: { latitude: 0, longitude: 0 },
  startLocation: { latitude: 0, longitude: 0 },
  navigation: [],
  regionDisplayName: "",
  producer: "",
  thumbnail: "",
  thumbnailNeon: "",
  thumbnailLong: "",
  distance: 0,
  heading: 0,
  coursePaths: [],
  locationInfo: {
    name: "",
    isoCountryCode: "",
    administrativeArea: "",
    subAdministrativeArea: "",
    locality: "",
    subLocality: "",
    throughfare: "",
    subThroughfare: "",
  },
  level: "easy",
  alley: "none",
  hotSpots: [],
};

const CourseForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const storage = getStorage();
  const [course, setCourse] = useState<Course>(initialState);
  const isEditMode = !!id;

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      const docRef = doc(db, "allGPSArtCourses", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const courseData = docSnap.data() as Course;
        setCourse({ ...courseData, id });
      }
    };

    fetchCourse();
  }, [id]);

  const handleFileProcessed = (data: {
    coordinates: { latitude: number; longitude: number }[];
    locationInfo: LocationInfo;
    startLocation: { latitude: number; longitude: number };
    centerLocation: { latitude: number; longitude: number };
  }) => {
    setCourse((prevCourse) => ({
      ...prevCourse,
      coursePaths: data.coordinates,
      locationInfo: data.locationInfo,
      startLocation: data.startLocation,
      centerLocation: data.centerLocation,
    }));
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof Pick<Course, "thumbnail" | "thumbnailNeon" | "thumbnailLong">) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const storageRef = ref(
          storage,
          `thumbnails/${file.name}-${Date.now()}`
        );
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);

        setCourse((prevCourse) => ({
          ...prevCourse,
          [field]: downloadUrl,
        }));
      } catch (error) {
        console.error("Error uploading thumbnail:", error);
      }
    }
  };

  const addHotSpot = () => {
    setCourse({
      ...course,
      hotSpots: [
        ...course.hotSpots,
        {
          id: "",
          title: "",
          spotDescription: "",
          location: { longitude: 0, latitude: 0 },
        },
      ],
    });
  };

  const handleChipChange = (field: "level" | "alley", value: string) => {
    setCourse((prevCourse) => ({
      ...prevCourse,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const finalHotSpots = course.hotSpots.every(
        (spot) =>
          !spot.title &&
          !spot.spotDescription &&
          (!spot.location.latitude || !spot.location.longitude)
      )
        ? []
        : course.hotSpots;

      const courseData = {
        ...course,
        courseDuration: Number(course.courseDuration),
        courseLength: Number(course.courseLength),
        hotSpots: finalHotSpots,
      };

      if (isEditMode) {
        await updateDoc(doc(db, "allGPSArtCourses", id), courseData);
        console.log("Course updated successfully");
      } else {
        const docRef = await addDoc(collection(db, "allGPSArtCourses"), courseData);
        await updateDoc(doc(db, "allGPSArtCourses", docRef.id), { id: docRef.id });
        console.log("Course added successfully");
      }
      
      alert(isEditMode ? "코스가 성공적으로 업데이트되었습니다." : "코스가 성공적으로 추가되었습니다.");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving course:", error);
      alert("코스 저장 중 오류가 발생했습니다: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  return (
    <Section>
      <h1>{isEditMode ? "코스 수정" : "새 코스 추가"}</h1>
      <Label>코스 이름</Label>
      <Input
        type="text"
        value={course.courseName}
        onChange={(e) => setCourse({ ...course, courseName: e.target.value })}
      />

      <Label>코스 길이 (km)</Label>
      <Input
        type="number"
        value={course.courseLength}
        onChange={(e) => setCourse({ ...course, courseLength: Number(e.target.value) })}
      />

      <Label>소요 시간 (분)</Label>
      <Input
        type="number"
        value={course.courseDuration}
        onChange={(e) =>
          setCourse({ ...course, courseDuration: Number(e.target.value) })
        }
      />

      <Label>코스 설명</Label>
      <TextArea
        value={course.description}
        onChange={(e) => setCourse({ ...course, description: e.target.value })}
      />

      <Label>난이도</Label>
      <ChipContainer>
        <Chip
          active={course.level === "easy"}
          onClick={() => handleChipChange("level", "easy")}
        >
          쉬움
        </Chip>
        <Chip
          active={course.level === "normal"}
          onClick={() => handleChipChange("level", "normal")}
        >
          보통
        </Chip>
        <Chip
          active={course.level === "hard"}
          onClick={() => handleChipChange("level", "hard")}
        >
          어려움
        </Chip>
      </ChipContainer>

      <Label>골목 유형</Label>
      <ChipContainer>
        <Chip
          active={course.alley === "none"}
          onClick={() => handleChipChange("alley", "none")}
        >
          없음
        </Chip>
        <Chip
          active={course.alley === "few"}
          onClick={() => handleChipChange("alley", "few")}
        >
          적음
        </Chip>
        <Chip
          active={course.alley === "lots"}
          onClick={() => handleChipChange("alley", "lots")}
        >
          많음
        </Chip>
      </ChipContainer>

      <Label>지역 정보</Label>
      <div>
        <p>
          <strong>이름:</strong> {course.locationInfo?.name || "N/A"}
        </p>
        <p>
          <strong>국가 코드:</strong>{" "}
          {course.locationInfo?.isoCountryCode || "N/A"}
        </p>
        <p>
          <strong>행정 구역:</strong>{" "}
          {course.locationInfo?.administrativeArea || "N/A"}
        </p>
        <p>
          <strong>하위 행정 구역:</strong>{" "}
          {course.locationInfo?.subAdministrativeArea || "N/A"}
        </p>
        <p>
          <strong>지역:</strong> {course.locationInfo?.locality || "N/A"}
        </p>
        <p>
          <strong>하위 지역:</strong>{" "}
          {course.locationInfo?.subLocality || "N/A"}
        </p>
        <p>
          <strong>도로:</strong>{" "}
          {course.locationInfo?.throughfare || "N/A"}
        </p>
        <p>
          <strong>하위 도로:</strong>{" "}
          {course.locationInfo?.subThroughfare || "N/A"}
        </p>
      </div>

      <Label>지역 표시 이름</Label>
      <Input
        type="text"
        value={course.regionDisplayName}
        onChange={(e) =>
          setCourse({ ...course, regionDisplayName: e.target.value })
        }
      />

      <Label>제작자</Label>
      <Input
        type="text"
        value={course.producer}
        onChange={(e) => setCourse({ ...course, producer: e.target.value })}
      />

      <Label>썸네일</Label>
      <ThumbnailContainer>
        <ThumbnailGroup>
          <Label>메인</Label>
          <FileInput
            type="file"
            onChange={(e) => handleThumbnailUpload(e, "thumbnail")}
            accept="image/*"
          />
          {course.thumbnail && (
            <ThumbnailPreview src={course.thumbnail} alt="메인 썸네일" />
          )}
        </ThumbnailGroup>

        <ThumbnailGroup>
          <Label>네온</Label>
          <FileInput
            type="file"
            onChange={(e) => handleThumbnailUpload(e, "thumbnailNeon")}
            accept="image/*"
          />
          {course.thumbnailNeon && (
            <ThumbnailPreview src={course.thumbnailNeon} alt="네온 썸네일" />
          )}
        </ThumbnailGroup>

        <ThumbnailGroup>
          <Label>롱</Label>
          <FileInput
            type="file"
            onChange={(e) => handleThumbnailUpload(e, "thumbnailLong")}
            accept="image/*"
          />
          {course.thumbnailLong && (
            <ThumbnailPreview src={course.thumbnailLong} alt="롱 썸네일" />
          )}
        </ThumbnailGroup>
      </ThumbnailContainer>

      <CourseFileUpload onFileProcessed={handleFileProcessed} />

      <Label>핫스팟</Label>
      {course.hotSpots?.map((spot, index) => (
        <div key={index}>
          <Label>제목</Label>
          <Input
            type="text"
            value={spot.title}
            onChange={(e) => {
              const newHotSpots = [...course.hotSpots];
              newHotSpots[index].title = e.target.value;
              setCourse({ ...course, hotSpots: newHotSpots });
            }}
          />

          <Label>설명</Label>
          <TextArea
            value={spot.spotDescription}
            onChange={(e) => {
              const newHotSpots = [...course.hotSpots];
              newHotSpots[index].spotDescription = e.target.value;
              setCourse({ ...course, hotSpots: newHotSpots });
            }}
          />

          <Label>위치 (경도, 위도)</Label>
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

      <Button onClick={addHotSpot}>핫스팟 추가</Button>
      <Button onClick={handleSubmit}>{isEditMode ? "코스 수정" : "코스 추가"}</Button>
    </Section>
  );
};

export default CourseForm; 