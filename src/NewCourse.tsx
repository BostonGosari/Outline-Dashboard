import React, { useState, useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import { NewCourseState, HotSpot, LocationInfo, KMLParseResult } from "./types";
import { parseKMLFile } from "./utils/kmlParser";

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

interface ChipProps {
  active: boolean;
}

const Chip = styled.button<ChipProps>`
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

const FileInput = styled.input`
  display: none;
`;

const FileLabel = styled.label`
  display: inline-block;
  padding: 10px 20px;
  background-color: #f0f0f0;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 10px;

  &:hover {
    background-color: #e0e0e0;
  }
`;

const PreviewImage = styled.img`
  width: 200px;
  height: 200px;
  object-fit: cover;
  margin-bottom: 15px;
  border-radius: 5px;
`;

const FileInfo = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
`;

const initialState: NewCourseState = {
  courseName: "",
  courseLength: 0,
  courseDuration: 0,
  description: "",
  level: "normal",
  alley: "none",
  regionDisplayName: "",
  producer: "",
  thumbnail: "",
  thumbnailNeon: "",
  thumbnailLong: "",
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
  distance: 0,
  heading: 0,
  coursePaths: [],
  hotSpots: [],
  title: "",
  centerLocation: { latitude: 0, longitude: 0 },
  startLocation: { latitude: 0, longitude: 0 },
  navigation: [],
};

const NewCourse: React.FC = () => {
  const [course, setCourse] = useState<NewCourseState>(initialState);
  const [thumbnailFiles, setThumbnailFiles] = useState<(File | null)[]>([null, null, null]);
  const [thumbnailPreviews, setThumbnailPreviews] = useState<string[]>(["", "", ""]);
  const [kmlFile, setKmlFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const thumbnailInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];
  const kmlInputRef = useRef<HTMLInputElement>(null);

  const handleChipChange = (field: keyof NewCourseState, value: string) => {
    setCourse((prevCourse) => ({
      ...prevCourse,
      [field]: value,
    }));
  };

  const handleThumbnailChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFiles = [...thumbnailFiles];
      newFiles[index] = file;
      setThumbnailFiles(newFiles);

      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...thumbnailPreviews];
        newPreviews[index] = reader.result as string;
        setThumbnailPreviews(newPreviews);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKMLChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setKmlFile(file);
      try {
        const result = await parseKMLFile(file);
        console.log("KML 파싱 결과:", result);
        
        // 좌표 형식 변환
        const convertedPaths = result.coordinates.map(([longitude, latitude]) => ({
          latitude,
          longitude
        }));
        
        // 시작 위치와 중심 위치 설정
        const startLocation = convertedPaths.length > 0 ? convertedPaths[0] : { latitude: 0, longitude: 0 };
        const centerLocation = result.center;
        
        setCourse(prev => ({
          ...prev,
          locationInfo: result.locationInfo,
          coursePaths: convertedPaths,
          startLocation,
          centerLocation,
          distance: 0, // 거리는 나중에 계산
          heading: 0, // 방향은 나중에 계산
        }));
      } catch (error) {
        console.error("Error parsing KML file:", error);
        alert("KML 파일 파싱 중 오류가 발생했습니다.");
      }
    }
  };

  const uploadThumbnails = async (): Promise<string[]> => {
    const uploadPromises = thumbnailFiles.map(async (file, index) => {
      if (!file) return "";
      const storageRef = ref(storage, `thumbnails/${Date.now()}_${index}_${file.name}`);
      await uploadBytes(storageRef, file);
      return await getDownloadURL(storageRef);
    });

    return await Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    try {
      const [thumbnailUrl, thumbnailNeonUrl, thumbnailLongUrl] = await uploadThumbnails();
      const courseData = {
        ...course,
        thumbnail: thumbnailUrl,
        thumbnailNeon: thumbnailNeonUrl,
        thumbnailLong: thumbnailLongUrl,
      };
      const docRef = await addDoc(collection(db, "allGPSArtCourses"), courseData);
      console.log("Document written with ID: ", docRef.id);
      
      // 문서 생성 후 id 필드를 추가로 업데이트
      await updateDoc(doc(db, "allGPSArtCourses", docRef.id), {
        id: docRef.id
      });
      
      navigate("/dashboard");
    } catch (e) {
      console.error("Error adding document: ", e);
      alert("코스 추가 중 오류가 발생했습니다.");
    }
  };

  return (
    <Section>
      <h1>Add New Course</h1>

      <Label>Course Title</Label>
      <Input
        type="text"
        value={course.title}
        onChange={(e) => setCourse({ ...course, title: e.target.value })}
      />

      {[0, 1, 2].map((index) => (
        <div key={index}>
          <Label>
            {index === 0 ? "Main Thumbnail" : index === 1 ? "Neon Thumbnail" : "Long Thumbnail"}
          </Label>
          <FileLabel>
            Choose {index === 0 ? "Main" : index === 1 ? "Neon" : "Long"} Thumbnail
            <FileInput
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange(index)}
              ref={thumbnailInputRefs[index]}
            />
          </FileLabel>
          {thumbnailPreviews[index] && (
            <PreviewImage src={thumbnailPreviews[index]} alt={`Thumbnail ${index + 1} preview`} />
          )}
        </div>
      ))}

      <Label>KML File</Label>
      <FileLabel>
        Choose KML File
        <FileInput
          type="file"
          accept=".kml"
          onChange={handleKMLChange}
          ref={kmlInputRef}
        />
      </FileLabel>
      {kmlFile && <FileInfo>Selected file: {kmlFile.name}</FileInfo>}

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
          setCourse({ ...course, courseDuration: Number(e.target.value) })
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

      <Button onClick={handleSubmit}>Add Course</Button>
    </Section>
  );
};

export default NewCourse; 