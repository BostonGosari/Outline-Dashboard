import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "./firebase";
import axios from "axios";
import styled from "styled-components";
import { Course, LocationInfo } from "./types";
import { parseKMLFile } from "./utils/kmlParser";

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

interface ChipProps {
  active: boolean;
}

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

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface AddressComponent {
  short_name: string;
  long_name: string;
  types: string[];
}

async function reverseGeocode(coordinate: Coordinate): Promise<LocationInfo | null> {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const { latitude, longitude } = coordinate;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.results.length > 0) {
      const address = response.data.results[0].address_components as AddressComponent[];
      return {
        name: response.data.results[0].formatted_address,
        isoCountryCode:
          address.find((comp) => comp.types.includes("country"))?.short_name ||
          "",
        administrativeArea:
          address.find((comp) =>
            comp.types.includes("administrative_area_level_1")
          )?.long_name || "",
        subAdministrativeArea:
          address.find((comp) =>
            comp.types.includes("administrative_area_level_2")
          )?.long_name || "",
        locality:
          address.find((comp) => comp.types.includes("locality"))?.long_name ||
          "",
        subLocality:
          address.find((comp) => comp.types.includes("sublocality"))
            ?.long_name || "",
        throughfare:
          address.find((comp) => comp.types.includes("route"))?.long_name || "",
        subThroughfare:
          address.find((comp) => comp.types.includes("street_number"))
            ?.long_name || "",
      };
    }
  } catch (error) {
    console.error("Error in reverse geocoding:", error);
  }

  return null;
}

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const storage = getStorage();
  const [course, setCourse] = useState<Course>({
    id: "",
    courseName: "",
    courseLength: 0,
    courseDuration: 0,
    description: "",
    title: "",
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
    elevation: 0,
    difficulty: "초급",
    estimatedTime: 0,
    startPoint: "",
    endPoint: "",
    terrain: "",
    bestSeason: ""
  });

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith(".kml")) {
      try {
        const result = await parseKMLFile(file);
        
        // 좌표 형식 변환
        const convertedPaths = result.coordinates.map(([longitude, latitude]) => ({
          latitude,
          longitude
        }));
        
        // 시작 위치와 중심 위치 설정
        const startLocation = convertedPaths.length > 0 ? convertedPaths[0] : { latitude: 0, longitude: 0 };
        const centerLocation = result.center;
        
        setCourse((prevCourse) => ({
          ...prevCourse,
          coursePaths: convertedPaths,
          locationInfo: result.locationInfo,
          startLocation,
          centerLocation,
        }));
      } catch (error) {
        console.error("Error parsing KML or fetching location info:", error);
      }
    }
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

  const handleUpdate = async () => {
    if (!id) {
      console.error("Course ID is missing");
      alert("코스 ID가 없습니다. 다시 시도해주세요.");
      return;
    }

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

      console.log("Updating course with data:", courseData);
      await updateDoc(doc(db, "allGPSArtCourses", id), courseData);
      console.log("Course updated successfully");
      alert("코스가 성공적으로 업데이트되었습니다.");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating course:", error);
      alert("코스 업데이트 중 오류가 발생했습니다: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  return (
    <Section>
      <h1>Edit Course</h1>

      <Label>Course Title</Label>
      <Input
        type="text"
        value={course.title}
        onChange={(e) => setCourse({ ...course, title: e.target.value })}
      />

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
        onChange={(e) => setCourse({ ...course, courseLength: Number(e.target.value) })}
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

      <Label>Location Information</Label>
      <div>
        <p>
          <strong>Name:</strong> {course.locationInfo?.name || "N/A"}
        </p>
        <p>
          <strong>ISO Country Code:</strong>{" "}
          {course.locationInfo?.isoCountryCode || "N/A"}
        </p>
        <p>
          <strong>Administrative Area:</strong>{" "}
          {course.locationInfo?.administrativeArea || "N/A"}
        </p>
        <p>
          <strong>Sub-Administrative Area:</strong>{" "}
          {course.locationInfo?.subAdministrativeArea || "N/A"}
        </p>
        <p>
          <strong>Locality:</strong> {course.locationInfo?.locality || "N/A"}
        </p>
        <p>
          <strong>Sub-Locality:</strong>{" "}
          {course.locationInfo?.subLocality || "N/A"}
        </p>
        <p>
          <strong>Throughfare:</strong>{" "}
          {course.locationInfo?.throughfare || "N/A"}
        </p>
        <p>
          <strong>Sub-Throughfare:</strong>{" "}
          {course.locationInfo?.subThroughfare || "N/A"}
        </p>
      </div>

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

      <Label>Course Paths (Upload XML)</Label>
      <FileInput type="file" onChange={handleFileUpload} accept=".kml" />

      <Label>Hot Spots</Label>
      {course.hotSpots?.map((spot, index) => (
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

      <Button onClick={addHotSpot}>Add Another Hot Spot</Button>
      <Button onClick={handleUpdate}>Update Course</Button>
    </Section>
  );
};

export default CourseDetail; 