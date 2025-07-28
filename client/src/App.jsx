

// import { createContext, useEffect, useState } from "react";
// import "./App.css";
// import { axiosInstance } from "./utility/axios";
// import AppRouter from "./routes/AppRouter.jsx";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// // RE-ADD THIS IMPORT:
// import { BrowserRouter as Router } from "react-router-dom"; // <--- RE-ADD THIS LINE

// export const UserState = createContext();

// function App() {
//   const [user, setUser] = useState(null);
//   const [loadingUser, setLoadingUser] = useState(true);

//   const login = (userData, token) => {
//     localStorage.setItem("token", token);
//     localStorage.setItem("EV-Forum-user", JSON.stringify(userData));
//     setUser(userData);
//     axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
//     console.log(
//       "App.jsx: User logged in and token/user data saved to localStorage."
//     );
//   };

//   const logout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("EV-Forum-user");
//     setUser(null);
//     delete axiosInstance.defaults.headers.common["Authorization"];
//     console.log("App.jsx: User logged out and data cleared from localStorage.");
//   };

//   const refreshUserData = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setUser(null);
//         console.log("App.jsx: No token found for refreshing user data.");
//         return;
//       }

//       axiosInstance.defaults.headers.common[
//         "Authorization"
//       ] = `Bearer ${token}`;
//       const response = await axiosInstance.get("/user/check");
//       const userData = response.data.user;
//       console.log("App.jsx: Refreshed user data:", userData);
//       setUser(userData);
//       localStorage.setItem("EV-Forum-user", JSON.stringify(userData));
//     } catch (error) {
//       console.error("App.jsx: Error refreshing user data:", error);
//       console.error(
//         "App.jsx: Error response for refresh:",
//         error.response?.data
//       );
//       setUser(null);
//       localStorage.removeItem("token");
//       localStorage.removeItem("EV-Forum-user");
//       delete axiosInstance.defaults.headers.common["Authorization"];
//     }
//   };

//   const getUserData = async () => {
//     setLoadingUser(true);
//     try {
//       const token = localStorage.getItem("token");
//       console.log(
//         "App.jsx: Token from localStorage:",
//         token ? "Exists" : "Not found"
//       );

//       if (!token) {
//         console.log("App.jsx: No token found, setting user to null.");
//         setUser(null);
//         return;
//       }

//       axiosInstance.defaults.headers.common[
//         "Authorization"
//       ] = `Bearer ${token}`;
//       console.log("App.jsx: Making request to /user/check with token.");
//       const response = await axiosInstance.get("/user/check");
//       console.log(
//         "App.jsx: Full response data from /user/check:",
//         response.data
//       );

//       const userData = response.data.user;

//       if (userData) {
//         console.log("App.jsx: Extracted user data successfully:", userData);
//         setUser(userData);
//         localStorage.setItem("EV-Forum-user", JSON.stringify(userData));
//       } else {
//         console.warn(
//           "App.jsx: /user/check returned no user data despite a 200 OK. Clearing token."
//         );
//         setUser(null);
//         localStorage.removeItem("token");
//         localStorage.removeItem("EV-Forum-user");
//         delete axiosInstance.defaults.headers.common["Authorization"];
//       }
//     } catch (error) {
//       console.error("App.jsx: Error fetching user data:", error);
//       console.error(
//         "App.jsx: Error response details:",
//         error.response?.status,
//         error.response?.data
//       );
//       setUser(null);
//       localStorage.removeItem("token");
//       localStorage.removeItem("EV-Forum-user");
//       delete axiosInstance.defaults.headers.common["Authorization"];
//     } finally {
//       setLoadingUser(false);
//     }
//   };

//   useEffect(() => {
//     getUserData();
//   }, []);

//   if (loadingUser) {
//     return <div>Loading application...</div>;
//   }

//   return (
//     <UserState.Provider
//       value={{ user, setUser, login, logout, refreshUserData, loadingUser }}
//     >
//       {/* RE-ADD THE <Router> TAG HERE */}
//       <Router>
//         {" "}
//         {/* <--- ADD THIS LINE */}
//         <AppRouter />
//         <ToastContainer position="top-right" autoClose={3000} />
//       </Router>{" "}
//       {/* <--- ADD THIS LINE */}
//     </UserState.Provider>
//   );
// }

// export default App;


// App.jsx
import { createContext, useEffect, useState } from "react";
import "./App.css";
import { axiosInstance } from "./utility/axios";
import AppRouter from "./routes/AppRouter.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// 👇👇👇 REMOVE THIS LINE 👇👇👇
// import { BrowserRouter as Router } from "react-router-dom"; // REMOVE THIS IMPORT

export const UserState = createContext();

function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("EV-Forum-user", JSON.stringify(userData));
    setUser(userData);
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log(
      "App.jsx: User logged in and token/user data saved to localStorage."
    );
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("EV-Forum-user");
    setUser(null);
    delete axiosInstance.defaults.headers.common["Authorization"];
    console.log("App.jsx: User logged out and data cleared from localStorage.");
  };

  const refreshUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        console.log("App.jsx: No token found for refreshing user data.");
        return;
      }

      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
      const response = await axiosInstance.get("/user/check");
      const userData = response.data.user;
      console.log("App.jsx: Refreshed user data:", userData);
      setUser(userData);
      localStorage.setItem("EV-Forum-user", JSON.stringify(userData));
    } catch (error) {
      console.error("App.jsx: Error refreshing user data:", error);
      console.error(
        "App.jsx: Error response for refresh:",
        error.response?.data
      );
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("EV-Forum-user");
      delete axiosInstance.defaults.headers.common["Authorization"];
    }
  };

  const getUserData = async () => {
    setLoadingUser(true);
    try {
      const token = localStorage.getItem("token");
      console.log(
        "App.jsx: Token from localStorage:",
        token ? "Exists" : "Not found"
      );

      if (!token) {
        console.log("App.jsx: No token found, setting user to null.");
        setUser(null);
        return;
      }

      axiosInstance.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
      console.log("App.jsx: Making request to /user/check with token.");
      const response = await axiosInstance.get("/user/check");
      console.log(
        "App.jsx: Full response data from /user/check:",
        response.data
      );

      const userData = response.data.user;

      if (userData) {
        console.log("App.jsx: Extracted user data successfully:", userData);
        setUser(userData);
        localStorage.setItem("EV-Forum-user", JSON.stringify(userData));
      } else {
        console.warn(
          "App.jsx: /user/check returned no user data despite a 200 OK. Clearing token."
        );
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("EV-Forum-user");
        delete axiosInstance.defaults.headers.common["Authorization"];
      }
    } catch (error) {
      console.error("App.jsx: Error fetching user data:", error);
      console.error(
        "App.jsx: Error response details:",
        error.response?.status,
        error.response?.data
      );
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("EV-Forum-user");
      delete axiosInstance.defaults.headers.common["Authorization"];
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  if (loadingUser) {
    return <div>Loading application...</div>;
  }

  return (
    <UserState.Provider
      value={{ user, setUser, login, logout, refreshUserData, loadingUser }}
    >
      {/* 👇👇👇 REMOVE THIS TAG 👇👇👇 */}
      {/* <Router> */}
      <AppRouter />
      <ToastContainer position="top-right" autoClose={3000} />
      {/* 👆👆👆 REMOVE THIS TAG 👆👆👆 */}
      {/* </Router> */}
    </UserState.Provider>
  );
}

export default App;