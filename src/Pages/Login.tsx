import LoginButton from "../components/authentication/LoginButton";

const Login = () => {
  return (
    <div className="login-page-wrapper">
      <div className="login-copy-wrapper">
        <img src="public/p1p-logo-white.png" className="login-logo" alt="" />
        <h2>Commission Portal</h2>
        <LoginButton />
      </div>
    </div>
  );
};
export default Login;
