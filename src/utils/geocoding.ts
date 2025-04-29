import { LocationInfo } from "../types/index";
import axios from "axios";

export const getLocationInfo = async (latitude: number, longitude: number): Promise<LocationInfo> => {
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