import { ArrowBigRight, ArrowBigRightIcon, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./GeneratePage.css";
import toast from "react-hot-toast";

function GeneratePage() {
  const [workingDays, setWorkingDays] = useState();
  const [periods, setPeriods] = useState();
  const [title, setTitle] = useState();
  const [subjects, setSubjects] = useState([""]);
  const [classes, setClasses] = useState([""]);
  const navigate = useNavigate();

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

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

    if(workingDays>6){
      toast.error("Number of working days cannot exceed 6")
      window.scrollTo(0, 0);
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
        title,
        teacherData:null,
        timetableId:null
      },
    });
  };

  return (
    <div className="dark-gradient-bg-ge">
      <div className="container-ge">
        <div className="input-section-ge">
          <h3 className="section-title-ge">Title</h3>
          <input
            type="text"
            className="form-input-ge"
            placeholder="Enter timetable title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="input-section-ge">
          <h3 className="section-title-ge">No of working days</h3>
          <input
            type="number"
            className="form-input-ge"
            placeholder="Enter working days (e.g., 5)"
            value={workingDays}
            onChange={(e) => setWorkingDays(e.target.value)}
          />
        </div>

        <div className="input-section-ge">
          <h3 className="section-title-ge">No of periods per day</h3>
          <input
            type="number"
            className="form-input-ge"
            placeholder="Enter periods per day (e.g., 8)"
            value={periods}
            onChange={(e) => setPeriods(e.target.value)}
          />
        </div>

        <div className="section-ge">
          <h3 className="section-title-ge">Add Classes</h3>
          <div className="input-group-ge">
            {classes.map((clas, index) => {
              return (
                <input
                  key={index}
                  type="text"
                  className="form-input-ge input-item-ge"
                  placeholder={`Class ${index + 1} (e.g., Grade 10A)`}
                  value={clas}
                  onChange={(e) => handleChangeClasses(index, e.target.value)}
                />
              );
            })}

            <button
              onClick={handleAddClasses}
              className="add-button-ge"
            >
              <Plus className="icon-ge" />
              <span>Add one more Class</span>
            </button>
          </div>
        </div>

        <div className="section-ge">
          <h3 className="section-title-ge">Add subjects</h3>
          <div className="input-group-ge">
            {subjects.map((subject, index) => {
              return (
                <input
                  key={index}
                  type="text"
                  className="form-input-ge input-item-ge"
                  placeholder={`Subject ${index + 1} (e.g., Mathematics)`}
                  value={subject}
                  onChange={(e) => handleChangeSubject(index, e.target.value)}
                />
              );
            })}

            <button
              onClick={handleAddSubject}
              className="add-button-ge"
            >
              <Plus className="icon-ge" />
              <span>Add one more Subject</span>
            </button>
          </div>
        </div>

        <div className="next-button-container-ge">
          <button
            className="next-button-ge"
            onClick={handleNext}
          >
            <span>Add Teachers</span>
            <ArrowBigRight className="arrow-icon-ge" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default GeneratePage;