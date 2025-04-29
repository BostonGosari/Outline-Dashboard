import React from 'react';
import styled from 'styled-components';
import { parseKMLFile } from '../utils/kmlParser';
import { parseGPXFile } from '../utils/gpxParser';
import { getLocationInfo } from '../utils/geocoding';
import { LocationInfo } from '../types';

const FileInput = styled.input`
  margin-top: 5px;
  padding: 8px;
  font-size: 16px;
`;

const Label = styled.label`
  margin-top: 10px;
  font-weight: bold;
`;

interface CourseFileUploadProps {
  onFileProcessed: (data: {
    coordinates: { latitude: number; longitude: number }[];
    locationInfo: LocationInfo;
    startLocation: { latitude: number; longitude: number };
    centerLocation: { latitude: number; longitude: number };
  }) => void;
}

const CourseFileUpload: React.FC<CourseFileUploadProps> = ({ onFileProcessed }) => {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let result;
      if (file.name.endsWith('.kml')) {
        result = await parseKMLFile(file);
      } else if (file.name.endsWith('.gpx')) {
        result = await parseGPXFile(file);
      } else {
        throw new Error('지원하지 않는 파일 형식입니다. KML 또는 GPX 파일만 업로드 가능합니다.');
      }
      
      // 좌표 형식 변환
      const convertedPaths = result.coordinates.map(([longitude, latitude]) => ({
        latitude,
        longitude
      }));
      
      // 시작 위치와 중심 위치 설정
      const startLocation = convertedPaths.length > 0 ? convertedPaths[0] : { latitude: 0, longitude: 0 };
      const centerLocation = result.center;

      // 시작점의 위치 정보 가져오기
      let locationInfo: LocationInfo;
      try {
        locationInfo = await getLocationInfo(startLocation.latitude, startLocation.longitude);
      } catch (error) {
        console.error('시작점 위치 정보를 가져오는데 실패했습니다:', error);
        locationInfo = {
          name: '',
          isoCountryCode: '',
          administrativeArea: '',
          subAdministrativeArea: '',
          locality: '',
          subLocality: '',
          throughfare: '',
          subThroughfare: '',
        };
      }
      
      onFileProcessed({
        coordinates: convertedPaths,
        locationInfo,
        startLocation,
        centerLocation,
      });
    } catch (error) {
      console.error("Error parsing file or fetching location info:", error);
      alert(error instanceof Error ? error.message : '파일 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div>
      <Label>Course Paths (Upload KML or GPX)</Label>
      <FileInput type="file" onChange={handleFileUpload} accept=".kml,.gpx" />
    </div>
  );
};

export default CourseFileUpload; 