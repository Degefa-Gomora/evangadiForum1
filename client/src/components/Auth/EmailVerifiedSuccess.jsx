// src/components/Auth/EmailVerifiedSuccess.jsx
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
// If you're using react-toastify for notifications, make sure it's installed
// and configured in your App.js/main entry file.
// import { toast } from 'react-toastify';

const EmailVerifiedSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // To read query parameters from the URL

  useEffect(() => {
    // Get status and reason from URL query parameters (e.g., ?status=verification_failed&reason=expired)
    const status = searchParams.get("status");
    const reason = searchParams.get("reason");

    // Display a toast notification based on the status
    if (status === "verification_failed") {
      let errorMessage = "Email verification failed.";
      if (reason === "invalid")
        errorMessage =
          "Invalid or used verification link. Please register again or request a new link.";
      if (reason === "expired")
        errorMessage =
          "Verification link has expired. Please request a new one.";
      // Uncomment the line below if you use react-toastify
      // toast.error(errorMessage);
      console.error(errorMessage); // Fallback for console logging
    } else if (status === "already_verified") {
      // Uncomment the line below if you use react-toastify
      // toast.info("Your email is already verified. You can log in.");
      console.log("Email already verified.");
    } else if (status === "verification_error") {
      // Uncomment the line below if you use react-toastify
      // toast.error("An error occurred during verification. Please try again.");
      console.error("An error occurred during verification. Please try again.");
    } else {
      // Default success message if no specific status is provided or it's 'success'
      // Uncomment the line below if you use react-toastify
      // toast.success("Your email has been successfully verified! You can now log in.");
      console.log("Email verified successfully!");
    }

    // Automatically redirect to the authentication page after a few seconds
    const timer = setTimeout(() => {
      navigate("/auth"); // Redirect to your main authentication page (e.g., login/signup)
    }, 4000); // Redirect after 4 seconds

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, [navigate, searchParams]); // Dependencies for useEffect to re-run if these change

  return (
    <div
      style={{
        textAlign: "center",
        padding: "50px",
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          maxWidth: "500px",
          width: "90%",
        }}
      >
        <h2 style={{ color: "#0d6efd", marginBottom: "20px" }}>
          Email Verification Status
        </h2>
        <p style={{ fontSize: "1.1em", color: "#333" }}>
          {/* Display different messages based on status from query parameters */}
          {searchParams.get("status") === "verification_failed" ||
          searchParams.get("status") === "verification_error"
            ? "There was an issue verifying your email. You will be redirected shortly."
            : searchParams.get("status") === "already_verified"
            ? "Your email is already verified. You will be redirected shortly."
            : "Your email address has been successfully verified! You will be redirected to the login page shortly."}
        </p>
        <p style={{ fontSize: "0.9em", color: "#666", marginTop: "20px" }}>
          If you are not redirected, please click{" "}
          <a
            onClick={() => navigate("/auth")}
            style={{
              cursor: "pointer",
              color: "#0d6efd",
              textDecoration: "underline",
            }}
          >
            here
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default EmailVerifiedSuccess;
