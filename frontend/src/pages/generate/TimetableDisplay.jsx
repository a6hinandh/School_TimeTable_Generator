import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import EditTimetable from "./components/EditTimetable";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import "./TimetableDisplay.css";

const TimetableDisplay = ({
  classTimetable: initialClass,
  teacherTimetable: initialTeacher,
  showEditOptions,
}) => {
  const location = useLocation();
  const [viewMode, setViewMode] = useState("class");
  const [selectedItem, setSelectedItem] = useState("");
  const [classTimetable, setClassTimetable] = useState(initialClass || []);
  const [teacherTimetable, setTeacherTimetable] = useState(
    initialTeacher || []
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (location.state && (!initialClass || !initialTeacher)) {
      setClassTimetable(location.state.classTimetable);
      setTeacherTimetable(location.state.teacherTimetable);
    }
  }, [location]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const currentData = viewMode === "class" ? classTimetable : teacherTimetable;
  const items = currentData ? Object.keys(currentData) : [];

  useEffect(() => {
    if (items.length > 0 && !selectedItem) {
      setSelectedItem(items[0]);
    }
  }, [items, selectedItem]);

  if (!classTimetable || !teacherTimetable) {
    return (
      <div className="dark-gradient-bg-td">
        <div className="container-td">
          <div className="no-data-alert-td">No timetable data available</div>
        </div>
      </div>
    );
  }

  const exportAsPDF = async () => {
    const input = document.getElementById("timetable-container");
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape", "mm", "a4");

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
    pdf.save(`${viewMode}_${selectedItem}_timetable.pdf`);
  };

  const exportAsExcel = () => {
    const data = currentData[selectedItem];
    if (!data) return;

    const table = [
      ["Day/Period", ...periods.slice(0, data[0]?.length || 8)],
      ...data.map((row, i) => [days[i], ...row]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(table);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Timetable");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      `${viewMode}_${selectedItem}_timetable.xlsx`
    );
  };

  const renderTimetable = (data) => {
    if (!data || data.length === 0) {
      return <div className="no-data-message-td">No data available</div>;
    }

    return (
      <div className="table-container-td">
        <table className="timetable-table-td">
          <thead className="table-header-td">
            <tr>
              <th className="header-cell-td">Day/Period</th>
              {periods.slice(0, data[0]?.length || 8).map((period, index) => (
                <th key={index} className="header-cell-td period-header-td">
                  {period}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="table-body-td">
            {data.map((dayData, dayIndex) => (
              <tr key={dayIndex} className="table-row-td">
                <td className="day-cell-td">{days[dayIndex]}</td>
                {dayData.map((period, periodIndex) => (
                  <td key={periodIndex} className="period-cell-td">
                    {period === "Free" || period === "" ? (
                      <span className="free-period-td">Free</span>
                    ) : (
                      <span className="subject-badge-td">{period}</span>
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
    <div className={`${!showEditOptions ? "dark-gradient-bg-td" : ""}`}>
      <div
        className={`${!showEditOptions ? "container" : ""}`}
        style={{ padding: `${showEditOptions ? "" : "5rem"}`, paddingTop: 0 }}
      >
        {location.state?.timetableId && !showEditOptions && (
          <div className="timetable-header">
            <h2 className="section-title-ge">{location.state.title}</h2>
            <div className="action-buttons-container">
              <button
                type="button"
                className="action-button-td edit-timetable-button-td"
                onClick={() =>
                  navigate("/edit-timetable", {
                    state: {
                      classTimetable: classTimetable,
                      teacherTimetable: teacherTimetable,
                      id: location.state.timetableId,
                      teacherData: location.state.teacherData,
                    },
                  })
                }
              >
                <span className="button-icon-td">✏️</span>
                Edit timetable
              </button>

              <button
                type="button"
                className="action-button-td edit-teachers-button-td"
                onClick={() =>
                  navigate("/generate/add-teachers", {
                    state: {
                      teacherData: location.state.teacherData,
                      classes: location.state.classes,
                      subjects: location.state.subjects,
                      workingDays: location.state.workingDays,
                      periods: location.state.periods,
                      title: location.state.title,
                      timetableId: location.state.timetableId,
                    },
                  })
                }
              >
                <span className="button-icon-td">👥</span>
                Edit teachers
              </button>
            </div>
          </div>
        )}
        <div className="container-td">
          <div className="controls-section-td">
            <div className="view-mode-controls-td">
              <div className="button-group-td">
                <button
                  type="button"
                  className={`mode-button-td ${
                    viewMode === "class" ? "active-mode-td" : ""
                  }`}
                  onClick={() => {
                    setViewMode("class");
                    setSelectedItem(Object.keys(classTimetable)[0] || "");
                  }}
                >
                  Class Timetables
                </button>
                <button
                  type="button"
                  className={`mode-button-td ${
                    viewMode === "teacher" ? "active-mode-td" : ""
                  }`}
                  onClick={() => {
                    setViewMode("teacher");
                    setSelectedItem(Object.keys(teacherTimetable)[0] || "");
                  }}
                >
                  Teacher Timetables
                </button>
              </div>
            </div>
            <div
              className="selector-controls-td"
              style={{ paddingLeft: "10px" }}
            >
              <select
                className="item-selector-td"
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
              >
                <option value="">
                  Select {viewMode === "class" ? "Class" : "Teacher"}
                </option>
                {items.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedItem && (
            <div className="timetable-card-td">
              <div
                className="card-header-td"
                style={{ paddingRight: "1rem", paddingLeft: "1rem" }}
              >
                <h4 className="card-title-td">
                  {viewMode === "class" ? "Class" : "Teacher"}: {selectedItem}
                </h4>
                <div className="export-buttons-td">
                  <button
                    className="export-button-td pdf-button-td"
                    onClick={exportAsPDF}
                  >
                    <span className="button-icon-td">📄</span>
                    Export as PDF
                  </button>
                  <button
                    className="export-button-td excel-button-td"
                    onClick={exportAsExcel}
                  >
                    <span className="button-icon-td">📊</span>
                    Export as Excel
                  </button>
                </div>
              </div>
              <div className="card-body-td" id="timetable-container">
                {renderTimetable(currentData[selectedItem])}
              </div>
            </div>
          )}

          {!selectedItem && (
            <div className="info-alert-td">
              Please select a {viewMode === "class" ? "class" : "teacher"} to
              view the timetable
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimetableDisplay;
