import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { fetchWithAuth } from "../../../utils/fetchWithAuth";
import { useAuth, useUser } from "@clerk/clerk-react";

const EditTimetable = ({ classTimetable, teacherTimetable, id, title }) => {
  const navigate = useNavigate()
  const {getToken} = useAuth()
  const {user} = useUser()
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedPeriods, setSelectedPeriods] = useState([]);
  const [currentClassTimeTable, setCurrentClassTimeTable] =
    useState(classTimetable);
  const [currentTeacherTimeTable, setCurrentTeacherTimeTable] =
    useState(teacherTimetable);

  const [showPositiveMessage,setShowPositiveMessage] = useState(false)
  const [showNegativeMessage,setShowNegativeMessage] = useState(false)



  useEffect(() => {
    if (classTimetable) {
      setCurrentClassTimeTable(classTimetable);
    }
  }, [classTimetable]);

  useEffect(() => {
    if (teacherTimetable) {
      setCurrentTeacherTimeTable(teacherTimetable);
    }
  }, [teacherTimetable]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const periods = [
    "Period 1",
    "Period 2",
    "Period 3",
    "Period 4",
    "Period 5",
    "Period 6",
    "Period 7",
    "Period 8",
  ];

  const currentData = currentClassTimeTable;
  const items = currentData ? Object.keys(currentData) : [];

  // Auto-select first item when data is available
  React.useEffect(() => {
    if (items.length > 0 && !selectedItem) {
      setSelectedItem(items[0]);
    }
  }, [items, selectedItem]);

  if (!currentClassTimeTable) {
    return <div className="text-center p-4">No timetable data available</div>;
  }

  const handlePeriodSwap = (dayIndex, periodIndex) => {
    const alreadySelected = selectedPeriods.some(
      (sel) => sel.dayIndex === dayIndex && sel.periodIndex === periodIndex
    );

    let newSelected;

    if (alreadySelected) {
      newSelected = selectedPeriods.filter(
        (sel) => sel.dayIndex !== dayIndex || sel.periodIndex !== periodIndex
      );
    } else {
      newSelected = [...selectedPeriods, { dayIndex, periodIndex }];
    }

    setSelectedPeriods(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;

      const newClass = JSON.parse(JSON.stringify(currentClassTimeTable));
      const newTeacher = JSON.parse(JSON.stringify(currentTeacherTimeTable));

      const period1 = newClass[selectedItem][first.dayIndex][first.periodIndex];
      const period2 =
        newClass[selectedItem][second.dayIndex][second.periodIndex];

      let teacher1 =
        period1 !== "Free" && period1 !== "" ? period1.split("(")[1][0] : null;
      let teacher2 =
        period2 !== "Free" && period2 !== "" ? period2.split("(")[1][0] : null;

      if (
        teacher1 &&
        teacher2 &&
        newTeacher[teacher1][second.dayIndex][second.periodIndex] === "Free" &&
        newTeacher[teacher2][first.dayIndex][first.periodIndex] === "Free"
      ) {

        setShowPositiveMessage(true)
        setTimeout(()=>{
            setShowPositiveMessage(false)
            newClass[selectedItem][first.dayIndex][first.periodIndex] = period2;
        newClass[selectedItem][second.dayIndex][second.periodIndex] = period1;

        // Swap teacher periods
        newTeacher[teacher1][second.dayIndex][second.periodIndex] =
          newTeacher[teacher1][first.dayIndex][first.periodIndex];
        newTeacher[teacher1][first.dayIndex][first.periodIndex] = "Free";

        newTeacher[teacher2][first.dayIndex][first.periodIndex] =
          newTeacher[teacher2][second.dayIndex][second.periodIndex];
        newTeacher[teacher2][second.dayIndex][second.periodIndex] = "Free";

        setCurrentClassTimeTable(newClass);
        setCurrentTeacherTimeTable(newTeacher);
        setSelectedPeriods([]);
        },500)
        // Swap class periods
        
      }else{
        setShowNegativeMessage(true)
        setTimeout(()=>{
            setShowNegativeMessage(false)
            setSelectedPeriods([]);
        },500)
      }

      
    }
  };

  const handleReset = () => {
    setCurrentClassTimeTable(classTimetable);
    setCurrentTeacherTimeTable(teacherTimetable);
    setSelectedPeriods([]);
  };

  const handleSave = async () => {
    
    const timetableData = {
      class_timetable: currentClassTimeTable,
      teacher_timetable: currentTeacherTimeTable,
      message: "✅ Timetable generated successfully",
      status: "FEASIBLE",
      userId: user.id,
      title: title
    };
    if (id) {
      console.log("updating")
      const token = await getToken();
      const response = await fetchWithAuth(token,
        `http://localhost:8000/update-timetable/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(timetableData),
        }
      );
      const result = await response.json();
      console.log(result)
      navigate(`/display/${result.id}`, {
        state: {
          classTimetable: timetableData.class_timetable,
          teacherTimetable: timetableData.teacher_timetable,
          timetableId: id,
        },
      });
    } else {
      const token = await getToken();
      const response = await fetchWithAuth(token,"http://localhost:8000/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(timetableData),
      });
      const result = await response.json();

      navigate(`/display/${result.id}`, {
        state: {
          classTimetable: timetableData.class_timetable,
          teacherTimetable: timetableData.teacher_timetable,
          timetableId: result._id,
        },
      });
    }
  };

  const renderTimetable = (data) => {
    if (!data || data.length === 0) {
      return <div className="text-center p-4">No data available</div>;
    }

    return (
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>Day/Period</th>
              {periods.slice(0, data[0]?.length || 8).map((period, index) => (
                <th key={index} className="text-center">
                  {period}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((dayData, dayIndex) => (
              <tr key={dayIndex}>
                <td className="fw-bold">{days[dayIndex]}</td>
                {dayData.map((period, periodIndex) => (
                  <td
                    key={periodIndex}
                    style={{cursor:"pointer"}}
                    className={`text-center ${
                      selectedPeriods.some(
                        (sel) =>
                          sel.dayIndex === dayIndex &&
                          sel.periodIndex === periodIndex
                      )
                        ? "bg-success"
                        : ""
                    }`}
                    onClick={() => handlePeriodSwap(dayIndex, periodIndex)}
                  >
                    {period === "Free" || period === "" ? (
                      <span className="text-muted">Free</span>
                    ) : (
                      <span className="badge bg-primary">{period}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container-fluid p-4 dark-gradient-bg">
      <div className="row mb-4">
        <div className="col-md-6 d-flex align-items-center gap-4">
          <div className="btn-group" role="group">
            <button type="button" className={`btn btn-success`} onClick={handleSave} data-bs-dismiss="modal">
              Save Changes
            </button>
            <button
              type="button"
              className={`btn btn-warning`}
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
          <div className="">
            <p className="">{showPositiveMessage ? "Updating..." : (showNegativeMessage ? "Cannot swap" : null)}</p>
          </div>
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
          >
            <option value="">Select Class</option>
            {items.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedItem && (
        <div className="card">
          <div className="card-header">
            <h4 className="mb-0">Class : {selectedItem}</h4>
          </div>
          <div className="card-body">
            {renderTimetable(currentData[selectedItem])}
          </div>
        </div>
      )}

      {!selectedItem && (
        <div className="alert alert-info text-center">
          Please select a class to view the timetable
        </div>
      )}
    </div>
  );
};

export default EditTimetable;
