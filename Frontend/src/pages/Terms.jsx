import { Link } from "react-router-dom";
import '../styles/Policy.css'

function Terms() {
  return (
    <div className="policy-page">
      <div className="policy-card">

        <h1>Terms & Conditions</h1>

        <p>
          By using Cashly, you agree to follow these terms and conditions.
        </p>

        <h2>Account Responsibilities</h2>

        <ul>
          <li>Keep your password secure.</li>
          <li>Provide accurate information.</li>
          <li>Do not share your account.</li>
        </ul>

        <h2>Acceptable Use</h2>

        <ul>
          <li>No fraudulent activities.</li>
          <li>No unauthorized access.</li>
          <li>Use the application responsibly.</li>
        </ul>

        <h2>Changes</h2>

        <p>
          Cashly may update these terms when necessary.
        </p>

        <Link to="/signup">
          Back
        </Link>

      </div>
    </div>
  );
}

export default Terms;