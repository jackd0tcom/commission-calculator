import { capitalize, skewerCase } from "../../helpers";
import { useState, useEffect, useRef } from "react";
import axios from "axios";

interface props {
  bulkSelects: any;
  setOrderItems: any;
  setBulkSelects: any;
}

const BulkStatusPicker = ({
  bulkSelects,
  setOrderItems,
  setBulkSelects,
}: props) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  let currentStatus = "Staged";

  const statuses = [
    "staged",
    "ordered",
    "in progress",
    "cancelled",
    "support needed",
    "complete",
  ];

  const handleUpdateStatus = async (status: string) => {
    try {
      await axios
        .post("/api/bulkUpdateOrderStatus", {
          itemStatus: status,
          items: bulkSelects,
        })
        .then((res) => {
          const updatedItems = res.data;
          if (updatedItems.length <= 0) {
            return;
          }
          setOrderItems((prev: any[]) => {
            const filtered = prev.filter(
              (item) =>
                !updatedItems.some(
                  (updated: any) => updated.itemId === item.itemId,
                ),
            );
            const added = [...filtered, ...updatedItems];
            const sorted = added.sort((a, b) => a.orderIndex - b.orderIndex);
            console.log(sorted);
            return sorted;
          });
          setBulkSelects([]);
        });
    } catch (error) {
      console.log(error);
    }
  };

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
export default BulkStatusPicker;
