import { Plus } from "lucide-react";
import { useState } from "react";

function GeneratePage() {
  const [workingDays, setWorkingDays] = useState();
  const [subjects, setSubjects] = useState([""]);
  const [teachers, setTeachers] = useState([
    { name: "", class: "", sub: "", periods: null },
  ]);

  const handleAddSubject = () => {
    setSubjects([...subjects, ""]);
  };

  const handleChangeSubject = (index, value) => {
    const newSubjects = [...subjects];
    newSubjects[index] = value;
    setSubjects(newSubjects);
  };

  const handleAddTeacher = () => {
    setTeachers([...teachers, { name: "", class: "", sub: "", periods: null }]);
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

  const handleChangeSub = (index, sub) => {
    const newTeachers = [...teachers];
    newTeachers[index].sub = sub;
    setTeachers(newTeachers);
  };

  const handleChangePeriods = (index, periods) => {
    const newTeachers = [...teachers];
    newTeachers[index].periods = periods;
    setTeachers(newTeachers);
  };

  return (
    <div className="dark-gradient-bg">
        
      <div className="container">
        <div className="pt-3">
          <h3 className="">No of working days</h3>
          <input
            type="number"
            className="rounded-2 border border-0 p-2 form-control"
            placeholder="Working days"
            value={workingDays}
            onChange={(e) => setWorkingDays(e.target.value)}
          ></input>
        </div>

        <h3 className="mt-3">Add subjects</h3>
        <div className="mt-3 align-items-center">
          {subjects.map((subject, index) => {
            return (
              <input
                key={index}
                type="text"
                className="rounded-2 border border-0 p-2 me-3 form-control mb-3 "
                placeholder={`Subject ${index + 1}`}
                value={subject}
                onChange={(e) => handleChangeSubject(index, e.target.value)}
              ></input>
            );
          })}

          <button
            onClick={handleAddSubject}
            className="d-flex border border-0 bg-success p-2 rounded w-100 justify-content-center"
            style={{ height: "38px", padding: "0 16px" }}
          >
            <Plus className="me-1" />
            <p className="">Add one more Subject</p>
          </button>
        </div>

        <h3 className="mt-3">Add Teachers</h3>
        <div className="mb-5">
          {teachers.map((teacher, index) => {
            return (
              <div className="d-flex mt-2">
                <input
                  key={index}
                  type="text"
                  className="rounded-2 border border-0 p-2 me-3 form-control mb-3 "
                  placeholder={`Teacher ${index + 1}`}
                  value={teacher.name}
                  onChange={(e) =>
                    handleChangeTeacherName(index, e.target.value)
                  }
                ></input>
                <input
                  key={index}
                  type="text"
                  className="rounded-2 border border-0 p-2 me-3 form-control mb-3 "
                  placeholder="Class"
                  value={teacher.class}
                  onChange={(e) => handleChangeClass(index, e.target.value)}
                ></input>
                <select
                  class="form-select border border-0 me-3"
                  style={{ height: "40px" }}
                >
                  <option selected>Select Subject</option>
                  {subjects.map((subject, index) =>
                    subject !== "" ? (
                      <option
                        key={index}
                        value={subject}
                        onChange={(e) => handleChangeSub(index, e.target.value)}
                      >
                        {subject}
                      </option>
                    ) : null
                  )}
                </select>
                <input
                  key={index}
                  type="number"
                  className="rounded-2 border border-0 p-2 me-3 form-control mb-3 "
                  placeholder="No of periods"
                  value={teacher.periods}
                  onChange={(e) => handleChangePeriods(index, e.target.value)}
                ></input>
              </div>
            );
          })}
          <button
            onClick={handleAddTeacher}
            className="d-flex border border-0 bg-success p-2 rounded w-100 justify-content-center mt-2"
            style={{ height: "38px", padding: "0 16px" }}
          >
            <Plus className="me-1" />
            <p className="">Add one more Teacher</p>
          </button>
        </div>
        <div className="btn btn-black mt-3 w-20 fs-5 position-fixed" style={{bottom:"40px",right:"40px",zIndex:1000}}>Generate</div>
      </div>
    </div>
  );
}

export default GeneratePage;
