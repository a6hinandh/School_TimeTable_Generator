import React, { useState,useEffect } from 'react';
import { useLocation } from 'react-router';
import EditTimetable from "./components/EditTimetable";

const TimetableDisplay = ({ classTimetable:initialClass, teacherTimetable:initialTeacher, timetableId="" }) => {
  const location = useLocation();
  const [viewMode, setViewMode] = useState('class');
  const [selectedItem, setSelectedItem] = useState('');
  const [classTimetable, setClassTimetable] = useState(initialClass || []);
  const [teacherTimetable, setTeacherTimetable] = useState(initialTeacher || []);
  const [id,setId] = useState(timetableId)
  console.log(classTimetable)

   useEffect(() => {
    if (location.state && (!initialClass || !initialTeacher)) {
      setClassTimetable(location.state.classTimetable);
      setTeacherTimetable(location.state.teacherTimetable);
      setId(location.state.id)
    }
  }, [location]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6', 'Period 7', 'Period 8'];

  const currentData = viewMode === 'class' ? classTimetable : teacherTimetable;
  const items = currentData ? Object.keys(currentData) : [];

  // Auto-select first item when data is available
  React.useEffect(() => {
    if (items.length > 0 && !selectedItem) {
      setSelectedItem(items[0]);
    }
  }, [items, selectedItem]);

  if (!classTimetable || !teacherTimetable) {
    return <div className="text-center p-4">No timetable data available</div>;
  }

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
                <th key={index} className="text-center">{period}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((dayData, dayIndex) => (
              <tr key={dayIndex}>
                <td className="fw-bold">{days[dayIndex]}</td>
                {dayData.map((period, periodIndex) => (
                  <td key={periodIndex} className="text-center">
                    {period === 'Free' || period === '' ? (
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
        <div className="col-md-6">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${viewMode === 'class' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => {
                setViewMode('class');
                setSelectedItem(Object.keys(classTimetable)[0] || '');
              }}
            >
              Class Timetables
            </button>
            <button
              type="button"
              className={`btn ${viewMode === 'teacher' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => {
                setViewMode('teacher');
                setSelectedItem(Object.keys(teacherTimetable)[0] || '');
              }}
            >
              Teacher Timetables
            </button>
          </div>
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
          >
            <option value="">Select {viewMode === 'class' ? 'Class' : 'Teacher'}</option>
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
            <h4 className="mb-0">
              {viewMode === 'class' ? 'Class' : 'Teacher'}: {selectedItem}
            </h4>
          </div>
          <div className="card-body">
            {renderTimetable(currentData[selectedItem])}
          </div>
        </div>
      )}

      {!selectedItem && (
        <div className="alert alert-info text-center">
          Please select a {viewMode === 'class' ? 'class' : 'teacher'} to view the timetable
        </div>
      )}
      <button
                type="button"
                className="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#exampleModal"
              >
                Edit timetable
              </button>
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
                  <EditTimetable classTimetable={classTimetable} teacherTimetable={teacherTimetable} id={id}/>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                  
                </div>
              </div>
            </div>
          </div>
    </div>
  );
};

export default TimetableDisplay;