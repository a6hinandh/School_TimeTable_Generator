import NavBar from "../components/NavBar";
import "./style.css";
import { CalendarDays } from "lucide-react";
import FeaturesSection from "./components/FeaturesSection";
import { useNavigate } from 'react-router-dom';


function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="dark-gradient-bg">
      <div className="container">
        <div className="row pt-5">
          <div className="col">
            <h1 className="">Generate School Timetables Effortlessly</h1>
            <h3 className="">
              Create optimized class schedules in just a few clicks.
            </h3>
            <div className="btn btn-black mt-3 w-100 fs-5" onClick={()=>navigate("/generate")}>Generate</div>
          </div>
          <div className="col">
            <div className="center-div">
              <div className="icon-circle">
                <CalendarDays size={120} className="bounce" />
              </div>
            </div>
          </div>
        </div>
        <FeaturesSection />

        <footer className="mt-20 text-center">
          © 2025 Timetable Generator | About | Contact | Terms
        </footer>
      </div>
    </div>
  );
}

export default HomePage;
