import { DeleteIcon, Loader, Trash } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import Orb from "../../../styles/orb/Orb";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import { useAuth, useUser } from "@clerk/clerk-react";

function DashbordPage() {
  const navigate = useNavigate();
  const {state} = useLocation()
  const { user, isSignedIn } = useUser();
  const [timetables, setTimetables] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const { getToken } = useAuth();


 useEffect(() => {
  const updateName = async () => {
    if (isSignedIn && user  && state && typeof state.name === "string" && state.name.trim() !== "") {
      

      try {
        await user.update({ firstName: state.name });

      } catch (error) {
        console.error("Update failed:", error);
      }
    } else {
      console.log("Invalid or missing name, skipping update.");
    }
  };

  updateName();
}, [user, isSignedIn, state?.name]);

  useEffect(() => {
    const fetchTimetables = async () => {
      setIsLoading(true);
      try {
        if (isSignedIn ) {
          const token = await getToken();
          const res = await fetchWithAuth(
            token,
            `http://localhost:8000/get-timetables/${user.id}`
          );
          const data = await res.json();
          setTimetables(data);
        }
      } catch (error) {
        console.log("Error fetching timetables:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimetables();
  }, [isSignedIn,user]);

  const handleDelete = async (timetableId) => {
    try {
      setDeletingId(timetableId);
      const token = await getToken();
      const res = await fetchWithAuth(
        token,
        `http://localhost:8000/delete-timetable/${timetableId}`,
        { method: "DELETE" }
      );
      setTimetables((prev) =>
        prev.filter((timetable) => timetable._id !== timetableId)
      );
    } catch (error) {
      console.log(error);
    } finally {
      setDeletingId("");
    }
  };

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

          {(isLoading || !isSignedIn) && (
            <div className="w-100 d-flex gap-3 align-items-center justify-content-center mt-4 border border-success border-2 rounded-4 p-4">
              <div className="spinner-grow" style={{ color: "green" }} />
              <p className="fs-4 pt-3">Loading</p>
            </div>
          )}

          {!isLoading && isSignedIn && timetables.length == 0 && (
            <div className="w-100 d-flex gap-3 align-items-center justify-content-center mt-4 border border-2 rounded-4 p-4">
              <p className="fs-4 pt-3">No timetables created</p>
            </div>
          )}

          <div className="mt-4">
            {timetables.map((timetable, index) => {
              return (
                <div
                  className="d-flex w-100 align-items-center justify-content-center gap-3"
                  key={index}
                >
                  <div
                    className="bg-dark px-3 mb-4 d-flex align-items-center justify-content-between rounded-4 w-100"
                    style={{ cursor: "pointer", minHeight: "80px" }}
                    onClick={() =>
                      navigate(`/display/${timetable._id}`, {
                        state: {
                          classTimetable: timetable.class_timetable,
                          teacherTimetable: timetable.teacher_timetable,
                          timetableId: timetable._id.toString(),
                          teacherData : timetable.teacherData,
                          classes: timetable.classes,
                          subjects: timetable.subjects, 
                          workingDays: timetable.workingDays, 
                          periods: timetable.periods, 
                          title: timetable.title,
                        },
                      })
                    }
                  >
                    <div className="">
                      <p className="fs-5">{timetable.title}</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-center gap-3">
                      <p className="fs-5 pt-2">
                        Created on {timetable.createdAt.split("T")[0]} at{" "}
                        {timetable.createdAt.split("T")[1].slice(0, 5)}{" "}
                      </p>
                    </div>
                  </div>
                  {deletingId === timetable._id ? (
                    <div className="spinner-border text-danger mb-3" />
                  ) : (
                    <Trash
                      className="text-danger mb-3"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDelete(timetable._id)}
                    />
                  )}
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
