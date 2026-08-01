import { Link } from "react-router-dom";
import { BarChart3, LogOut, ReceiptText, Settings, Sun, Trophy } from "lucide-react";
import cashlyLogo from "../assets/cashly-img-removebg-preview.png";
import { logoutUser } from "../services/auth";

const items = [
  { key: "day", to: "/dashboard", label: "My Day", icon: Sun },
  { key: "transactions", to: "/transactions", label: "Transactions", icon: ReceiptText },
  { key: "analytics", to: "/analytics", label: "Analytics", icon: BarChart3 },
  { key: "challenges", to: "/challenges", label: "Challenges", icon: Trophy },
  { key: "settings", to: "/settings", label: "Settings", icon: Settings },
];

function AppSidebar({ active }) {
  return (
    <aside className="dashboard-sidebar app-sidebar">
      <div className="sidebar-logo"><img src={cashlyLogo} alt="Cashly"/><h2>Cashly</h2></div>
      <nav className="sidebar-menu">
        {items.map(({ key, to, label, icon: ItemIcon }) => (
          <Link className={`sidebar-link ${active === key ? "active" : ""}`} to={to} key={key}><ItemIcon size={20}/>{label}</Link>
        ))}
      </nav>
      <Link className="logout-link" to="/login" onClick={logoutUser}><LogOut size={20}/>Logout</Link>
    </aside>
  );
}

export default AppSidebar;
