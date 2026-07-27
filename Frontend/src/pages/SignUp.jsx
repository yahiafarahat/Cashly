import cashlyLogo from "../assets/cashly-img-removebg-preview.png";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/SignUp.css";

import { registerUser } from "../services/auth";
import { validateEmail, validatePassword } from "../utils/validators";

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleSignUp(event) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
        setError("Please enter your name.");
        return;
    }

    if (!validateEmail(email)) {
        setError("Please enter a valid email.");
        return;
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
        setError(passwordError);
        return;
    }

    if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
    }

    const result = registerUser(name, email, password);

    if (!result.success) {
        setError(result.message);
        return;
    }

    navigate("/dashboard");
}

  return (
    <div className="signup-page">
      <div className="signup-card">
        <img className="signup-logo" src={cashlyLogo} alt="Cashly Logo" />
        <h1>Cashly</h1>
        <p className="signup-welcome-text">Create your account to get started</p>

        {error && (
    <p className="signup-error">
        {error}
    </p>
)}

        <form onSubmit={handleSignUp}>
          <div className="signup-inputs">
            <label>Name</label>
            <input type="text" placeholder="Enter your name" value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="signup-inputs">
            <label>Email</label>
            <input
    type="email"
    placeholder="Enter your email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
/>
          </div>
          <div className="signup-inputs">
            <label>Password</label>
            <input
    type="password"
    placeholder="Enter your password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
/>
          </div>
          <div className="signup-inputs">
            <label>Confirm Password</label>
            <input
    type="password"
    placeholder="Confirm your password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    required
/>
          </div>
          <div className="agreement">
            <input type="checkbox" required />
            <label>I agree to the <Link to="/privacy-policy">Privacy Policy</Link></label>
          </div>
          <div className="agreement">
            <input type="checkbox" required />
            <label>I agree to the <Link to="/terms">Terms &amp; Conditions</Link></label>
          </div>
          <button className="signup-button" type="submit">Sign Up</button>
        </form>

        <div className="continue-with"><span>or continue with</span></div>
        <div className="social-login">
          <button className="social-btn" type="button"><img src="https://cdn-icons-png.flaticon.com/512/281/281764.png" alt="Google" /></button>
          <button className="social-btn" type="button"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" /></button>
        </div>
        <p className="signup-footer"><Link to="/privacy-policy">Privacy Policy</Link>{" | "}<Link to="/terms">Terms</Link>{" | "}<Link to="/cookies">Cookies</Link></p>
        <p className="login-text">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}

export default SignUp;
