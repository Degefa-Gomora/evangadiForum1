// import styles from "./questionCard.module.css";
// import { MdAccountCircle } from "react-icons/md";
// import { FaChevronRight } from "react-icons/fa6";
// import { Link, useNavigate } from "react-router-dom";
// import moment from 'moment';
// import { LuCalendarClock } from "react-icons/lu";
// import { useContext } from "react";
// import { UserState } from "../../App.jsx";
// import Swal from "sweetalert2";
// import { axiosInstance } from "../../utility/axios";

// function QuestionCard({ id, userName, questionTitle, description, question_date, ownerId }) {
//   const formattedDate = moment(question_date).format('ddd, MMM DD, YYYY h:mm A').toUpperCase();
//   const { user } = useContext(UserState);
//   const navigate = useNavigate();
//   const isOwner = user && user.userid === ownerId;

//   // Debug logs
//   console.log("[QuestionCard Debug] user:", user);
//   console.log("[QuestionCard Debug] ownerId:", ownerId);
//   console.log("[QuestionCard Debug] isOwner:", isOwner);

//   // Delete handler
//   const handleDelete = async (e) => {
//     e.preventDefault(); // Prevent link navigation
//     const token = localStorage.getItem("token");
//     if (!token) {
//       Swal.fire({
//         title: "Authentication Required",
//         text: "You must be logged in to delete a question.",
//         icon: "warning",
//         timer: 2000,
//         timerProgressBar: true,
//         showConfirmButton: false,
//       });
//       return;
//     }
//     // Step 1: Ask backend for confirmation message
//     try {
//       const res = await axiosInstance.delete(`/question/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (res.data.confirm) {
//         // Step 2: Show confirmation dialog
//         const result = await Swal.fire({
//           title: "Delete Question?",
//           text: res.data.message,
//           icon: "warning",
//           showCancelButton: true,
//           confirmButtonText: "Yes, delete it!",
//           cancelButtonText: "No, cancel",
//         });
//         if (result.isConfirmed) {
//           // Step 3: Actually delete
//           const delRes = await axiosInstance.post(`/question/${id}/confirm-delete`, {}, {
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           if (delRes.status === 200) {
//             Swal.fire({
//               icon: "success",
//               title: "Deleted!",
//               text: "Your question has been deleted.",
//               timer: 2000,
//               timerProgressBar: true,
//               showConfirmButton: false,
//             });
//             window.location.reload(); // Reload to update list
//           } else {
//             Swal.fire({
//               icon: "error",
//               title: "Error",
//               text: "Failed to delete question. Please try again.",
//               timer: 2000,
//               timerProgressBar: true,
//               showConfirmButton: false,
//             });
//           }
//         }
//       }
//     } catch (error) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: "Failed to delete question. Please try again.",
//         timer: 2000,
//         timerProgressBar: true,
//         showConfirmButton: false,
//       });
//     }
//   };

//   // Edit handler (simple version: redirect to AskQuestion with state, or you can use a modal)
//   const handleEdit = (e) => {
//     e.preventDefault();
//     navigate(`/edit-question/${id}`, { state: { id, questionTitle, description } });
//   };

//   return (
//     <div className={styles.question_holder}>
//       <Link
//         to={`/question/${id}`}
//         style={{
//           textDecoration: "none",
//           color: "black",
//           flex: 1,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//         }}
//       >
//         <div className={styles.requester_question_holder}>
//           <div className={styles.requester_holder}>
//             <MdAccountCircle size={50} />
//             <div>@{userName}</div>
//           </div>
//           <div className={styles.title_description_holder}>
//             <p className={styles.question_title}>{String(questionTitle).length > 100 ? String(questionTitle).substring(0, 100).concat(". . .") : questionTitle}</p>
//             <p className={styles.question_description}>{String(description).length > 300 ? String(description).substring(0, 300).concat(". . .") : description}</p>
//             <p className={styles.question_date}><LuCalendarClock style={{ marginRight: "5px" }} />{formattedDate}</p>
//           </div>
//         </div>
//         <div className={styles.question_arrow_holder}>
//           <FaChevronRight size={23} />
//         </div>
//       </Link>
//       {isOwner && (
//         <div className={styles.actionButtons}>
//           <button onClick={handleEdit} style={{ background: "#0c4df163", border: "none", borderRadius: 5, padding: "6px 12px", cursor: "pointer" }}>Edit</button>
//           <button onClick={handleDelete} style={{ background: "#ff4d4f", color: "white", border: "none", borderRadius: 5, padding: "6px 12px", cursor: "pointer" }}>Delete</button>
//         </div>
//       )}
//     </div>
//   );
// }

// export default QuestionCard;


import styles from "./questionCard.module.css";
import { MdAccountCircle } from "react-icons/md";
import { FaChevronRight } from "react-icons/fa6";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import { LuCalendarClock } from "react-icons/lu";
import { useContext } from "react";
import { UserState } from "../../App.jsx"; // Path assumed correct
import Swal from "sweetalert2";
import { axiosInstance } from "../../utility/axios";

function QuestionCard({
  id,
  userName,
  questionTitle,
  description,
  question_date,
  ownerId,
}) {
  const formattedDate = moment(question_date)
    .format("ddd, MMM DD, YYYY h:mm A")
    .toUpperCase();

  // Destructure 'user' and 'loadingUser' from the UserState context
  // 'loadingUser' might not be directly used here for rendering,
  // but good to be aware of if you ever add conditional UI based on loading status.
  const { user, loadingUser } = useContext(UserState);

  const navigate = useNavigate();

  // This line is already safe due to JavaScript's short-circuiting:
  // If `user` is `null` or `undefined`, `user.userid` will not be accessed.
  const isOwner = user && user.userid === ownerId;

  // Debug logs - These are fine and helpful
  console.log("[QuestionCard Debug] user:", user);
  console.log("[QuestionCard Debug] ownerId:", ownerId);
  console.log("[QuestionCard Debug] isOwner:", isOwner);

  // Delete handler
  const handleDelete = async (e) => {
    e.preventDefault(); // Prevent link navigation
    const token = localStorage.getItem("token"); // Get token from localStorage

    // This authentication check is good.
    if (!token) {
      Swal.fire({
        title: "Authentication Required",
        text: "You must be logged in to delete a question.",
        icon: "warning",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    // You might want to add a check here to ensure only the owner can trigger this.
    // While the backend should enforce it, the UI should also reflect it.
    // If you always render the delete button (e.g., you remove the {isOwner &&} below)
    // then this check becomes even more critical for user experience.
    if (!isOwner) {
      // Added explicit check
      Swal.fire({
        title: "Unauthorized",
        text: "You can only delete your own questions.",
        icon: "error",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }

    // Step 1: Ask backend for confirmation message
    try {
      // Your current implementation sends an initial DELETE request to get a confirmation message.
      // This is an unusual pattern for delete confirmation but acceptable if your backend is designed this way.
      // Typically, you'd show a frontend confirmation (Swal.fire) FIRST, then send the delete request.
      const res = await axiosInstance.delete(`/question/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assuming res.data.confirm is true when the backend wants a second confirmation
      if (res.data.confirm) {
        // Step 2: Show confirmation dialog
        const result = await Swal.fire({
          title: "Delete Question?",
          text:
            res.data.message ||
            "Are you sure you want to delete this question? This action cannot be undone.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "No, cancel",
        });

        if (result.isConfirmed) {
          // Step 3: Actually delete (sending a POST to confirm-delete)
          const delRes = await axiosInstance.post(
            `/question/${id}/confirm-delete`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (delRes.status === 200) {
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: "Your question has been deleted.",
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false,
            });
            window.location.reload(); // Reload to update list (consider more react-friendly state updates for a smoother UX)
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Failed to delete question. Please try again.",
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false,
            });
          }
        }
      } else {
        // If backend indicates no confirmation needed, or provides a direct message
        Swal.fire({
          icon: res.data.success ? "success" : "error",
          title: res.data.success ? "Success" : "Error",
          text: res.data.message,
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });
        if (res.data.success) {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("Error during delete process:", error);
      let errorMessage = "Failed to delete question. Please try again.";
      if (error.response && error.response.data && error.response.data.Msg) {
        errorMessage = error.response.data.Msg;
      }
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    }
  };

  // Edit handler (simple version: redirect to AskQuestion with state, or you can use a modal)
  const handleEdit = (e) => {
    e.preventDefault();
    if (!isOwner) {
      // Added explicit check
      Swal.fire({
        title: "Unauthorized",
        text: "You can only edit your own questions.",
        icon: "error",
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      return;
    }
    navigate(`/edit-question/${id}`, {
      state: { id, questionTitle, description },
    });
  };

  // Optional: Render nothing or a skeleton if still loading user data
  // This might be redundant if the parent component already handles loading state,
  // but it ensures QuestionCard doesn't try to render before user state is finalized.
  if (loadingUser) {
    return (
      <div className={styles.question_holder} style={{ opacity: 0.5 }}>
        <p>Loading question...</p>
      </div>
    );
  }

  return (
    <div className={styles.question_holder}>
      <Link
        to={`/question/${id}`}
        style={{
          textDecoration: "none",
          color: "black",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className={styles.requester_question_holder}>
          <div className={styles.requester_holder}>
            <MdAccountCircle size={50} />
            <div>@{userName}</div>{" "}
            {/* userName is a prop, not from `user` state */}
          </div>
          <div className={styles.title_description_holder}>
            <p className={styles.question_title}>
              {String(questionTitle).length > 100
                ? String(questionTitle).substring(0, 100).concat(". . .")
                : questionTitle}
            </p>
            <p className={styles.question_description}>
              {String(description).length > 300
                ? String(description).substring(0, 300).concat(". . .")
                : description}
            </p>
            <p className={styles.question_date}>
              <LuCalendarClock style={{ marginRight: "5px" }} />
              {formattedDate}
            </p>
          </div>
        </div>
        <div className={styles.question_arrow_holder}>
          <FaChevronRight size={23} />
        </div>
      </Link>
      {/* This conditional rendering is already safe because `isOwner` is derived safely */}
      {isOwner && (
        <div className={styles.actionButtons}>
          <button
            onClick={handleEdit}
            style={{
              background: "#0c4df163",
              border: "none",
              borderRadius: 5,
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            style={{
              background: "#ff4d4f",
              color: "white",
              border: "none",
              borderRadius: 5,
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default QuestionCard;