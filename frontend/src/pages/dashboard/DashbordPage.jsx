import { Loader } from "lucide-react";
import { useNavigate } from "react-router";
import Orb from "../../../styles/orb/Orb";
import { useEffect, useState } from "react";

function DashbordPage() {
  const navigate = useNavigate();
  const [timetables, setTimetables] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchTimetables = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("http://localhost:8000/get-timetables");
        const data = await res.json();
        setTimetables(data);
      } catch (error) {
        console.log("Error fetching timetables:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimetables();
  }, []);

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

          {isLoading && (
            <div className="w-100 d-flex gap-3 align-items-center justify-content-center mt-4 border border-success border-2 rounded-4 p-4">
              <div className="spinner-grow" style={{ color: "green" }} />
              <p className="fs-4 pt-3">Loading</p>
            </div>
          )}

          <div className="mt-4">
            {timetables.map((timetable, index) => {
              return (
                <div
                  key={index}
                  className="bg-dark p-3 mb-4 d-flex align-items-center justify-content-start rounded-4"
                  style={{ cursor: "pointer", minHeight: "80px" }}
                  onClick={() =>
                    navigate(`/display/${timetable._id}`, {
                      state: {
                        classTimetable: timetable.class_timetable,
                        teacherTimetable: timetable.teacher_timetable,
                        timetableId: timetable._id,
                      },
                    })
                  }
                >
                  <p className="fs-5">
                    Created on {timetable.createdAt.split("T")[0]} at{" "}
                    {timetable.createdAt.split("T")[1].slice(0, 5)}{" "}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashbordPage;
