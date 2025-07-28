// import { useContext, useEffect, useState } from "react";
// import styles from "./home.module.css";
// import { BsArrowRightSquareFill } from "react-icons/bs";
// import Questions from "../Question/Questions.jsx";
// import Layout from "../../Layout/Layout.jsx";
// import { Link } from "react-router-dom";
// import { UserState } from "../../App.jsx";

// function Home() {
//   const { user } = useContext(UserState);
//   const userName = String(user?.username);
//   console.log(userName);
//   const [greeting, setGreeting] = useState("");

//   useEffect(() => {
//     const hour = new Date().getHours();
//     if (hour >= 5 && hour < 12) {
//       setGreeting("Good Morning");
//     } else if (hour >= 12 && hour < 17) {
//       setGreeting("Good Afternoon");
//     } else if (hour >= 17 && hour < 21) {
//       setGreeting("Good Evening");
//     } else {
//       setGreeting("Good Evening");
//     }
//   }, []);

//   return (
//     <Layout>
//       <div className={styles.home_container}>
//         <div className={styles.ask_welcome_holder}>
//           <div className={styles.ask_question}>
//             <Link to="/ask" style={{ textDecoration: "none" }}>
//               <button className={styles.ask_btn}>
//                 <span>Question</span>
//                 <BsArrowRightSquareFill
//                   size={20}
//                   style={{ padding: "0 !important" }}
//                 />
//               </button>
//             </Link>
//           </div>
//           <div className={styles.welcome_msg}>
//             <p>
//               {greeting}{" "}
//               <span className={styles.userName}>
//                 {userName.charAt(0).toUpperCase() + userName.slice(1)}
//               </span>
//             </p>
//           </div>
//         </div>

//         <div className={styles.questions_list}>
//           <Questions />
//         </div>
//       </div>
//     </Layout>
//   );
// }

// export default Home;



import { useContext, useEffect, useState } from "react";
import styles from "./home.module.css";
import { BsArrowRightSquareFill } from "react-icons/bs";
import Questions from "../Question/Questions.jsx";
import Layout from "../../Layout/Layout.jsx";
import { Link } from "react-router-dom";
import { UserState } from "../../App.jsx";

function Home() {
  // Destructure 'user' and 'loadingUser' from the UserState context
  const { user, loadingUser } = useContext(UserState);

  // Safely determine userName. It will be an empty string if user is null/undefined
  // or if user.username is null/undefined.
  const userName = user?.username ? String(user.username) : "";

  console.log("Home: Current user state:", user);
  console.log("Home: Derived userName:", userName);

  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("Good Morning");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Good Afternoon");
    } else if (hour >= 17 && hour < 21) {
      setGreeting("Good Evening");
    } else {
      setGreeting("Good Evening"); // Default for late night/early morning
    }
  }, []);

  // --- IMPORTANT FIX START ---
  // Conditionally render the entire Home content based on `loadingUser`.
  // This ensures we don't try to render anything that might depend on `user`
  // before the user data is definitively loaded (or confirmed null).
  if (loadingUser) {
    return (
      <Layout>
        <div className={styles.home_container}>
          <div className={styles.ask_welcome_holder}>
            <p>Loading user data...</p> {/* Or a proper spinner/skeleton */}
          </div>
          <div className={styles.questions_list}>
            <Questions />{" "}
            {/* Questions component might also need loading handling */}
          </div>
        </div>
      </Layout>
    );
  }
  // --- IMPORTANT FIX END ---

  return (
    <Layout>
      <div className={styles.home_container}>
        <div className={styles.ask_welcome_holder}>
          <div className={styles.ask_question}>
            <Link to="/ask" style={{ textDecoration: "none" }}>
              <button className={styles.ask_btn}>
                <span>Question</span>
                <BsArrowRightSquareFill
                  size={20}
                  style={{ padding: "0 !important" }}
                />
              </button>
            </Link>
          </div>
          <div className={styles.welcome_msg}>
            {user ? ( // Only show greeting and username if user object exists
              <p>
                {greeting}{" "}
                <span className={styles.userName}>
                  {userName.charAt(0).toUpperCase() + userName.slice(1)}
                </span>
              </p>
            ) : (
              // Optionally show a generic welcome or login prompt if no user
              <p>Welcome to Evangadi Forum! Please log in to ask questions.</p>
            )}
          </div>
        </div>

        <div className={styles.questions_list}>
          <Questions />
        </div>
      </div>
    </Layout>
  );
}

export default Home;