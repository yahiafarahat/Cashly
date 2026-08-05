import { useState } from "react";
import {
  Link,
  useNavigate
} from "react-router-dom";
import { ArrowRight } from "lucide-react";

import cashlyLogo from "../assets/cashly-img-removebg-preview.png";
import { loginUser } from "../services/auth";

import "../styles/Auth.css";


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
    <div className="auth-page">
      <div className="auth-dot-grid" />
      <div className="auth-blob auth-blob-one" />
      <div className="auth-blob auth-blob-two" />
      <div className="auth-blob auth-blob-three" />

      <div className="auth-card">
        <div className="auth-logo">
          <img src={cashlyLogo} alt="Cashly" />
        </div>

        <h1 className="auth-title">Cashly</h1>

        <p className="auth-subtitle">
          Welcome back. Let&apos;s pick up where you left off.
        </p>

        {error && (
          <p className="auth-error">
            {error}
          </p>
        )}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="auth-field">
            <label htmlFor="login-email">
              Email
            </label>

            <input
              id="login-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              disabled={isLoading}
              required
            />
          </div>

          <div className="auth-field">
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

          <div className="auth-options">
            <div className="auth-checkbox">
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
              className="auth-forgot"
              to="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>

          <button
            className="auth-submit"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log in"}
            {!isLoading && <ArrowRight size={17} />}
          </button>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="auth-social-row">
            <button
              className="auth-social-button"
              type="button"
              aria-label="Continue with Google"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
                alt=""
              />
              Google
            </button>

            <button
              className="auth-social-button"
              type="button"
              aria-label="Continue with Facebook"
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/733/733547.png"
                alt=""
              />
              Facebook
            </button>
          </div>
        </form>

        <p className="auth-switch">
          New to Cashly?{" "}
          <Link to="/signup">
            Start your free space
          </Link>
        </p>
      </div>
    </div>
  );
}


export default Login;
