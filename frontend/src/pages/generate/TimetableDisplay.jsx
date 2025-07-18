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
  const [selectedItem, setSelectedItem] = useState("all");
  const [classTimetable, setClassTimetable] = useState(initialClass || []);
  const [teacherTimetable, setTeacherTimetable] = useState(
    initialTeacher || []
  );
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
  if (location.state) {
    if (location.state.classTimetable || location.state.teacherTimetable) {
      setClassTimetable(location.state.classTimetable);
      setTeacherTimetable(location.state.teacherTimetable);
    }

    if (location.state.message && location.state.status === "ERROR") {
      setErrorMessage(location.state.message);
    }
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
    if (items.length > 0 && selectedItem !== "all" && !selectedItem) {
      setSelectedItem(items[0]);
    }
  }, [items, selectedItem]);

  if (
  (!classTimetable || Object.keys(classTimetable).length === 0) &&
  (!teacherTimetable || Object.keys(teacherTimetable).length === 0)
) {
  return (
    <div className="dark-gradient-bg-td">
      <div className="container-td">
        <div className="no-data-alert-td">
          {errorMessage
            ? errorMessage
            : "No timetable data available."}
        </div>
      </div>
    </div>
  );
}


  const exportAsPDF = async () => {
  const isAll = selectedItem === "all";
  const itemsToExport = isAll ? items : [selectedItem];
  const container = document.createElement("div");

  // Style container
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "1120px"; // ~A4 width in px at 96 DPI
  container.style.padding = "20px";
  container.style.backgroundColor = "#fff";
  container.style.color = "#000";
  container.style.fontFamily = "Arial, sans-serif";

  // Optional title
  const title = document.createElement("h2");
  title.textContent = isAll
    ? `All ${viewMode === "class" ? "Class" : "Teacher"} Timetables`
    : `${viewMode === "class" ? "Class" : "Teacher"}: ${selectedItem}`;
  title.style.textAlign = "center";
  title.style.marginBottom = "30px";
  container.appendChild(title);

  // Loop through items (all or just one)
  for (const item of itemsToExport) {
    const data = currentData[item];
    if (!data || !data.length) continue;

    const section = document.createElement("div");
    section.style.marginBottom = "40px";

    const header = document.createElement("h3");
    header.textContent = `${viewMode === "class" ? "Class" : "Teacher"}: ${item}`;
    header.style.marginBottom = "10px";
    header.style.textAlign = "left";
    header.style.color = "#000";
    section.appendChild(header);

    // Create simple clean table
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.fontSize = "12px";

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");

    const thDay = document.createElement("th");
    thDay.textContent = "Day/Period";
    thDay.style.border = "1px solid #000";
    thDay.style.padding = "6px";
    thDay.style.backgroundColor = "#eaeaea";
    headRow.appendChild(thDay);

    periods.slice(0, data[0].length).forEach((period) => {
      const th = document.createElement("th");
      th.textContent = period;
      th.style.border = "1px solid #000";
      th.style.padding = "6px";
      th.style.backgroundColor = "#eaeaea";
      headRow.appendChild(th);
    });

    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    data.forEach((rowData, dayIndex) => {
      const tr = document.createElement("tr");

      const tdDay = document.createElement("td");
      tdDay.textContent = days[dayIndex];
      tdDay.style.border = "1px solid #000";
      tdDay.style.padding = "6px";
      tdDay.style.backgroundColor = "#f5f5f5";
      tr.appendChild(tdDay);

      rowData.forEach((period) => {
        const td = document.createElement("td");
        td.textContent = period || "Free";
        td.style.border = "1px solid #000";
        td.style.padding = "6px";
        td.style.textAlign = "center";
        td.style.color = "#000";
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    section.appendChild(table);
    container.appendChild(section);
  }

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 1.5,
      useCORS: true,
      backgroundColor: "#ffffff"
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.9); // Good compression
    const pdf = new jsPDF("portrait", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    if (imgHeight > pdf.internal.pageSize.getHeight()) {
      let y = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();
      while (y < imgHeight) {
        if (y > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, -y, pdfWidth, imgHeight);
        y += pageHeight;
      }
    } else {
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, imgHeight);
    }

    const filename = isAll
      ? `all_${viewMode}_timetables.pdf`
      : `${viewMode}_${selectedItem}_timetable.pdf`;

    pdf.save(filename);
  } catch (err) {
    console.error("PDF export failed", err);
    alert("PDF export failed. Please try again.");
  } finally {
    document.body.removeChild(container);
  }
};


  const exportAsExcel = () => {
    const wb = XLSX.utils.book_new();
    const combined = [];

    if (selectedItem === "all") {
      items.forEach((item) => {
        const data = currentData[item];
        if (data) {
          combined.push([`${viewMode === "class" ? "Class" : "Teacher"}: ${item}`]);
          combined.push(["Day/Period", ...periods.slice(0, data[0]?.length || 8)]);
          data.forEach((row, i) => {
            combined.push([days[i], ...row]);
          });
          combined.push([]); // empty row between timetables
        }
      });
    } else {
      const data = currentData[selectedItem];
      if (data) {
        combined.push(["Day/Period", ...periods.slice(0, data[0]?.length || 8)]);
        data.forEach((row, i) => {
          combined.push([days[i], ...row]);
        });
      }
    }

    const ws = XLSX.utils.aoa_to_sheet(combined);
    XLSX.utils.book_append_sheet(wb, ws, "Timetables");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    const filename = selectedItem === "all" 
      ? `all_${viewMode}_timetables.xlsx`
      : `${viewMode}_${selectedItem}_timetable.xlsx`;

    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      filename
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

  const renderAllTimetables = () => {
    if (!currentData || Object.keys(currentData).length === 0) {
      return <div className="no-data-message-td">No data available</div>;
    }

    return (
      <div className="all-timetables-container">
        {items.map((item) => (
          <div key={item} className="individual-timetable-section" style={{ marginBottom: '3rem' }}>
            <h5 style={{
              marginBottom: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#f8f9fa',
              color: '#212529',
              borderRadius: '8px',
              fontWeight: 'bold'
            }}>
              {viewMode === "class" ? "Class" : "Teacher"}: {item}
            </h5>
            {renderTimetable(currentData[item])}
          </div>
        ))}
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
                    setSelectedItem("all");
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
                    setSelectedItem("all");
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
                <option value="all">
                  All {viewMode === "class" ? "Classes" : "Teachers"}
                </option>
                {items.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="timetable-card-td">
            <div
              className="card-header-td"
              style={{ paddingRight: "1rem", paddingLeft: "1rem" }}
            >
              <h4 className="card-title-td">
                {selectedItem === "all" 
                  ? `All ${viewMode === "class" ? "Classes" : "Teachers"}` 
                  : `${viewMode === "class" ? "Class" : "Teacher"}: ${selectedItem}`
                }
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
              {selectedItem === "all" 
                ? renderAllTimetables() 
                : renderTimetable(currentData[selectedItem])
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableDisplay;