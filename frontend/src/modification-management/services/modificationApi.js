import axios from "axios";

const API_URL = "http://localhost:5000/api/modifications";

export const createModification = async (formData) => {
  const response = await axios.post(API_URL, formData, {
    withCredentials: false,
  });
  return response.data;
};