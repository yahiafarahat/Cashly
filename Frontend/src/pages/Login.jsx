import cashlyLogo from "../assets/cashly-img-removebg-preview.png";
import "../styles/Login.css";
import { Link, useNavigate } from "react-router-dom";

import { useState } from "react";
import { loginUser } from "../services/auth";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");

    function handleLogin(event) {
    event.preventDefault();

    setError("");

    const result = loginUser(email, password);

    if (!result.success) {
        setError(result.message);
        return;
    }

    navigate("/dashboard");
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
                        <label>Email</label>
                        <input
    type="email"
    placeholder="Enter your email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
/>
                    </div>

                    <div className="login-inputs">
                        <label>Password</label>
                        <input
    type="password"
    placeholder="Enter your password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
/>
                    </div>

                    <div className="login-options">
                        <div className="login-checkbox">
                            <input id="remember-me" type="checkbox" />

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

                    <button className="login-button" type="submit">
                        Login
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
                    <Link to="/signup">Sign up</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;