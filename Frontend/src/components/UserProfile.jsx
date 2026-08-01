import { getCurrentUser } from "../services/auth";

function UserProfile({ compact = false }) {
  const currentUser = getCurrentUser();
  const name = currentUser?.name?.trim() || localStorage.getItem("cashlyUserName") || "Cashly User";
  const email = currentUser?.email || "Cashly account";
  return (
    <div className={`shared-user-profile ${compact ? "compact" : ""}`} title={`${name} · ${email}`}>
      <div className="shared-user-avatar">{name.charAt(0).toUpperCase()}</div>
      {!compact && <div className="shared-user-copy"><strong>{name}</strong><span>{email}</span></div>}
    </div>
  );
}

export default UserProfile;
