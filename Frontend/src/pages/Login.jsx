import { useState } from "react";
import {
  Link,
  useNavigate
} from "react-router-dom";

import cashlyLogo from "../assets/cashly-img-removebg-preview.png";
import { loginUser } from "../services/auth";

import "../styles/Login.css";


function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [rememberMe, setRememberMe] =
    useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] =
    useState(false);


  async function handleLogin(event) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const result = await loginUser(
        email,
        password,
        rememberMe
      );

      if (!result.success) {
        setError(result.message);
        return;
      }

      navigate("/dashboard");
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <div className="login-page">
      <div className="login-card">
        <img
          className="login-logo"
          src={cashlyLogo}
          alt="Cashly Logo"
        />

        <h1>Cashly</h1>

        <p className="login-welcome-text">
          Welcome back! Please login to your account
        </p>

        {error && (
          <p className="login-error">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin}>
          <div className="login-inputs">
            <label htmlFor="login-email">
              Email
            </label>

            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              disabled={isLoading}
              required
            />
          </div>

          <div className="login-inputs">
            <label htmlFor="login-password">
              Password
            </label>

            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              disabled={isLoading}
              required
            />
          </div>

          <div className="login-options">
            <div className="login-checkbox">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(
                    event.target.checked
                  )
                }
                disabled={isLoading}
              />

              <label htmlFor="remember-me">
                Remember me
              </label>
            </div>

            <Link
              className="forgot-password"
              to="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>

          <button
            className="login-button"
            type="submit"
            disabled={isLoading}
          >
            {isLoading
              ? "Logging in..."
              : "Login"}
          </button>

          <div className="continue-with">
            <span>or continue with</span>
          </div>

          <div className="social-login">
            <button
              className="social-btn"
              type="button"
              aria-label="Continue with Google"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
                alt="Google"
              />
            </button>

            <button
              className="social-btn"
              type="button"
              aria-label="Continue with Facebook"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
                alt="Facebook"
              />
            </button>
          </div>
        </form>

        <p className="signup-text">
          Don&apos;t have an account?{" "}
          <Link to="/signup">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}


export default Login;