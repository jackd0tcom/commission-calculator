import { capitalize, skewerCase } from "../../helpers";
import { useState, useEffect, useRef } from "react";

interface props {
  currentStatus: string;
  handleUpdateStatus: any;
}

const OrderStatusPicker = ({ currentStatus, handleUpdateStatus }: props) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const statuses = [
    "staged",
    "ordered",
    "in progress",
    "cancelled",
    "support needed",
    "complete",
  ];

  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      // Don't close if clicking on the project-picker-button or its children
      const isButtonClick = event.target.closest(".order-status-button");
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
    <div className="order-status-picker">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`order-status-button ${skewerCase(currentStatus)}-button`}
      >
        {capitalize(currentStatus)}
      </button>
      {showDropdown && (
        <div
          className="dropdown order-status-picker-dropdown"
          ref={dropdownRef}
        >
          {statuses.map((status: any) => (
            <div
              className="dropdown-item"
              onClick={() => {
                handleUpdateStatus(status);
                setShowDropdown(false);
              }}
            >
              <button
                className={`order-status-button ${skewerCase(status)}-button`}
              >
                {capitalize(status)}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default OrderStatusPicker;
