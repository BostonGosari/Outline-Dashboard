import { GPXParseResult } from "../types/index";
import { getLocationInfo } from "./geocoding";

export const parseGPXFile = (file: File): Promise<GPXParseResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parser = new DOMParser();
        const gpx = parser.parseFromString(e.target?.result as string, "text/xml");
        const coordinates = extractCoordinates(gpx);
        const bounds = calculateBounds(coordinates);
        const center = calculateCenter(bounds);
        
        // 시작점의 위치 정보 가져오기
        const startPoint = coordinates.length > 0 ? coordinates[0] : [0, 0];
        const locationInfo = await getLocationInfo(startPoint[1], startPoint[0]);
        
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

const extractCoordinates = (gpx: Document): number[][] => {
  const coordinates: number[][] = [];
  const trackPoints = gpx.getElementsByTagName("trkpt");
  
  for (let i = 0; i < trackPoints.length; i++) {
    const lat = parseFloat(trackPoints[i].getAttribute("lat") || "0");
    const lon = parseFloat(trackPoints[i].getAttribute("lon") || "0");
    coordinates.push([lon, lat]);
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