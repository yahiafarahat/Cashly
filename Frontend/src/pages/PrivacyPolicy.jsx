import { Link } from "react-router-dom";
import '../styles/Policy.css'

function PrivacyPolicy() {
  return (
    <div className="policy-page">
      <div className="policy-card">

        <h1>Privacy Policy</h1>

        <p>
          At Cashly, your privacy is one of our highest priorities.
          We are committed to protecting your personal information and
          ensuring your data remains secure.
        </p>

        <h2>Information We Collect</h2>

        <ul>
          <li>Name</li>
          <li>Email Address</li>
          <li>Phone Number</li>
          <li>Account Information</li>
        </ul>

        <h2>How We Use Your Information</h2>

        <ul>
          <li>To create and manage your account.</li>
          <li>To improve our services.</li>
          <li>To protect your account from fraud.</li>
          <li>To communicate important updates.</li>
        </ul>

        <h2>Data Security</h2>

        <p>
          Cashly uses modern security measures to protect your personal
          information from unauthorized access.
        </p>

        <Link to="/signup">
          Back
        </Link>

      </div>
    </div>
  );
}

export default PrivacyPolicy;