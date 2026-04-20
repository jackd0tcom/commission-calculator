import { useState, useEffect, useRef } from "react";

interface props {
  users: any;
  currentUserId: number;
  handleSelectUser: any;
}

const UserSelector = ({ users, currentUserId, handleSelectUser }: props) => {
  const [showDropDown, setShowDropDown] = useState(false);
  const dropdownRef = useRef<HTMLInputElement>(null);

  const currentUser = users?.find((user: any) => user.userId === currentUserId);

  //   Handles blur
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      // Don't close if clicking on the project-picker-button or its children
      const isButtonClick = event.target.closest(".product-picker-button");
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !isButtonClick
      ) {
        setShowDropDown(false);
      }
    };

    if (showDropDown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropDown]);

  return (
    <div className="user-selector-wrapper">
      <img
        src={currentUser?.profilePic ?? "/default-profile-pic.jpg"}
        className="profile-image user-picker-button"
        onClick={() => setShowDropDown(!showDropDown)}
      />
      {showDropDown && (
        <div className="dropdown user-selector-dropdown" ref={dropdownRef}>
          {users?.map((user: any) => (
            <div
              className="dropdown-item user-selector-item"
              onClick={() => {
                handleSelectUser(user.userId);
                setShowDropDown(false);
              }}
            >
              <img
                src={user?.profilePic ?? "/default-profile-pic.jpg"}
                className="profile-image"
              />
              <p>
                {user.firstName ?? ""} {user.lastName ?? ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default UserSelector;
