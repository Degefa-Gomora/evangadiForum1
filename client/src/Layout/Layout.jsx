// import React, { useState, useEffect, useRef, useContext } from "react";
// import Header from "../components/Header/Header.jsx";
// import Footer from "../components/Footer/Footer.jsx";
// import Chatbot from "../components/Chatbot/Chatbot.jsx";
// import { UserState } from "../App.jsx"; // Use UserState instead of AuthContext
// import classes from "./Layout.module.css";

// function Layout({ children }) {
//   const { user } = useContext(UserState); // Get user from UserState
//   const [showChatbot, setShowChatbot] = useState(false);
//   const [chatbotAnimating, setChatbotAnimating] = useState(false);

//   const chatbotRef = useRef(null);
//   const chatbotToggleButtonRef = useRef(null);

//   const toggleChatbotVisibility = () => {
//     if (!showChatbot) {
//       setShowChatbot(true);
//       setTimeout(() => setChatbotAnimating(true), 50);
//     } else {
//       setChatbotAnimating(false);
//       setTimeout(() => setShowChatbot(false), 300);
//     }
//   };

//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (
//         chatbotRef.current &&
//         !chatbotRef.current.contains(event.target) &&
//         chatbotToggleButtonRef.current &&
//         !chatbotToggleButtonRef.current.contains(event.target)
//       ) {
//         if (showChatbot) {
//           setChatbotAnimating(false);
//           setTimeout(() => setShowChatbot(false), 300);
//         }
//       }
//     }

//     if (showChatbot) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showChatbot]);

//   return (
//     <div>
//       <Header />
//       <div style={{ minHeight: "100vh" }}>{children}</div>

//       {user && ( // Show chatbot only when user is logged in
//         <>
//           <div
//             className={classes.chatbotToggleArea}
//             onClick={toggleChatbotVisibility}
//             title={showChatbot ? "Hide Chatbot" : "Ask Chatbot"}
//             ref={chatbotToggleButtonRef}
//           >
//             <span className={classes.askChatbotText}>Ask Chatbot</span>
//             <span className={classes.chatbotIcon}>🤖</span>
//           </div>

//           {showChatbot && (
//             <div
//               className={`${classes.chatbotColumn} ${
//                 chatbotAnimating ? classes.fadeIn : classes.fadeOut
//               }`}
//               ref={chatbotRef}
//             >
//               <Chatbot />
//             </div>
//           )}
//         </>
//       )}

//       <Footer />
//     </div>
//   );
// }

// export default Layout;


import React, { useState, useEffect, useRef, useContext } from "react";
import Header from "../components/Header/Header.jsx";
import Footer from "../components/Footer/Footer.jsx";
import Chatbot from "../components/Chatbot/Chatbot.jsx";
import { UserState } from "../App.jsx"; // Use UserState instead of AuthContext
import classes from "./Layout.module.css";

function Layout({ children }) {
  // Get user from UserState.
  // The conditional rendering '{user && (...)}' for the chatbot is safe.
  const { user } = useContext(UserState);

  const [showChatbot, setShowChatbot] = useState(false);
  const [chatbotAnimating, setChatbotAnimating] = useState(false);

  const chatbotRef = useRef(null);
  const chatbotToggleButtonRef = useRef(null);

  const toggleChatbotVisibility = () => {
    if (!showChatbot) {
      setShowChatbot(true);
      // Small delay to allow CSS transition to start from initial state
      setTimeout(() => setChatbotAnimating(true), 50);
    } else {
      setChatbotAnimating(false);
      // Short delay to allow fadeOut animation to complete before unmounting
      setTimeout(() => setShowChatbot(false), 300);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        chatbotRef.current &&
        !chatbotRef.current.contains(event.target) &&
        chatbotToggleButtonRef.current &&
        !chatbotToggleButtonRef.current.contains(event.target)
      ) {
        if (showChatbot) {
          setChatbotAnimating(false);
          setTimeout(() => setShowChatbot(false), 300);
        }
      }
    }

    if (showChatbot) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showChatbot]); // Dependency array: re-run if showChatbot changes

  return (
    <div>
      {/* Header component will handle its own loading/user-null state now */}
      <Header />

      {/* Main content area */}
      <div style={{ minHeight: "100vh" }}>{children}</div>

      {/* Show chatbot components only when user is logged in. 
          This conditional rendering is safe: if `user` is null, the block won't render. */}
      {user && (
        <>
          <div
            className={classes.chatbotToggleArea}
            onClick={toggleChatbotVisibility}
            title={showChatbot ? "Hide Chatbot" : "Ask Chatbot"}
            ref={chatbotToggleButtonRef}
          >
            <span className={classes.askChatbotText}>Ask Chatbot</span>
            <span className={classes.chatbotIcon}>🤖</span>
          </div>

          {showChatbot && (
            <div
              className={`${classes.chatbotColumn} ${
                chatbotAnimating ? classes.fadeIn : classes.fadeOut
              }`}
              ref={chatbotRef}
            >
              <Chatbot />
            </div>
          )}
        </>
      )}

      <Footer />
    </div>
  );
}

export default Layout;