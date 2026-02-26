import { useAuth0 } from "@auth0/auth0-react";

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();
  return (
    <button onClick={() => loginWithRedirect()} className="button login">
      <img src="/public/google-logo.png" className="google-logo" alt="" />
      Log in with Google
    </button>
  );
};

export default LoginButton;
