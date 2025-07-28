// import axios from "axios";

// // Changed baseURL to cover all /api routes, assuming your auth routes are under /api/auth
// export const axiosInstance = axios.create({
//   baseURL: `http://localhost:5000/api/v1`,
//   // baseURL: `https://evanforumbend.degefagomora.com/api/v1`,
// });


import axios from "axios";

// Get the API base URL from the environment variable.
// In Vite, environment variables are accessed via import.meta.env
// and need to be prefixed with VITE_.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Optional: Add a check for debugging or robustness
if (!API_BASE_URL) {
  console.error("VITE_API_BASE_URL is not defined. Please check your frontend .env files.");
  // Depending on your preference, you could throw an error,
  // or set a default/fallback URL here for testing.
}

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  // You can also add other default configurations here, like headers or timeouts
  // timeout: 5000, // Example: 5 second timeout
  // headers: {
  //   'Content-Type': 'application/json',
  //   'Accept': 'application/json',
  // },
});

// Optional: Add request interceptors if you have tokens (like JWT)
// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token'); // Or wherever you store your token
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     console.log("Axios Request URL:", config.baseURL + config.url);
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Optional: Add response interceptors for global error handling, etc.
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       // Handle unauthorized errors, e.g., redirect to login
//       console.error("Unauthorized request, redirecting to login...");
//       // window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );