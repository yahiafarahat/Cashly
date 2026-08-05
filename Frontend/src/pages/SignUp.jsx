import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import cashlyLogo from "../assets/cashly-img-removebg-preview.png";
import { registerUser } from "../services/auth";
import {
  validateEmail,
  validatePassword
} from "../utils/validators";

import "../styles/Auth.css";


function SignUp() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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

    if (!agreedToPrivacy || !agreedToTerms) {
      setError("Please agree to the Privacy Policy and Terms & Conditions.");
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
    <div className="auth-page">
      <div className="auth-dot-grid" />
      <div className="auth-blob auth-blob-one" />
      <div className="auth-blob auth-blob-two" />
      <div className="auth-blob auth-blob-three" />

      <div className="auth-card auth-card-wide">
        <div className="auth-logo">
          <img src={cashlyLogo} alt="Cashly" />
        </div>

        <h1 className="auth-title">Cashly</h1>

        <p className="auth-subtitle">
          Start your free space in under a minute.
        </p>

        {error && (
          <p className="auth-error">
            {error}
          </p>
        )}

        <form className="auth-form" onSubmit={handleSignUp}>
          <div className="auth-field-row">
            <div className="auth-field">
              <label htmlFor="signup-name">
                Name
              </label>

              <input
                id="signup-name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                disabled={isLoading}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="signup-email">
                Email
              </label>

              <input
                id="signup-email"
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
          </div>

          <div className="auth-field-row">
            <div className="auth-field">
              <label htmlFor="signup-password">
                Password
              </label>

              <input
                id="signup-password"
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                disabled={isLoading}
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="confirm-password">
                Confirm
              </label>

              <input
                id="confirm-password"
                type="password"
                placeholder="Repeat password"
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
          </div>

          <div className="auth-agreement">
            <input
              id="privacy-agreement"
              type="checkbox"
              checked={agreedToPrivacy}
              onChange={(event) =>
                setAgreedToPrivacy(event.target.checked)
              }
              disabled={isLoading}
              required
            />

            <label htmlFor="privacy-agreement">
              I agree to the{" "}
              <Link to="/privacy-policy">
                privacy policy
              </Link>
            </label>
          </div>

          <div className="auth-agreement">
            <input
              id="terms-agreement"
              type="checkbox"
              checked={agreedToTerms}
              onChange={(event) =>
                setAgreedToTerms(event.target.checked)
              }
              disabled={isLoading}
              required
            />

            <label htmlFor="terms-agreement">
              I agree to the{" "}
              <Link to="/terms">
                terms and conditions
              </Link>
            </label>
          </div>

          <button
            className="auth-submit"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Sign up"}
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
          Already have an account?{" "}
          <Link to="/login">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}


export default SignUp;
