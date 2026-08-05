import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BarChart3, LogOut, ReceiptText, Settings, Sun, Trophy, UsersRound } from "lucide-react";
import cashlyLogo from "../assets/cashly-img-removebg-preview.png";
import { logoutUser } from "../services/auth";
import "../styles/Sidebar.css";

const items = [
  { key: "day", to: "/dashboard", label: "My Day", icon: Sun },
  { key: "transactions", to: "/transactions", label: "Transactions", icon: ReceiptText },
  { key: "analytics", to: "/analytics", label: "Analytics", icon: BarChart3 },
  { key: "challenges", to: "/challenges", label: "Challenges", icon: Trophy },
  { key: "groups", to: "/groups", label: "Budget Groups", icon: UsersRound },
  { key: "settings", to: "/settings", label: "Settings", icon: Settings },
];

function AppSidebar({ active }) {
  const navigate = useNavigate();
  // First visit is open. Once a page is chosen, the slim left edge reveals it again.
  const [isCollapsed, setIsCollapsed] = useState(
    () => sessionStorage.getItem("cashlySidebarCollapsed") === "true"
  );

  function openSidebar() {
    setIsCollapsed(false);
    sessionStorage.setItem("cashlySidebarCollapsed", "false");
  }

  function closeSidebarAfterNavigation() {
    setIsCollapsed(true);
    sessionStorage.setItem("cashlySidebarCollapsed", "true");
  }

  function handlePageNavigation(event, destination) {
    event.preventDefault();
    closeSidebarAfterNavigation();
    // Let the current page show the same close animation before changing routes.
    window.setTimeout(() => navigate(destination), 200);
  }

  return (
    <aside
      className={`dashboard-sidebar app-sidebar ${isCollapsed ? "is-collapsed" : ""}`}
      onMouseEnter={isCollapsed ? openSidebar : undefined}
      onFocus={isCollapsed ? openSidebar : undefined}
      tabIndex={isCollapsed ? 0 : -1}
      aria-label={isCollapsed ? "Open navigation" : undefined}
    >
      <div className="sidebar-content">
        <div className="sidebar-logo"><img src={cashlyLogo} alt="Cashly"/><h2>Cashly</h2></div>
      <nav className="sidebar-menu">
        {items.map(({ key, to, label, icon: ItemIcon }) => (
          <Link className={`sidebar-link ${active === key ? "active" : ""}`} to={to} key={key} onClick={(event) => handlePageNavigation(event, to)}><ItemIcon size={20}/><span className="sidebar-label">{label}</span></Link>
        ))}
      </nav>
      <Link className="logout-link" to="/" onClick={logoutUser}><LogOut size={20}/><span className="sidebar-label">Logout</span></Link>
      </div>
    </aside>
  );
}

export default AppSidebar;
