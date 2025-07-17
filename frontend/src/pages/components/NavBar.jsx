import { SignedIn, SignedOut, useAuth, useUser } from "@clerk/clerk-react";
import { Outlet, useNavigate } from "react-router";

function NavBar() {
  const navigate = useNavigate()
  const {user,isLoaded, isSignedIn} = useUser()
  const {signOut} = useAuth()


  const handleLogOut = async ()=>{
    await signOut()
    window.location.href = "/"
  }
  return (
    <div className="bg-black p-3">
      <nav className="d-flex justify-content-between">
        <div className="d-flex gap-3 justify-content-center align-items-center">
          <p className="fs-5" style={{cursor:"pointer"}} onClick={()=>navigate("/")}>TimeTable Generator</p>
          <p className="" style={{cursor:"pointer"}} onClick={()=>navigate(`${isSignedIn ? "/dashboard" : "/login"}`)}>Dashboard</p>
        </div>
        <div className="d-flex gap-3 justify-content-center align-items-center">
          <SignedOut>
            <p style={{cursor:"pointer"}} onClick={()=>navigate("/sign-up")}>Sign Up</p>
            <p style={{cursor:"pointer"}} onClick={()=>navigate("/login")}>Login</p>
          </SignedOut>
          <SignedIn>
            {isLoaded && user && (
              <>
                <p>Hello, {user.firstName}</p>
                <p style={{cursor:"pointer"}} onClick={handleLogOut}>Log out</p>
              </>
            )}
            
          </SignedIn>
          
        </div>
      </nav>

      <Outlet />
    </div>
  );
}

export default NavBar;
