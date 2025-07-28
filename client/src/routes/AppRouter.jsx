import { Routes, Route } from "react-router-dom";
import Terms from "../components/Footer/Terms.jsx";
import QuestionAndAnswer from "../Pages/QuestionAndAnswer/QuestionAndAnswer.jsx";
import AskQuestion from "../Pages/Question/AskQuestion/AskQuestion.jsx";
import ForgotPassword from "../Pages/ForgotPassword/ForgotPassword.jsx";
import PageNotFound from "../Pages/PageNotFound/PageNotFound.jsx";
import PrivacyPolicy from "../Pages/PrivacyPolicy/PrivacyPolicy.jsx";
import Home from "../Pages/Home/Home.jsx";
import AuthLayout from "../Pages/AuthLayout/AuthLayout.jsx";
import HowItWorks from "../Pages/HowItWorks/HowItWorks.jsx";
import Chatbot from "../components/Chatbot/Chatbot.jsx";
import PrivateRoute from "./PrivateRoute.jsx"; // Import your PrivateRoute component
import PublicChatPage from "../Pages/PublicChatPage/PublicChatPage.jsx";
import UserProfile from "../Pages/UserProfile/UserProfile.jsx"; // Import UserProfile component
import ResetPassword from "../Pages/ForgotPassword/ResetPassword.jsx";
import EditQuestion from "../Pages/Question/AskQuestion/EditQuestion.jsx";


// Import the component that handles the actual verification call
import VerifyEmailPage from "../Pages/SignUp/VerifyEmail.jsx"; // <--- NEW COMPONENT for frontend verification logic
// (Rename your existing VerifyEmail.jsx to VerifyEmailPage.jsx or similar for clarity)

// Import the new EmailVerifiedSuccess component
import EmailVerifiedSuccess from "../components/Auth/EmailVerifiedSuccess.jsx"; // Assuming this path is correct

function AppRouter() {
  return (
    <Routes>
      {/* Public Routes (accessible without login) */}
      <Route path="/auth" element={<AuthLayout />} />
      <Route path="/howitworks" element={<HowItWorks />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
      <Route path="/public-chat" element={<PublicChatPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      {/* RE-ADD THIS ROUTE: This is where the email link from the backend leads */}
      {/* This component will then make an API call to your backend's /api/v1/user/verify-email/:token */}
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />{" "}
      {/* <--- RE-ADD THIS ROUTE */}
      {/* This route is for displaying the success message AFTER the verification API call is successful */}
      <Route
        path="/email-verified-success"
        element={<EmailVerifiedSuccess />}
      />
      {/* Protected Routes (require login) */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/ask" element={<AskQuestion />} />
        <Route path="/question/:questionId" element={<QuestionAndAnswer />} />
        <Route path="/edit-question/:id" element={<EditQuestion />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/profile/:userid" element={<UserProfile />} />
      </Route>
      {/* Catch-all route for any undefined paths (your 404 page) */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default AppRouter;
