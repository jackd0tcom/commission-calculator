import { useState } from "react";
import ProfilePic from "../UI/ProfilePic";

const AdminUserToggle = ({ user, handleRoleChange }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);

  const handleRoleToggle = async () => {
    setRoleLoading(true);
    try {
      await handleRoleChange(user);
    } finally {
      setRoleLoading(false);
    }
  };

  return (
    <div className="admin-user-toggle-wrapper">
      <div className="toggle-container">
        <p>User</p>
        <label htmlFor={`allow-toggle-${user.userId}`} className="switch">
          <input
            type="checkbox"
            onChange={handleRoleToggle}
            name={`allow-toggle-${user.userId}`}
            id={`allow-toggle-${user.userId}`}
            checked={user.isAdmin}
            disabled={isLoading}
          />
          <span className="slider round"></span>
        </label>
        <p>Admin</p>
      </div>
    </div>
  );
};
export default AdminUserToggle;
