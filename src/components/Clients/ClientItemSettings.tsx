import { useState, useEffect, useRef } from "react";

interface props {
  handleDeleteClient: any;
  client: any;
  isEditing: any;
  setIsEditing: any;
  setIsDeleting: any;
}

const ClientItemSettings = ({
  setIsDeleting,
  isEditing,
  setIsEditing,
}: props) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLInputElement>(null);

  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      // Don't close if clicking on the project-picker-button or its children
      const isButtonClick = event.target.closest(".vendor-picker-button");
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

  return isEditing ? (
    <button
      className="save-button"
      onClick={() => {
        setIsEditing(false);
        setShowDropdown(false);
      }}
    >
      Save
    </button>
  ) : (
    <div className="client-item-settings">
      <button
        className="client-settings-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        ...
      </button>
      {showDropdown && (
        <div className="dropdown client-settings-dropdown" ref={dropdownRef}>
          <div
            className="dropdown-item client-settings-item"
            onClick={() => setIsEditing(true)}
          >
            Edit
          </div>
          <div
            className="dropdown-item client-settings-item"
            onClick={() => setIsDeleting(true)}
          >
            Delete
          </div>
        </div>
      )}
    </div>
  );
};
export default ClientItemSettings;
