import { useState, useEffect } from "react";
import axios from "axios";
import ProfilePic from "../components/UI/ProfilePic";
import AdminUserToggle from "../components/UI/AdminUserToggle";

const Admin = () => {
  const [userList, setUserList] = useState([{}]);

  const fetchUsers = async () => {
    try {
      await axios.get("/api/getUsers").then((res) => {
        if (res.status === 200) {
          setUserList(res.data);
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (user) => {
    try {
      const response = await axios.post("/api/updateAdmin", {
        userId: user.userId,
      });

      if (response.status === 200) {
        console.log(response.data);
        // Update the user in place
        setUserList((prevUsers) =>
          prevUsers.map((u) =>
            u.userId === user.userId ? { ...u, isAdmin: !user.isAdmin } : u,
          ),
        );
      }
    } catch (error) {
      console.error("❌ Failed to update user role:", error);
      // Optionally show an error message
    }
  };

  return (
    <div className="admin-page-wrapper">
      <div className="page-header-wrapper">
        <h2>Admin</h2>
      </div>
      <div className="user-list-wrapper">
        <div className="user-list-item user-list-head">
          <p></p>
          <p>Name</p>
          <p>Email</p>
          <p>Admin</p>
        </div>
        {userList?.length > 0 ? (
          userList.map((user) => (
            <div className="user-list-item">
              <ProfilePic />
              <p>
                {user.firstName} {user.lastName}
              </p>
              <p>{user.email}</p>
              <AdminUserToggle
                user={user}
                handleRoleChange={handleRoleChange}
              />
            </div>
          ))
        ) : (
          <div className="user-list-item">
            <p></p>
            <p>No users to show</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default Admin;
