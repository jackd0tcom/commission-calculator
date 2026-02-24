import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { capitalize } from "../../helpers";

interface props {
  sheetId: number;
  sheetData: any;
  setSheetData: any;
}

const StatusPicker = ({ sheetId, sheetData, setSheetData }: props) => {
  const dropdownRef = useRef(null);
  const [currentStatus, setCurrentStatus] = useState(
    sheetData.sheetStatus ? sheetData.sheetStatus : "draft",
  );
  const [showDropdown, setShowDropdown] = useState(false);

  const statuses = ["draft", "submitted", "archived"];

  const handleStatusChange = async (status: string) => {
    try {
      await axios
        .post("/api/updateSheet", {
          sheetId,
          fieldName: "sheetStatus",
          value: currentStatus,
        })
        .then((res) => {
          if (res.status === 200) {
            setCurrentStatus(status);
            setSheetData({ ...sheetData, sheetStatus: status });
            setShowDropdown(false);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };
  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on the project-picker-button or its children
      const isButtonClick = event.target.closest(".user-picker-button");
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !isButtonClick
      ) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="status-picker-wrapper">
      <button
        onClick={() =>
          showDropdown ? setShowDropdown(false) : setShowDropdown(true)
        }
        className="status-picker-button"
      >
        {capitalize(currentStatus)}
      </button>
      {showDropdown && (
        <div className="dropdown status-picker-dropdown" ref={dropdownRef}>
          {statuses.map((status) => (
            <div
              onClick={() => handleStatusChange(status)}
              className="dropdown-item status-item"
            >
              {capitalize(status)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default StatusPicker;
