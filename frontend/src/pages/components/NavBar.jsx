import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { Outlet, useNavigate } from "react-router";

function NavBar() {
  const navigate = useNavigate()
  return (
    <div className="bg-black p-3">
      <nav className="d-flex justify-content-between">
        <div className="d-flex gap-3 justify-content-center align-items-center">
          <p className="fs-5" style={{cursor:"pointer"}} onClick={()=>navigate("/")}>TimeTable Generator</p>
          <p className="" style={{cursor:"pointer"}}>Home</p>
        </div>
        <div className="d-flex gap-3 justify-content-center align-items-center">
          <p style={{cursor:"pointer"}} onClick={()=>navigate("/sign-up")}>Sign Up</p>
          <p style={{cursor:"pointer"}} onClick={()=>navigate("/login")}>Login</p>
        </div>
      </nav>

      <Outlet />
    </div>
  );
}

export default NavBar;
