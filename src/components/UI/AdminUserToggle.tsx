interface props {
  user: any;
  handleRoleChange: any;
  headings: any;
  role: string;
  checked: boolean;
}

const AdminUserToggle = ({
  user,
  handleRoleChange,
  headings,
  role,
  checked,
}: props) => {
  const handleRoleToggle = async () => {
    await handleRoleChange(user, role);
  };

  return (
    <div className="admin-user-toggle-wrapper">
      <div className="toggle-container">
        <p>{headings[0]}</p>
        <label className="switch">
          <input
            type="checkbox"
            onChange={handleRoleToggle}
            checked={checked}
          />
          <span className="slider round"></span>
        </label>
        <p>{headings[1]}</p>
      </div>
    </div>
  );
};
export default AdminUserToggle;
