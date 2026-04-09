import { capitalize, skewerCase } from "../../helpers";
import { useState, useEffect } from "react";

interface props {
  currentStatus: string;
  handleUpdateStatus: any;
}

const OrderStatusPicker = ({ currentStatus, handleUpdateStatus }: props) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const statuses = [
    "draft",
    "staged",
    "ordered",
    "in progress",
    "cancelled",
    "support needed",
    "complete",
  ];

  return (
    <div className="order-status-picker">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`order-status-button ${skewerCase(currentStatus)}-button`}
      >
        {capitalize(currentStatus)}
      </button>
      {showDropdown && (
        <div className="dropdown order-status-picker-dropdown">
          {statuses.map((status: any) => (
            <div className="dropdown-item">
              <button
                className={`order-status-button ${skewerCase(currentStatus)}-button`}
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
