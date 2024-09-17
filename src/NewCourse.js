import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./index";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from "axios";
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

const ChipContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const Chip = styled.button`
  padding: 10px;
  font-size: 14px;
  border-radius: 20px;
  border: ${(props) => (props.active ? "2px solid #007bff" : "1px solid #ccc")};
  background-color: ${(props) => (props.active ? "#007bff" : "transparent")};
  color: ${(props) => (props.active ? "#fff" : "#000")};
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

async function reverseGeocode(coordinate) {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY; // Replace with your Google Maps API key
  const { latitude, longitude } = coordinate;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.results.length > 0) {
      const address = response.data.results[0].address_components;

      return {
        name: response.data.results[0].formatted_address,
        isoCountryCode:
          address.find((comp) => comp.types.includes("country")).short_name ||
          "",
        administrativeArea:
          address.find((comp) =>
            comp.types.includes("administrative_area_level_1")
          ).long_name || "",
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

function NewCourse() {
  const [course, setCourse] = useState({
    courseName: "",
    courseLength: "",
    courseDuration: "",
    description: "",
    regionDisplayName: "",
    producer: "",
    thumbnail: "",
    thumbnailNeon: "",
    thumbnailLong: "",
    coursePaths: [],
    locationInfo: null,
    level: "easy", // Default course level
    alley: "none", // Default alley type
    hotSpots: [
      {
        title: "",
        spotDescription: "",
        location: { longitude: "", latitude: "" },
      },
    ],
  });

  const [xmlFile, setXmlFile] = useState(null);
  const navigate = useNavigate();
  const storage = getStorage();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith(".kml")) {
      setXmlFile(file);

      try {
        const coordinates = await parseKMLFile(file);

        if (coordinates.length > 0) {
          const locationData = await reverseGeocode(coordinates[0]);

          if (locationData) {
            setCourse((prevCourse) => ({
              ...prevCourse,
              coursePaths: coordinates,
              locationInfo: locationData, // locationInfo 업데이트
            }));
            console.log("Location info:", locationData); // locationInfo 확인
          }
        }
      } catch (error) {
        console.error("Error parsing KML or fetching location info:", error);
      }
    }
  };

  const handleThumbnailUpload = async (e, field) => {
    const file = e.target.files[0];
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

        console.log(`Thumbnail uploaded and URL saved: ${downloadUrl}`);
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
          title: "",
          spotDescription: "",
          location: { longitude: "", latitude: "" },
        },
      ],
    });
  };

  const handleChipChange = (field, value) => {
    setCourse((prevCourse) => ({
      ...prevCourse,
      [field]: value,
    }));
  };

  const handleCreate = async () => {
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

      {/* Course Level */}
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

      {/* Alley Type */}
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

      <Button onClick={addHotSpot}>Add Another Hot Spot</Button>
      <Button onClick={handleCreate}>Create Course</Button>
    </Section>
  );
}

export default NewCourse;
