import { useState, useEffect, useRef } from "react";

const DropdownChecklist = ({ options, selected, onChange }) => {
  const [show, setShow] = useState(false);
  const dropdownRef = useRef(null);

  const toggleOption = (option) => {
    let updated = [];
    if (selected.includes(option)) {
      updated = selected.filter((o) => o !== option);
    } else {
      updated = [...selected, option];
    }
    onChange && onChange(updated);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShow(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="w-100" ref={dropdownRef}>
      <button
        className="rounded-2 border border-0 me-3 p-2 d-flex align-items-center mb-3 form-select w-100"
        style={{
          whiteSpace: "nowrap",
          overflowX: "auto",
          textOverflow: "ellipsis",
        }}
        type="button"
        onClick={() => setShow(!show)}
      >
        {selected.length > 0 ? selected.join(", ") : "Select Subjects"}
      </button>

      {show && (
        <div className="dropdown-menu d-block p-2 border border-1 shadow">
          {options.map((option, idx) => (
            <div key={idx} className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggleOption(option)}
                id={`check-${idx}`}
              />
              <label className="form-check-label">{option}</label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownChecklist;
