// import { useContext } from "react";
// import { Link } from "react-router-dom";
// import { Navbar, Nav, Container } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";
// // Import Lucide React Icons for profile and logout
// import { UserCircle2, LogOut } from "lucide-react";

// import classes from "./header.module.css"; // Ensure this path is correct
// import EvangadiLogo from "../../Assets/Images/evangadi-logo-header.png";
// import { UserState } from "../../App.jsx";

// function Header() {
//   const { user } = useContext(UserState);
//   const userid = user?.userid;

//   // Debug logging for avatar
//   console.log("Header: Current user state:", user);
//   console.log("Header: Avatar URL:", user?.avatar_url);

//   const handleSignOut = () => {
//     localStorage.removeItem("token");
//     window.location.replace("/auth");
//   };

//   // Utility function to get user initial for avatar placeholder
//   const getUserInitial = (username) => {
//     return username ? username.charAt(0).toUpperCase() : "?";
//   };

//   return (
//     <Navbar
//       expand="md" // Collapses on medium and smaller screens
//       className={classes.navbar_custom}
//     >
//       <Container className={classes.header_container}>
//         {/* Brand Logo */}
//         <Navbar.Brand as={Link} to="/">
//           <img src={EvangadiLogo} alt="Evangadi Logo" width="200" />
//         </Navbar.Brand>

//         {/* Navbar Toggler for mobile */}
//         <Navbar.Toggle aria-controls="basic-navbar-nav">
//           <span className="navbar-toggler-icon"></span>
//         </Navbar.Toggle>

//         {/* Collapsible content (navigation links, logout, profile icon) */}
//         <Navbar.Collapse
//           id="basic-navbar-nav"
//           className={classes.navbar_collapse_custom}
//         >
//           <Nav className={classes.nav_links_holder}>
//             {/* Conditional Home Link */}
//             {userid && (
//               <Nav.Link as={Link} to="/" className={classes.navigation_links}>
//                 Home
//               </Nav.Link>
//             )}
//             {/* Conditional Chat Link */}
//             {userid && (
//               <Nav.Link
//                 as={Link}
//                 to="/public-chat"
//                 className={classes.navigation_links}
//               >
//                 Chat
//               </Nav.Link>
//             )}
//             {/* How it Works Link */}
//             <Nav.Link
//               as={Link}
//               to="/howitworks"
//               className={classes.navigation_links}
//             >
//               How it Works
//             </Nav.Link>

//             {/* Conditional rendering for authenticated vs. unauthenticated user */}
//             {userid ? (
//               // Authenticated user: Logout button and Profile Icon
//               <>
//                 <button onClick={handleSignOut} className={classes.logout_btn}>
//                   <LogOut size={18} className={classes.icon_space} /> Logout
//                 </button>
//                 <Nav.Link
//                   as={Link}
//                   to={`/profile/${userid}`}
//                   className={classes.profile_icon_link} // Styling for profile circle
//                   title={user?.username} // Tooltip for username
//                 >
//                   {user?.avatar_url ? (
//                     <img 
//                       src={user.avatar_url} 
//                       alt="Profile Picture" 
//                       className={classes.profile_picture}
//                     />
//                   ) : (
//                     <div className={classes.profile_picture_placeholder}>
//                       {getUserInitial(user?.username)}
//                     </div>
//                   )}
//                 </Nav.Link>
//               </>
//             ) : (
//               // Unauthenticated user: Login button
//               <Nav.Link
//                 as={Link}
//                 to="/auth"
//                 className={`${classes.navigation_links} ${classes.login_btn}`}
//               >
//                 Login
//               </Nav.Link>
//             )}
//           </Nav>
//         </Navbar.Collapse>
//       </Container>
//     </Navbar>
//   );
// }

// export default Header;



import { useContext } from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
// Import Lucide React Icons for profile and logout
import { UserCircle2, LogOut } from "lucide-react";

import classes from "./header.module.css"; // Ensure this path is correct
import EvangadiLogo from "../../Assets/Images/evangadi-logo-header.png";
import { UserState } from "../../App.jsx"; // Correct path assumed

function Header() {
  // Destructure 'user' AND 'loadingUser' from the UserState context
  const { user, loadingUser, logout } = useContext(UserState); // Also get logout function

  // The 'userid' should be derived from 'user' with optional chaining
  // It's already correctly done here: `const userid = user?.userid;`

  // Debug logging for avatar - these are fine
  console.log("Header: Current user state:", user);
  console.log("Header: Avatar URL:", user?.avatar_url);

  // Moved handleSignOut logic to use the logout function from context
  const handleSignOut = () => {
    logout(); // Call the logout function from App.jsx's context
    // No need for window.location.replace, as logout() should trigger a re-render
    // and potentially a redirect within AppRouter based on user state.
    // If you explicitly need a hard refresh, keep window.location.replace,
    // but the context update should handle it.
  };

  // Utility function to get user initial for avatar placeholder
  const getUserInitial = (username) => {
    return username ? username.charAt(0).toUpperCase() : "?";
  };

  // --- IMPORTANT FIX START ---
  // Conditionally render the header based on `loadingUser` state.
  // This prevents rendering components that might try to access `user`
  // before it's definitively `null` or a user object.
  if (loadingUser) {
    // You can return a minimalist header, a loading spinner, or null
    return (
      <Navbar expand="md" className={classes.navbar_custom}>
        <Container className={classes.header_container}>
          <Navbar.Brand as={Link} to="/">
            <img src={EvangadiLogo} alt="Evangadi Logo" width="200" />
          </Navbar.Brand>
          {/* Optionally show a loading indicator here */}
          <Nav className="ms-auto">
            <Nav.Link className={classes.navigation_links}>Loading...</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    );
  }
  // --- IMPORTANT FIX END ---

  // Now, 'user' is either a user object or definitively null,
  // and 'loadingUser' is false.

  return (
    <Navbar
      expand="md" // Collapses on medium and smaller screens
      className={classes.navbar_custom}
    >
      <Container className={classes.header_container}>
        {/* Brand Logo */}
        <Navbar.Brand as={Link} to="/">
          <img src={EvangadiLogo} alt="Evangadi Logo" width="200" />
        </Navbar.Brand>

        {/* Navbar Toggler for mobile */}
        <Navbar.Toggle aria-controls="basic-navbar-nav">
          <span className="navbar-toggler-icon"></span>
        </Navbar.Toggle>

        {/* Collapsible content (navigation links, logout, profile icon) */}
        <Navbar.Collapse
          id="basic-navbar-nav"
          className={classes.navbar_collapse_custom}
        >
          <Nav className={classes.nav_links_holder}>
            {/* Conditional Home Link */}
            {user && ( // Use `user` directly for clarity
              <Nav.Link as={Link} to="/" className={classes.navigation_links}>
                Home
              </Nav.Link>
            )}
            {/* Conditional Chat Link */}
            {user && ( // Use `user` directly for clarity
              <Nav.Link
                as={Link}
                to="/public-chat"
                className={classes.navigation_links}
              >
                Chat
              </Nav.Link>
            )}
            {/* How it Works Link */}
            <Nav.Link
              as={Link}
              to="/howitworks"
              className={classes.navigation_links}
            >
              How it Works
            </Nav.Link>

            {/* Conditional rendering for authenticated vs. unauthenticated user */}
            {user ? ( // Use `user` directly for clarity
              // Authenticated user: Logout button and Profile Icon
              <>
                <button onClick={handleSignOut} className={classes.logout_btn}>
                  <LogOut size={18} className={classes.icon_space} /> Logout
                </button>
                <Nav.Link
                  as={Link}
                  // The user object should have userid by now if it's not null
                  to={`/profile/${user.userid}`} // Safe now, as we've checked `user` is not null
                  className={classes.profile_icon_link} // Styling for profile circle
                  title={user?.username} // Tooltip for username - safe with optional chaining
                >
                  {user?.avatar_url ? ( // Safe with optional chaining
                    <img
                      src={user.avatar_url}
                      alt="Profile Picture"
                      className={classes.profile_picture}
                    />
                  ) : (
                    <div className={classes.profile_picture_placeholder}>
                      {getUserInitial(user?.username)}{" "}
                      {/* Safe with optional chaining */}
                    </div>
                  )}
                </Nav.Link>
              </>
            ) : (
              // Unauthenticated user: Login button
              <Nav.Link
                as={Link}
                to="/auth"
                className={`${classes.navigation_links} ${classes.login_btn}`}
              >
                Login
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;