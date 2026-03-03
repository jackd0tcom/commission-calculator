import LoginButton from "../components/authentication/LoginButton";

const Login = () => {
  return (
    <div className="login-page-wrapper">
      <div className="login-copy-wrapper">
        <img src="/p1p-logo-white.png" className="login-logo" alt="" />
        <div className="login-copy-container">
          <h1>Commission Portal</h1>
          <p>Login with your Page One Power Google account to continue</p>
          <LoginButton />
          <p className="login-subtext">
            First time logging in? No need to create an account. Simply log in
            with your Page One Power Google account
          </p>
        </div>
      </div>
    </div>
  );
};
export default Login;
