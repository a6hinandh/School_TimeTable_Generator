import { useState } from "react";
import { Plus, Loader2, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useAuth, useUser } from "@clerk/clerk-react";
import DropdownChecklist from "./components/DropdownChecklist";
import TimetableDisplay from "./TimetableDisplay";
import EditTimetable from "./components/EditTimetable";
import { fetchWithAuth } from "../../utils/fetchWithAuth";
import toast from "react-hot-toast";


function AddTeacher() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser();
  const { state } = useLocation();
  const {
    classes,
    subjects,
    workingDays,
    periods,
    title,
    teacherData,
    timetableId,
  } = state || {};
  const [teachers, setTeachers] = useState(() => {
    if (teacherData) {
      return teacherData;
    }
    return [
      {
        name: "",
        subjects: [],
        assigned_class: "",
        mainSubject: "",
        labPeriod: "",
        periods: [{ class_name: "", subject: "", noOfPeriods: "" }],
      },
    ];
  });
  const [loading, setLoading] = useState(false);
  const [timetableData, setTimetableData] = useState(null);
  const [error, setError] = useState("");

  // Store the teachers data when timetable is generated
  const [savedTeachersData, setSavedTeachersData] = useState(null);

  const handleAddTeacher = () => {
    setTeachers([
      ...teachers,
      {
        name: "",
        assigned_class: "",
        mainSubject: "",
        labPeriod: "",
        periods: [{ _name: "", subject: "", noOfPeriods: "" }],
        subjects: [],
      },
    ]);
  };

  const handleDeleteTeacher = (index) => {
    if (teachers.length > 1) {
      const newTeachers = teachers.filter((_, i) => i !== index);
      setTeachers(newTeachers);
    }
  };

  const handleAddPeriod = (index) => {
    const newTeachers = [...teachers];
    newTeachers[index].periods = [
      ...newTeachers[index].periods,
      { class_name: "", subject: "", noOfPeriods: "" },
    ];
    setTeachers(newTeachers);
  };

  const handleDeletePeriod = (teacherIndex, periodIndex) => {
    const newTeachers = [...teachers];
    if (newTeachers[teacherIndex].periods.length > 1) {
      newTeachers[teacherIndex].periods = newTeachers[
        teacherIndex
      ].periods.filter((_, i) => i !== periodIndex);
      setTeachers(newTeachers);
    }
  };

  const handleChangePeriodClass = (index, ind, clas) => {
    const newTeachers = [...teachers];
    newTeachers[index].periods[ind].class_name = clas;
    setTeachers(newTeachers);
  };

  const handleChangePeriodSubject = (index, ind, sub) => {
    const newTeachers = [...teachers];
    newTeachers[index].periods[ind].subject = sub;
    setTeachers(newTeachers);
  };

  const handleChangePeriodNumber = (index, ind, no) => {
    const newTeachers = [...teachers];
    newTeachers[index].periods[ind].noOfPeriods = parseInt(no) || 0;
    setTeachers(newTeachers);
  };

  const handleChangeTeacherName = (index, teacherName) => {
    const newTeachers = [...teachers];
    newTeachers[index].name = teacherName;
    setTeachers(newTeachers);
  };

  const handleChangeClass = (index, grade) => {
    const newTeachers = [...teachers];
    newTeachers[index].assigned_class = grade;
    setTeachers(newTeachers);
  };

  const handleChangeMainSubject = (index, mainSub) => {
    const newTeachers = [...teachers];
    newTeachers[index].mainSubject = mainSub;
    setTeachers(newTeachers);
  };

  const handleChangeLabPeriod = (index, lab) => {
    const newTeachers = [...teachers];
    newTeachers[index].labPeriod = lab;
    setTeachers(newTeachers);
  };

  const handleChangeSelectedSubjects = (index, subjects) => {
    const newTeachers = [...teachers];
    newTeachers[index].subjects = subjects;
    setTeachers(newTeachers);
  };

  const generateTimetable = async () => {
    setLoading(true);
    setError("");

    try {
      // Validate input
      for (const teacher of teachers) {
        if (!teacher.name.trim()) {
          throw new Error("Please enter all teacher names");
        }
        if (
          !teacher.mainSubject ||
          teacher.mainSubject === "Select Main Subject"
        ) {
          throw new Error(`Please select main subject for ${teacher.name}`);
        }
        if (
          teacher.periods.some(
            (p) => !p.class_name || !p.subject || !p.noOfPeriods
          )
        ) {
          throw new Error(
            `Please fill all period assignments for ${teacher.name}`
          );
        }
      }

      // Save current teachers data before generating timetable
      setSavedTeachersData(JSON.parse(JSON.stringify(teachers)));

      // Prepare data for API
      const requestData = {
        userId: user.id,
        title: title,
        workingDays: parseInt(workingDays) || 5,
        periods: parseInt(periods) || 8,
        classes: classes.filter((c) => c.trim()),
        subjects: subjects.filter((s) => s.trim()),
        teachers: teachers.map((teacher) => ({
          name: teacher.name,
          subjects: teacher.subjects,
          mainSubject: teacher.mainSubject,
          labPeriod:
            teacher.labPeriod !== "Select Lab Period"
              ? teacher.labPeriod
              : null,
          assigned_class:
            teacher.assigned_class !== "Select Class"
              ? teacher.assigned_class
              : null,
          periods: teacher.periods.map((p) => ({
            class_name: p.class_name,
            subject: p.subject,
            noOfPeriods: p.noOfPeriods,
          })),
        })),
      };

      const token = await getToken();
      const response = await fetchWithAuth(
        token,
        "http://localhost:8000/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to generate timetable");
      }

      const data = await response.json();

      setTimetableData(data);
    } catch (err) {
      console.error("Error generating timetable:", err);
      setError(err.message || "Failed to generate timetable");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToTeachers = () => {
    // Restore the saved teachers data when going back
    if (savedTeachersData) {
      setTeachers(savedTeachersData);
    }
    setTimetableData(null);
    setError(""); // Clear any errors
  };

  const handleRegenerateWithCurrentData = async () => {
    // Use current teachers data to regenerate
    await generateTimetable();
  };

  const handleSavetoDb = async () => {
    try {
      if (timetableData !== null) {
        if (timetableId) {
          const token = await getToken();
          const response = await fetchWithAuth(
            token,
            `http://localhost:8000/update-timetable/${timetableId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(timetableData),
            }
          );
          const result = await response.json();
          toast.success("Timetable saved successfully");
          navigate(`/display/${timetableId}`, {
            state: {
              classTimetable: timetableData.class_timetable,
              teacherTimetable: timetableData.teacher_timetable,
              timetableId: timetableId,
              teacherData: result.teacherData,
              classes: result.classes,
              subjects: result.subjects,
              workingDays: result.workingDays,
              periods: result.periods,
              title: result.title,
            },
          });
        } else {
          const token = await getToken();
          const response = await fetchWithAuth(
            token,
            "http://localhost:8000/add",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(timetableData),
            }
          );
          const result = await response.json();
          toast.success("Timetable saved successfully");
          navigate(`/display/${result._id.toString()}`, {
            state: {
              classTimetable: timetableData.class_timetable,
              teacherTimetable: timetableData.teacher_timetable,
              timetableId: result._id.toString(),
              teacherData: result.teacherData,
              classes: result.classes,
              subjects: result.subjects,
              workingDays: result.workingDays,
              periods: result.periods,
              title: result.title,
            },
          });
        }
      }
    } catch (error) {
      console.log("Error in saving", error);
    }
  };

  // If timetable is generated, show the timetable display
  if (timetableData) {
    return (
      <div className="dark-gradient-bg min-vh-100">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center p-3 bg-light border-bottom">
            <h3 className="mb-0 text-dark">Generated Timetable</h3>
            <div className="d-flex gap-2">
              <button
                className="btn btn-warning btn-lg"
                onClick={handleSavetoDb}
                title="Save"
              >
                <X className="me-2" size={16} />
                Save
              </button>
              
                  <button
                    className="btn btn-warning btn-lg"
                    onClick={handleBackToTeachers}
                    title="Go back to edit teachers"
                  >
                    <X className="me-2" size={16} />
                    Edit Teachers
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal"
                  >
                    Edit timetable
                  </button>
                

              <button
                className="btn btn-success btn-lg"
                onClick={handleRegenerateWithCurrentData}
                disabled={loading}
                title="Regenerate timetable with current data"
              >
                {loading ? (
                  <>
                    <Loader2 className="me-2 animate-spin" size={16} />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Plus className="me-2" size={16} />
                    Regenerate
                  </>
                )}
              </button>
            </div>
          </div>
          <TimetableDisplay
            classTimetable={timetableData.class_timetable}
            teacherTimetable={timetableData.teacher_timetable}
            showEditOptions= {savedTeachersData}
          />

          <div
            className="modal fade"
            id="exampleModal"
            tabIndex="-1"
            aria-labelledby="exampleModalLabel"
            aria-hidden="true"
          >
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title fs-5" id="exampleModalLabel">
                    Edit TimeTable
                  </h1>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <EditTimetable
                    classTimetable={timetableData.class_timetable}
                    teacherTimetable={timetableData.teacher_timetable}
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                  <button type="button" className="btn btn-primary">
                    Save changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dark-gradient-bg">
      <div className="d-flex justify-content-between align-items-center">
        <h3 className="mt-3">Add Teachers</h3>
        {savedTeachersData && (
          <div
            className="alert alert-info mt-3 mb-0"
            style={{ fontSize: "0.9rem" }}
          >
            <strong>Note:</strong> You can edit the data below and regenerate
            the timetable
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="mb-5">
        {teachers.map((teacher, index) => {
          return (
            <div
              className="d-flex flex-column mt-2 border border-4 rounded-3 p-4 position-relative"
              key={index}
            >
              {/* Delete Teacher Button */}
              {teachers.length > 1 && (
                <button
                  onClick={() => handleDeleteTeacher(index)}
                  className="btn btn-danger position-absolute"
                  style={{
                    top: "10px",
                    right: "10px",
                    padding: "4px 8px",
                    fontSize: "12px",
                  }}
                  title="Delete Teacher"
                >
                  <X size={16} />
                </button>
              )}

              <div className="d-flex">
                <div className="d-flex flex-column gap-2 mx-2 w-100">
                  <label>Name</label>
                  <input
                    type="text"
                    className="rounded-2 border border-0 p-2 form-control mb-3 "
                    placeholder={`Teacher ${index + 1}`}
                    value={teacher.name}
                    onChange={(e) =>
                      handleChangeTeacherName(index, e.target.value)
                    }
                  />
                </div>

                <div className="d-flex flex-column gap-2 mx-2 w-100">
                  <label>Subjects</label>
                  <DropdownChecklist
                    options={subjects}
                    selected={teacher.subjects}
                    onChange={(selected) =>
                      handleChangeSelectedSubjects(index, selected)
                    }
                  />
                </div>

                <div className="d-flex flex-column gap-2 mx-2 w-100">
                  <label>Main Subject</label>
                  <select
                    className="form-select border border-0 me-3"
                    style={{ height: "40px" }}
                    value={teacher.mainSubject}
                    onChange={(e) =>
                      handleChangeMainSubject(index, e.target.value)
                    }
                  >
                    <option>Select Main Subject</option>
                    {teacher.subjects.map((subject, ind) =>
                      subject !== "" ? (
                        <option key={ind} value={subject}>
                          {subject}
                        </option>
                      ) : null
                    )}
                  </select>
                </div>

                <div className="d-flex flex-column gap-2 mx-2 w-100">
                  <label>Lab Period</label>
                  <select
                    className="form-select border border-0 me-3"
                    style={{ height: "40px" }}
                    value={teacher.labPeriod}
                    onChange={(e) =>
                      handleChangeLabPeriod(index, e.target.value)
                    }
                  >
                    <option>Select Lab Period</option>
                    {teacher.subjects.map((subject, ind) =>
                      subject !== "" ? (
                        <option key={ind} value={subject}>
                          {subject}
                        </option>
                      ) : null
                    )}
                  </select>
                </div>
              </div>

              <div className="d-flex gap-2 p-2 align-items-center">
                <label className="fs-5">If class teacher, select class</label>
                <select
                  className="form-select border border-0 me-3 w-25"
                  style={{ height: "40px" }}
                  value={teacher.assigned_class}
                  onChange={(e) => handleChangeClass(index, e.target.value)}
                >
                  <option>Select Class</option>
                  {classes.map((clas, ind) =>
                    clas !== "" ? (
                      <option key={ind} value={clas}>
                        {clas}
                      </option>
                    ) : null
                  )}
                </select>
              </div>

              <h4 className="p-2">Assign Periods</h4>
              <div className="d-flex flex-column w-100">
                {teacher.periods.map((period, ind) => {
                  return (
                    <div className="d-flex w-100 align-items-end" key={ind}>
                      <div className="d-flex flex-column gap-2 mx-2 w-100">
                        <label>Class</label>
                        <select
                          className="form-select border border-0 me-3"
                          style={{ height: "40px" }}
                          value={period.class_name}
                          onChange={(e) =>
                            handleChangePeriodClass(index, ind, e.target.value)
                          }
                        >
                          <option>Select Class</option>
                          {classes.map((clas, i) =>
                            clas !== "" ? (
                              <option key={i} value={clas}>
                                {clas}
                              </option>
                            ) : null
                          )}
                        </select>
                      </div>

                      <div className="d-flex flex-column gap-2 mx-2 w-100">
                        <label>Subject</label>
                        <select
                          className="form-select border border-0 me-3"
                          style={{ height: "40px" }}
                          value={period.subject}
                          onChange={(e) =>
                            handleChangePeriodSubject(
                              index,
                              ind,
                              e.target.value
                            )
                          }
                        >
                          <option>Select Subject</option>
                          {teacher.subjects.map((sub, subInd) =>
                            sub !== "" ? (
                              <option key={subInd} value={sub}>
                                {sub}
                              </option>
                            ) : null
                          )}
                        </select>
                      </div>

                      <div className="d-flex flex-column gap-2 mx-2 w-100">
                        <label>No of Periods</label>
                        <input
                          type="number"
                          className="rounded-2 border border-0 p-2 me-3 form-control mb-3"
                          placeholder="No of periods"
                          value={period.noOfPeriods}
                          onChange={(e) =>
                            handleChangePeriodNumber(index, ind, e.target.value)
                          }
                        />
                      </div>

                      {/* Delete Period Button */}
                      {teacher.periods.length > 1 && (
                        <div className="mx-2 mb-3">
                          <button
                            onClick={() => handleDeletePeriod(index, ind)}
                            className="btn btn-danger"
                            style={{ height: "40px", padding: "0 12px" }}
                            title="Delete Period"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => handleAddPeriod(index)}
                className="d-flex border border-0 bg-success p-2 rounded w-100 justify-content-center mt-2"
                style={{ height: "38px", padding: "0 16px" }}
              >
                <Plus className="me-1" />
                <p className="">Add another period</p>
              </button>
            </div>
          );
        })}

        <div className="text-center d-flex align-items-center justify-content-center">
          <button
            onClick={handleAddTeacher}
            className="d-flex border border-0 bg-success p-2 rounded w-75 justify-content-center mt-5"
            style={{ height: "38px", padding: "0 16px" }}
          >
            <Plus className="me-1" />
            <p className="">Add another Teacher</p>
          </button>
        </div>

        <div className="flex w-100 text-center align-items-center justify-content-center mt-5">
          <button
            className="btn btn-black mb-4 w-20 fs-5 flex align-items-center justify-content-center"
            onClick={generateTimetable}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="me-2 animate-spin" size={20} />
                Generating...
              </>
            ) : savedTeachersData ? (
              "Regenerate Timetable"
            ) : (
              "Generate Timetable"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddTeacher;
