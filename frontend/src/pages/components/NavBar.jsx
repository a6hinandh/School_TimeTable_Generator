// NavBar.jsx (unchanged)
import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-react";
import { Outlet, useNavigate } from "react-router";
import { BookOpen, Menu, X } from "lucide-react";
import { useState } from "react";

function NavBar() {
  const navigate = useNavigate();
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container" style={{display:"flex", justifyContent:"space-between"}}>
          <div className="navbar-left">
            <div className="navbar-brand" onClick={() => navigate("/")}>
              <BookOpen size={28} className="brand-icon" />
              <span className="brand-text">TimeTable Generator</span>
            </div>
            {isSignedIn ? (
              <button
                className="nav-link dashboard-link"
                onClick={() => navigate(isSignedIn ? "/dashboard" : "/login")}
              >
                Dashboard
              </button>
            ):(
              <div style={{width:"80px"}}/>
            )}
          </div>
          <div className="navbar-right">
            <SignedOut>
              <button
                className="nav-link signup-btn"
                onClick={() => navigate("/sign-up")}
              >
                Sign Up
              </button>
              <button
                className="nav-link login-btn"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            </SignedOut>
            <SignedIn>
              {isLoaded && user && (
                <div className="user-section">
                  <span className="user-greeting">{user.firstName}</span>
                  <button
                    className="nav-link logout-btn"
                    onClick={handleLogOut}
                  >
                    Log out
                  </button>
                </div>
              )}
            </SignedIn>
          </div>
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {isMenuOpen && (
          <div className="mobile-menu">
            {isSignedIn && (
              <button
                className="mobile-nav-link"
                onClick={() => navigate(isSignedIn ? "/dashboard" : "/login")}
              >
                Dashboard
              </button>
            )}

            <SignedOut>
              <button
                className="mobile-nav-link"
                onClick={() => navigate("/sign-up")}
              >
                Sign Up
              </button>
              <button
                className="mobile-nav-link"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            </SignedOut>
            <SignedIn>
              {isLoaded && user && (
                <button className="mobile-nav-link" onClick={handleLogOut}>
                  Log out
                </button>
              )}
            </SignedIn>
          </div>
        )}
      </nav>
      <Outlet />
    </>
  );
}

export default NavBar;
