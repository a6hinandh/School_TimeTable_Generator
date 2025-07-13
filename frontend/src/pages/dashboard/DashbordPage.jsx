import { Plus } from "lucide-react";
import { useNavigate } from "react-router";
import Orb from "../../../styles/orb/Orb";

function DashbordPage() {
  const navigate = useNavigate();
  return (
    <div className="dark-gradient-bg min-vh-100">
      <div className="container">
        <div style={{ height: "5vh" }} />
        <div
          className="w-100 justify-content-center align-items-center d-flex bg-black border border-white border-4 rounded-5"
          style={{ height: "45vh", cursor: "pointer" }}
          onClick={() => navigate("/generate")}
        >
          <div className="justify-content-center align-items-center d-flex flex-column">
            <div
              style={{ width: "100%", height: "600px", position: "relative" }}
            >
              <Orb
                hoverIntensity={0.5}
                rotateOnHover={true}
                hue={0}
                forceHoverState={false}
              >
                
                <p className="fs-3">Click to Create new timetable</p>
              </Orb>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <h3>Recent Timetables</h3>
        </div>
      </div>
    </div>
  );
}

export default DashbordPage;
