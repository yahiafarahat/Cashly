import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import cashlyLogo from "../assets/cashly-img-removebg-preview.png";
import { registerUser } from "../services/auth";
import {
  validateEmail,
  validatePassword
} from "../utils/validators";

import "../styles/SignUp.css";


function SignUp() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);


  async function handleSignUp(event) {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email.");
      return;
    }

    const passwordError =
      validatePassword(password);

    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser(
        name,
        email,
        password
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
    <div className="signup-page">
      <div className="signup-card">
        <img
          className="signup-logo"
          src={cashlyLogo}
          alt="Cashly Logo"
        />

        <h1>Cashly</h1>

        <p className="signup-welcome-text">
          Create your account to get started
        </p>

        {error && (
          <p className="signup-error">
            {error}
          </p>
        )}

        <form onSubmit={handleSignUp}>
          <div className="signup-inputs">
            <label htmlFor="signup-name">
              Name
            </label>

            <input
              id="signup-name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              disabled={isLoading}
              required
            />
          </div>

          <div className="signup-inputs">
            <label htmlFor="signup-email">
              Email
            </label>

            <input
              id="signup-email"
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

          <div className="signup-inputs">
            <label htmlFor="signup-password">
              Password
            </label>

            <input
              id="signup-password"
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

          <div className="signup-inputs">
            <label htmlFor="confirm-password">
              Confirm Password
            </label>

            <input
              id="confirm-password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              disabled={isLoading}
              required
            />
          </div>

          <div className="agreement">
            <input
              id="privacy-agreement"
              type="checkbox"
              disabled={isLoading}
              required
            />

            <label htmlFor="privacy-agreement">
              I agree to the{" "}
              <Link to="/privacy-policy">
                Privacy Policy
              </Link>
            </label>
          </div>

          <div className="agreement">
            <input
              id="terms-agreement"
              type="checkbox"
              disabled={isLoading}
              required
            />

            <label htmlFor="terms-agreement">
              I agree to the{" "}
              <Link to="/terms">
                Terms &amp; Conditions
              </Link>
            </label>
          </div>

          <button
            className="signup-button"
            type="submit"
            disabled={isLoading}
          >
            {isLoading
              ? "Creating account..."
              : "Sign Up"}
          </button>
        </form>

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

        <p className="signup-footer">
          <Link to="/privacy-policy">
            Privacy Policy
          </Link>
          {" | "}
          <Link to="/terms">
            Terms
          </Link>
          {" | "}
          <Link to="/cookies">
            Cookies
          </Link>
        </p>

        <p className="login-text">
          Already have an account?{" "}
          <Link to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}


export default SignUp;