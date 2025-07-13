import { useState } from "react";
import { Plus } from "lucide-react";
import { useLocation } from "react-router";
import DropdownChecklist from "./components/DropdownChecklist";

function AddTeacher() {
  const { state } = useLocation();
  const { classes, subjects } = state || {};
  const [teachers, setTeachers] = useState([
    {
      name: "",
      subjects: [],
      class: "",
      mainSubject: "",
      labPeriod: "",
      periods: [{ class: "", subject: "", noOfPeriods: "" }],
    },
  ]);
  const handleAddTeacher = () => {
    setTeachers([
      ...teachers,
      {
        name: "",
        class: "",
        mainSubject: "",
        labPeriod: "",
        periods: [{ class: "", subject: "", noOfPeriods: "" }],
        subjects: [],
      },
    ]);
  };

  const handleAddPeriod = (index) => {
    const newTeachers = [...teachers];
    newTeachers[index].periods = [
      ...newTeachers[index].periods,
      { class: "", subject: "", noOfPeriods: "" },
    ];
    setTeachers(newTeachers);
  };

  const handleChangePeriodClass = (index, ind, clas) => {
    const newTeachers = [...teachers];
    newTeachers[index].periods[ind].class = clas;
    setTeachers(newTeachers);
  };

  const handleChangePeriodSubject = (index, ind, sub) => {
    const newTeachers = [...teachers];
    newTeachers[index].periods[ind].subject = sub;
    setTeachers(newTeachers);
  };

  const handleChangePeriodNumber = (index, ind, no) => {
    const newTeachers = [...teachers];
    newTeachers[index].periods[ind].noOfPeriods = no;
    setTeachers(newTeachers);
  };

  const handleChangeTeacherName = (index, teacherName) => {
    const newTeachers = [...teachers];
    newTeachers[index].name = teacherName;
    setTeachers(newTeachers);
  };

  const handleChangeClass = (index, grade) => {
    const newTeachers = [...teachers];
    newTeachers[index].class = grade;
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

  return (
    <div className="dark-gradient-bg">
      <h3 className="mt-3">Add Teachers</h3>
      <div className="mb-5">
        {teachers.map((teacher, index) => {
          return (
            <div
              className="d-flex flex-column mt-2 border border-4 rounded-3 p-4"
              key={index}
            >
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
                  ></input>
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
                    <div className="d-flex w-100" key={index}>
                      <div className="d-flex flex-column gap-2 mx-2 w-100">
                        <label>Class</label>
                        <select
                          className="form-select border border-0 me-3"
                          style={{ height: "40px" }}
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
                          onChange={(e) =>
                            handleChangePeriodSubject(
                              index,
                              ind,
                              e.target.value
                            )
                          }
                        >
                          <option>Select Subject</option>
                          {teacher.subjects.map((sub, ind) =>
                            sub !== "" ? (
                              <option key={ind} value={sub}>
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
                          onChange={(e) =>
                            handleChangePeriodNumber(index, ind, e.target.value)
                          }
                        ></input>
                      </div>
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
          <div
            className="btn btn-black mb-4 w-20 fs-5 flex align-items-center justify-content-center"
            onClick={() => console.log(teachers)}
          >
            Generate
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddTeacher;
