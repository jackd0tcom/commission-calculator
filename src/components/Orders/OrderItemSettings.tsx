import { useState, useEffect, useRef } from "react";

interface props {
  item: any;
  handleDeleteItem: any;
}

const OrderItemSettings = ({ item, handleDeleteItem }: props) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      // Don't close if clicking on the project-picker-button or its children
      const isButtonClick = event.target.closest(".order-item-settings-button");
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
    <div className="order-item-settings">
      <button
        className="order-item-settings-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        ...
      </button>
      {showDropdown && (
        <div
          className="dropdown order-item-settings-dropdown"
          ref={dropdownRef}
        >
          <div
            className="dropdown-item order-item-settings-item"
            onClick={() => handleDeleteItem()}
          >
            Delete Item
          </div>
        </div>
      )}
    </div>
  );
};
export default OrderItemSettings;
