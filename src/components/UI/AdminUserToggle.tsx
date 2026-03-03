import { useState } from "react";

interface props {
  user: any;
  handleRoleChange: any;
}

const AdminUserToggle = ({ user, handleRoleChange }: props) => {
  const handleRoleToggle = async () => {
    await handleRoleChange(user);
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
          />
          <span className="slider round"></span>
        </label>
        <p>Admin</p>
      </div>
    </div>
  );
};
export default AdminUserToggle;
