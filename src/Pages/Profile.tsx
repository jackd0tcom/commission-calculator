import { useAuth0 } from "@auth0/auth0-react";
import LogoutButton from "../components/authentication/LogoutButton";
import LoginButton from "../components/authentication/LoginButton";
import { useSelector } from "react-redux";

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const localUser = useSelector((state: any) => state.user);

  if (isLoading) {
    return <div className="loading-text">Loading profile...</div>;
  }

  return isAuthenticated && user ? (
    <div className="profile-page-wrapper">
      <div className="page-header-wrapper">
        <h2>Profile</h2>
      </div>
      <div className="profile-wrapper">
        <div className="profile-container">
          <img
            src={
              user.picture ||
              `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='110' height='110' viewBox='0 0 110 110'%3E%3Ccircle cx='55' cy='55' r='55' fill='%2363b3ed'/%3E%3Cpath d='M55 50c8.28 0 15-6.72 15-15s-6.72-15-15-15-15 6.72-15 15 6.72 15 15 15zm0 7.5c-10 0-30 5.02-30 15v3.75c0 2.07 1.68 3.75 3.75 3.75h52.5c2.07 0 3.75-1.68 3.75-3.75V72.5c0-9.98-20-15-30-15z' fill='%23fff'/%3E%3C/svg%3E`
            }
            alt={user.name || "User"}
            className="profile-picture"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='110' height='110' viewBox='0 0 110 110'%3E%3Ccircle cx='55' cy='55' r='55' fill='%2363b3ed'/%3E%3Cpath d='M55 50c8.28 0 15-6.72 15-15s-6.72-15-15-15-15 6.72-15 15 6.72 15 15 15zm0 7.5c-10 0-30 5.02-30 15v3.75c0 2.07 1.68 3.75 3.75 3.75h52.5c2.07 0 3.75-1.68 3.75-3.75V72.5c0-9.98-20-15-30-15z' fill='%23fff'/%3E%3C/svg%3E`;
            }}
          />
          <div className="profile-copy">
            {localUser.isAdmin && <div className="admin-badge">Admin</div>}
            <div className="profile-name">{user.name}</div>
            <div className="profile-email">{user.email}</div>
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  ) : (
    <LoginButton />
  );
};

export default Profile;
