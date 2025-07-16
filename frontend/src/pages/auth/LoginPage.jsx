import { useState } from "react";
import DotGrid from "../../../styles/DotGrid/DotGrid";
import InputField from "./components/InputField";
import { useNavigate } from "react-router";
import { useSignIn } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate()
  const {signIn,setActive} = useSignIn()
  const [isLoading, setIsLoading] = useState(false);

  const handleSignInWithEmail = async ()=>{
    try {
        setIsLoading(true)
        const result = await signIn.create({
          identifier:email,
          password: password,
        })
        if(result.status==="complete"){
          await setActive({session : result.createdSessionId})
          navigate("/dashboard")
        }else{
          console.log("Some error")
        }
      
    } catch (error) {
      console.log("Error in sign up",error)
    
      toast.error(error.message)
    }finally{
      setIsLoading(false)
    }
  }

   const handleSignInWithGoogle = async ()=>{
    try {
      await signIn.authenticateWithRedirect({
        strategy : "oauth_google",
        redirectUrl : "/sso-callback",
        redirectUrlComplete : "/dashboard"
      })
    } catch (error) {
      console.log("Error in sign up with google",error)
     
      toast.error(error.message)
    }
  }

  if (isLoading) {
    return (
      <div className="text-success d-flex flex-column align-items-center justify-content-center min-vh-100 w-100 fs-3">
        <Loader className="spin" size={40} />
        <p>Logging in</p>
      </div>
    );
  }

  return (
    <div className="vh-100 dark-gradient-bg" style={{ width: "100%", position: "relative" }}>
      <DotGrid
        dotSize={10}
        gap={15}
        baseColor="#000000"
        activeColor="#277D08"
        proximity={140}
        shockRadius={250}
        shockStrength={5}
        resistance={750}
        returnDuration={1.5}
      >
        <div className="d-flex vh-100 justify-content-center px-3 align-items-center">
          <div className="bg-dark border border-white border-1 rounded-3 p-4" style={{minWidth: "280px", width: "100%", maxWidth: "400px" }} >
            <h3 className="text-center pt-3 pb-2">Log In</h3>
            <div className="d-flex flex-column p-2 w-100 gap-3 justify-content-center align-items-center ">
              <InputField
                value={email}
                type="text"
                placeholder="Enter Email"
                handleFunction={(e) => setEmail(e.target.value)}
              />
              <InputField
                value={password}
                type="password"
                placeholder="Enter Password"
                handleFunction={(e) => setPassword(e.target.value)}
              />
              <button
                className="d-flex border border-0 bg-success p-2 rounded w-100 justify-content-center"
                style={{ height: "38px", padding: "0 16px" }}
                onClick={handleSignInWithEmail}
              >
                <p className="">Login</p>
              </button>
              <p className="mb-0">or</p>
              <div className="rounded-5 p-1 px-3 justify-content-center align-items-center d-flex gap-2" style={{backgroundColor:"black",cursor:"pointer"}} onClick={handleSignInWithGoogle}>
                <p className="pt-2">Continue with Google</p>
                <img src="./google.png" className="rounded-pill" style={{width: "30px",height:"30px"}}/>
              </div>
              <div className="d-flex gap-2">
                <p>Don't have an account ?</p>
                <p className="" onClick={()=>navigate("/sign-up")} style={{cursor:"pointer"}}>Sign up</p>
              </div>
            </div>
          </div>
        </div>
      </DotGrid>
    </div>
  );
}

export default LoginPage