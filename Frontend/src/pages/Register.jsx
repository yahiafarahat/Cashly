import cashlyLogo from '../assets/cashly-img-removebg-preview.png';
import { Link } from "react-router-dom";
import '../styles/Login.css'


function Register () {
return(
    <div className="login-page">
       <div className="login-card">
        <img className="cashly-logo" src={cashlyLogo} alt="Cashly Logo" />
        <h1> Cashly </h1>
        <p className="welcome-text"> Create your account to get</p>
        <form>
            <div className="inputs">
                <label> Email</label>
                <input type="email" placeholder="Enter your email" />
            </div>
            <div className="inputs">
                <label> Password</label>
                <input type="password" placeholder="Enter your password" />
            </div>
            <div className="checkbox">
                <input type="checkbox" />
                <label> Remember me</label>
                <a className="forgot-password" href="/forgot-password"> Forgot password? </a>
            </div>
            <button type="submit"> Login </button>

             
        </form>
        <p className="signup-text">
            Don't have an account? <Link to="/signup">Sign up</Link>
        </p>

       </div>
    </div>
    

)
};

export default Register
