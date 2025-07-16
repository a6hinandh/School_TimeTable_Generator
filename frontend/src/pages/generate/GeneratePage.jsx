import { ArrowBigRight, ArrowBigRightIcon, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function GeneratePage() {
  const [workingDays, setWorkingDays] = useState();
  const [periods, setPeriods] = useState();
  const [title, setTitle] = useState();
  const [subjects, setSubjects] = useState([""]);
  const [classes, setClasses] = useState([""]);
  const navigate = useNavigate();

  const handleAddSubject = () => {
    setSubjects([...subjects, ""]);
  };

  const handleChangeSubject = (index, value) => {
    const newSubjects = [...subjects];
    newSubjects[index] = value;
    setSubjects(newSubjects);
  };

  const handleAddClasses = () => {
    setClasses([...classes, ""]);
  };

  const handleChangeClasses = (index, value) => {
    const newClasses = [...classes];
    newClasses[index] = value;
    setClasses(newClasses);
  };

  const handleNext = () => {
    // Validate input before proceeding
    if (!workingDays || !periods) {
      alert("Please enter working days and periods per day");
      return;
    }
    
    const validClasses = classes.filter(c => c.trim() !== "");
    const validSubjects = subjects.filter(s => s.trim() !== "");
    
    if (validClasses.length === 0 || validSubjects.length === 0) {
      alert("Please add at least one class and one subject");
      return;
    }

    navigate("/generate/add-teachers", {
      state: { 
        classes: validClasses, 
        subjects: validSubjects,
        workingDays,
        periods,
        title
      },
    });
  };

  return (
    <div className="dark-gradient-bg">
      <div className="container">
        <div className="pt-3">
          <h3 className="">Title</h3>
          <input
            type="text"
            className="rounded-2 border border-0 p-2 form-control"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          ></input>
        </div>

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

        <div className="pt-3">
          <h3 className="">No of periods per day</h3>
          <input
            type="number"
            className="rounded-2 border border-0 p-2 form-control"
            placeholder="Periods per day"
            value={periods}
            onChange={(e) => setPeriods(e.target.value)}
          ></input>
        </div>

        <h3 className="mt-3">Add Classes</h3>
        <div className="mt-3 align-items-center">
          {classes.map((clas, index) => {
            return (
              <input
                key={index}
                type="text"
                className="rounded-2 border border-0 p-2 me-3 form-control mb-3 "
                placeholder={`Class ${index + 1}`}
                value={clas}
                onChange={(e) => handleChangeClasses(index, e.target.value)}
              ></input>
            );
          })}

          <button
            onClick={handleAddClasses}
            className="d-flex border border-0 bg-success p-2 rounded w-100 justify-content-center"
            style={{ height: "38px", padding: "0 16px" }}
          >
            <Plus className="me-1" />
            <p className="">Add one more Class</p>
          </button>
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

        <div className="flex w-100 text-center align-items-center justify-content-center mt-5">
          <div
            className="btn btn-black mb-4 w-20 fs-5 flex align-items-center justify-content-center"
            onClick={handleNext}
          >
            Add Teachers
            <ArrowBigRight size={25} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default GeneratePage;