import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { fetchWithAuth } from "../../../utils/fetchWithAuth";
import { useAuth, useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import "./EditTimetable.css";
const EditTimetable = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { classTimetable, teacherTimetable, id } = location.state;
  const { getToken } = useAuth();
  const { user } = useUser();
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedPeriods, setSelectedPeriods] = useState([]);
  const [currentClassTimeTable, setCurrentClassTimeTable] =
    useState(classTimetable);
  const [currentTeacherTimeTable, setCurrentTeacherTimeTable] =
    useState(teacherTimetable);

  const [showPositiveMessage, setShowPositiveMessage] = useState(false);
  const [showNegativeMessage, setShowNegativeMessage] = useState(false);

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
    return (
      <div className="dark-gradient-bg-ett">
        <div className="container-ett">
          <div className="no-data-alert-ett">
            <div className="no-data-message-ett">
              No timetable data available
            </div>
          </div>
        </div>
      </div>
    );
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
        period1 !== "Free" && period1 !== ""
          ? period1.split("(")[1].split(")")[0]
          : null;
      let teacher2 =
        period2 !== "Free" && period2 !== ""
          ? period2.split("(")[1].split(")")[0]
          : null;
      console.log(teacher1, teacher2);

      if (
        teacher1 &&
        teacher2 &&
        newTeacher[teacher1][second.dayIndex][second.periodIndex] === "Free" &&
        newTeacher[teacher2][first.dayIndex][first.periodIndex] === "Free"
      ) {
        setShowPositiveMessage(true);
        setTimeout(() => {
          setShowPositiveMessage(false);
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
        }, 500);
      } else {
        setShowNegativeMessage(true);
        setTimeout(() => {
          setShowNegativeMessage(false);
          setSelectedPeriods([]);
        }, 500);
      }
    }
  };

  const handleReset = () => {
    setCurrentClassTimeTable(classTimetable);
    setCurrentTeacherTimeTable(teacherTimetable);
    setSelectedPeriods([]);
  };

  const handleSave = async () => {
    try {
      const timetableData = {
        class_timetable: currentClassTimeTable,
        teacher_timetable: currentTeacherTimeTable,
        teacherData: location.state.teacherData,
        classes: location.state.classes,
        subjects: location.state.subjects,
        workingDays: location.state.workingDays,
        periods: location.state.periods ,
        title: location.state.title ,
        userId : user.id,
      };
      if (id) {
        const token = await getToken();
        const response = await fetchWithAuth(
          token,
          `${import.meta.env.VITE_API_BASE_URL}/update-timetable/${id}`,
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
        navigate(`/display/${id}`, {
          state: {
            classTimetable: timetableData.class_timetable,
            teacherTimetable: timetableData.teacher_timetable,
            timetableId: id,
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
          `${import.meta.env.VITE_API_BASE_URL}/add`,
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
        navigate(`/display/${result._id}`, {
          state: {
            classTimetable: timetableData.class_timetable,
            teacherTimetable: timetableData.teacher_timetable,
            timetableId: result._id,
            teacherData: result.teacherData,
            classes: result.classes,
            subjects: result.subjects,
            workingDays: result.workingDays,
            periods: result.periods,
            title: result.title,
          },
        });
      }

    } catch (error) {
      console.log(error);
      toast.error(error)
    }
  };

  const renderTimetable = (data) => {
    if (!data || data.length === 0) {
      return (
        <div className="no-data-alert-ett">
          <div className="no-data-message-ett">No data available</div>
        </div>
      );
    }

    return (
      <div className="table-container-ett">
        <table className="timetable-table-ett">
          <thead className="table-header-ett">
            <tr>
              <th className="header-cell-ett">Day/Period</th>
              {periods.slice(0, data[0]?.length || 8).map((period, index) => (
                <th key={index} className="header-cell-ett period-header-ett">
                  {period}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="table-body-ett">
            {data.map((dayData, dayIndex) => (
              <tr key={dayIndex} className="table-row-ett">
                <td className="day-cell-ett">{days[dayIndex]}</td>
                {dayData.map((period, periodIndex) => (
                  <td
                    key={periodIndex}
                    className={`period-cell-ett ${
                      selectedPeriods.some(
                        (sel) =>
                          sel.dayIndex === dayIndex &&
                          sel.periodIndex === periodIndex
                      )
                        ? "selected-ett"
                        : ""
                    }`}
                    onClick={() => handlePeriodSwap(dayIndex, periodIndex)}
                  >
                    {period === "Free" || period === "" ? (
                      <span className="free-period-ett">Free</span>
                    ) : (
                      <span className="subject-badge-ett">{period}</span>
                    )}
                    {/* {selectedPeriods.some(
                      (sel) =>
                        sel.dayIndex === dayIndex &&
                        sel.periodIndex === periodIndex
                    ) && <div className="selection-indicator-ett">Selected</div>} */}
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
    <div className="dark-gradient-bg-ge">
      <div className="container" style={{ padding: "5rem", paddingTop: 0 }}>
        {/* Instruction Message */}
        <div className="instruction-message-ett">
          <div className="instruction-title-ett">How to Edit Timetable</div>
          <div className="instruction-text-ett">
            Select two periods to swap them. The system will automatically check
            if teachers are available for the swap.
          </div>
        </div>

        {/* Controls Section */}
        <div className="controls-section-ett">
          <div className="action-controls-ett" style={{ paddingLeft: "1rem" }}>
            <div className="button-group-ett">
              <button
                type="button"
                className="action-button-ett save-button-ett"
                onClick={handleSave}
              >
                <span>💾</span>
                Save Changes
              </button>
              <button
                type="button"
                className="action-button-ett reset-button-ett"
                onClick={handleReset}
              >
                <span>🔄</span>
                Reset
              </button>
            </div>
            <div
              className={`status-message-ett ${
                showPositiveMessage
                  ? "status-positive-ett"
                  : showNegativeMessage
                  ? "status-negative-ett"
                  : ""
              }`}
            >
              {showPositiveMessage
                ? "✅ Updating..."
                : showNegativeMessage
                ? "❌ Cannot swap - Teacher conflict"
                : "Ready to edit"}
            </div>
          </div>
          <div className="selector-controls-ett">
            <select
              className="item-selector-ett"
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

        {/* Timetable Card */}
        {selectedItem && (
          <div className="timetable-card-ett">
            <div className="card-header-ett" style={{ paddingLeft: "1rem" }}>
              <h4 className="card-title-ett">Class: {selectedItem}</h4>
            </div>
            <div className="card-body-ett">
              {renderTimetable(currentData[selectedItem])}
            </div>
          </div>
        )}

        {/* No Selection Alert */}
        {!selectedItem && (
          <div className="info-alert-ett">
            Please select a class to view and edit the timetable
          </div>
        )}
      </div>
    </div>
  );
};

export default EditTimetable;
