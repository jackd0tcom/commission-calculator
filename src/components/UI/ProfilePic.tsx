import { useSelector } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";

interface props {
  src: string;
}

const ProfilePic = ({ src }: props) => {
  const { isAuthenticated, isLoading, user } = useAuth0();
  const [imageSrc, setImageSrc] = useState(src || user?.picture);
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    if (!hasError && imageSrc !== "/default-profile-pic.jpg") {
      setHasError(true);
      setImageSrc("/default-profile-pic.jpg");
    }
  };

  // If no src prop provided, use the Auth0 user picture (for backward compatibility)
  const displaySrc = src || user?.picture;

  if (!isAuthenticated && !src) {
    return null;
  }

  return (
    <div className="profile-pic-wrapper">
      <img
        src={imageSrc}
        alt={"Profile picture"}
        className={`profile-image`}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
};

export default ProfilePic;
