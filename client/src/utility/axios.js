import axios from "axios";

// Changed baseURL to cover all /api routes, assuming your auth routes are under /api/auth
export const axiosInstance = axios.create({
  // baseURL: `http://localhost:5000/api/v1`,
  baseURL: `https://evanforumbend.degefagomora.com/api/v1`,
});
