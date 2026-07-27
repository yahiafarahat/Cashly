import { Link } from "react-router-dom";
import '../styles/Policy.css'

function Cookies() {
  return (
    <div className="policy-page">
      <div className="policy-card">

        <h1>Cookie Policy</h1>

        <p>
          Cashly uses cookies to improve your browsing experience.
        </p>

        <h2>Why We Use Cookies</h2>

        <ul>
          <li>Keep you signed in.</li>
          <li>Remember your preferences.</li>
          <li>Improve website performance.</li>
          <li>Analyze website usage.</li>
        </ul>

        <h2>Your Choices</h2>

        <p>
          You can disable cookies in your browser settings at any time.
        </p>

        <Link to="/signup">
          Back
        </Link>

      </div>
    </div>
  );
}

export default Cookies;