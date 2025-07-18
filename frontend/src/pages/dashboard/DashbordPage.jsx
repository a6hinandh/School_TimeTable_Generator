import { DeleteIcon, Loader, Trash } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import Orb from "../../../styles/orb/Orb";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import { useAuth, useUser } from "@clerk/clerk-react";
import "./DashboardPage.css";

function DashbordPage() {
  const navigate = useNavigate();
  const {state} = useLocation()
  const { user, isSignedIn } = useUser();
  const [timetables, setTimetables] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const { getToken } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const updateName = async () => {
      if (isSignedIn && user && state && typeof state.name === "string" && state.name.trim() !== "") {
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
        if (isSignedIn) {
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
  }, [isSignedIn, user]);

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
    <div className="dark-gradient-bg">
      <div className="dashboard-containerd">
        <div className="spacer-topd" />
        <div
          className="create-timetable-cardd"
          
        >
          <div className="create-contentd">
            <div className="orb-containerd">
              <Orb
                hoverIntensity={0.5}
                rotateOnHover={true}
                hue={0}
                forceHoverState={false}
                
              >
                <p onClick={() => navigate("/generate")} style={{cursor:"pointer"}} className="create-textd">Create new timetable</p>
              </Orb>
            </div>
          </div>
        </div>
        
        <div className="recent-sectiond">
          <h3 className="recent-titled">Recent Timetables</h3>

          {(isLoading || !isSignedIn) && (
            <div className="loading-containerd">
              <div className="loading-spinnerd" />
              <p className="loading-textd">Loading</p>
            </div>
          )}

          {!isLoading && isSignedIn && timetables.length === 0 && (
            <div className="empty-stated">
              <p className="empty-textd">No timetables created</p>
            </div>
          )}

          <div className="timetables-listd">
            {timetables.map((timetable, index) => {
              return (
                <div
                  className="timetable-rowd"
                  key={index}
                >
                  <div
                    className="timetable-cardd"
                    onClick={() =>
                      navigate(`/display/${timetable._id}`, {
                        state: {
                          classTimetable: timetable.class_timetable,
                          teacherTimetable: timetable.teacher_timetable,
                          timetableId: timetable._id.toString(),
                          teacherData: timetable.teacherData,
                          classes: timetable.classes,
                          subjects: timetable.subjects,
                          workingDays: timetable.workingDays,
                          periods: timetable.periods,
                          title: timetable.title,
                        },
                      })
                    }
                  >
                    <div>
                      <p className="timetable-titled">{timetable.title}</p>
                    </div>
                    <div className="timetable-infod">
                      <p className="timetable-dated">
                        Created on {timetable.createdAt.split("T")[0]} at{" "}
                        {timetable.createdAt.split("T")[1].slice(0, 5)}
                      </p>
                    </div>
                  </div>
                  {deletingId === timetable._id ? (
                    <div className="delete-spinnerd" />
                  ) : (
                    <Trash
                      className="delete-icond"
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