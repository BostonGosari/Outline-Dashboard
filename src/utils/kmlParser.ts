import { KMLParseResult, LocationInfo } from "../types";
import axios from "axios";

const getLocationInfo = async (latitude: number, longitude: number): Promise<LocationInfo> => {
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.results.length > 0) {
      const address = response.data.results[0].address_components;
      return {
        name: response.data.results[0].formatted_address,
        isoCountryCode: address.find((comp: any) => comp.types.includes("country"))?.short_name || "",
        administrativeArea: address.find((comp: any) => comp.types.includes("administrative_area_level_1"))?.long_name || "",
        subAdministrativeArea: address.find((comp: any) => comp.types.includes("administrative_area_level_2"))?.long_name || "",
        locality: address.find((comp: any) => comp.types.includes("locality"))?.long_name || "",
        subLocality: address.find((comp: any) => comp.types.includes("sublocality"))?.long_name || "",
        throughfare: address.find((comp: any) => comp.types.includes("route"))?.long_name || "",
        subThroughfare: address.find((comp: any) => comp.types.includes("street_number"))?.long_name || "",
      };
    }
  } catch (error) {
    console.error("Error in reverse geocoding:", error);
  }

  return {
    name: "",
    isoCountryCode: "",
    administrativeArea: "",
    subAdministrativeArea: "",
    locality: "",
    subLocality: "",
    throughfare: "",
    subThroughfare: "",
  };
};

export const parseKMLFile = (file: File): Promise<KMLParseResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parser = new DOMParser();
        const kml = parser.parseFromString(e.target?.result as string, "text/xml");
        const coordinates = extractCoordinates(kml);
        const bounds = calculateBounds(coordinates);
        const center = calculateCenter(bounds);
        const locationInfo = await getLocationInfo(center.latitude, center.longitude);
        
        resolve({
          coordinates,
          bounds,
          center,
          locationInfo
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};

const extractCoordinates = (kml: Document): number[][] => {
  const coordinates: number[][] = [];
  const coordinatesElements = kml.getElementsByTagName("coordinates");
  
  for (let i = 0; i < coordinatesElements.length; i++) {
    const coordText = coordinatesElements[i].textContent;
    if (coordText) {
      const points = coordText.trim().split(/\s+/);
      points.forEach(point => {
        const [lon, lat] = point.split(",").map(Number);
        if (!isNaN(lon) && !isNaN(lat)) {
          coordinates.push([lon, lat]);
        }
      });
    }
  }
  
  return coordinates;
};

const calculateBounds = (coordinates: number[][]): {
  north: number;
  south: number;
  east: number;
  west: number;
} => {
  if (coordinates.length === 0) {
    return { north: 0, south: 0, east: 0, west: 0 };
  }

  let north = -90;
  let south = 90;
  let east = -180;
  let west = 180;

  coordinates.forEach(([lon, lat]) => {
    north = Math.max(north, lat);
    south = Math.min(south, lat);
    east = Math.max(east, lon);
    west = Math.min(west, lon);
  });

  return { north, south, east, west };
};

const calculateCenter = (bounds: {
  north: number;
  south: number;
  east: number;
  west: number;
}): { latitude: number; longitude: number } => {
  return {
    latitude: (bounds.north + bounds.south) / 2,
    longitude: (bounds.east + bounds.west) / 2
  };
}; 