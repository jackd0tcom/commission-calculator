import { useState, useEffect, useRef } from "react";

interface props {
  handleDeleteClient: any;
  client: any;
  isEditing: any;
  setIsEditing: any;
}

const ClientItemSettings = ({
  handleDeleteClient,
  client,
  isEditing,
  setIsEditing,
}: props) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const dropdownRef = useRef(null);

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

  return isDeleting ? (
    <div className="product-delete-modal">
      <p>Are you sure you want to delete {client.clientName}?</p>
      <div>
        <button
          className="delete-product"
          onClick={() => {
            handleDeleteClient(client.clientId);
            setIsDeleting(false);
          }}
        >
          Delete
        </button>
        <button
          className="cancel-delete-product"
          onClick={() => setIsDeleting(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  ) : isEditing ? (
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
