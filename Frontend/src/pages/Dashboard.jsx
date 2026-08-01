import { useMemo, useState } from "react";
import "../styles/Dashboard.css";
import "../styles/MyDay.css";
import { getCurrentUser } from "../services/auth";
import AppSidebar from "../components/AppSidebar";
import UserProfile from "../components/UserProfile";

const Icon = ({ name, size = 20 }) => {
  const paths = {
    day: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/></>,
    transactions: <><path d="M7 7h11l-3-3M17 17H6l3 3"/><path d="M18 7l-3 3M6 17l3-3"/></>,
    analytics: <><path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/></>,
    challenges: <><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M7 6H3v2a4 4 0 0 0 4 4M17 6h4v2a4 4 0 0 1-4 4"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.6v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.2 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H2.4V9.6h.1A1.7 1.7 0 0 0 4.2 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 8.6 4.2a1.7 1.7 0 0 0 1-.6A1.7 1.7 0 0 0 10 2.5v-.1h4v.1a1.7 1.7 0 0 0 1 1.7 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 8.6a1.7 1.7 0 0 0 .6 1c.3.26.69.4 1.1.4h.1v4h-.1a1.7 1.7 0 0 0-1.7 1Z"/></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/></>,
    spark: <><path d="m12 3-1.2 4.2a5 5 0 0 1-3.6 3.6L3 12l4.2 1.2a5 5 0 0 1 3.6 3.6L12 21l1.2-4.2a5 5 0 0 1 3.6-3.6L21 12l-4.2-1.2a5 5 0 0 1-3.6-3.6L12 3Z"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    arrow: <path d="m9 18 6-6-6-6"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

const insights = [
  { eyebrow: "Spending pattern", title: "You're spending 18% more on food this week.", detail: "Two fewer delivery orders would put you back on track and keep around EGP 450 in your account.", action: "Set a food limit", accent: "food" },
  { eyebrow: "Budget forecast", title: "You're likely to stay under budget this week.", detail: "Keep food delivery to one order before Sunday and you'll finish about EGP 380 under budget.", action: "View the forecast", accent: "forecast" },
  { eyebrow: "Cash flow", title: "Salary arrives in 3 days. Your balance is enough until then.", detail: "After upcoming bills, you can safely spend up to EGP 210 per day without dipping into savings.", action: "See the breakdown", accent: "cash" },
  { eyebrow: "Weekly pattern", title: "Last Friday was your most expensive day.", detail: "You spent EGP 620 more than your daily average, mostly on dining and transport.", action: "Review Friday", accent: "weekly" },
];

const initialBills = [
  { id: 1, name: "Netflix", due: "Tomorrow", date: "Aug 2", amount: 220, mark: "N" },
  { id: 2, name: "Electricity", due: "In 5 days", date: "Aug 6", amount: 680, mark: "E" },
  { id: 3, name: "Internet", due: "In 10 days", date: "Aug 11", amount: 450, mark: "I" },
];

function Dashboard() {
  const currentUser = getCurrentUser();
  const userName = currentUser?.name?.trim() || localStorage.getItem("cashlyUserName") || "Cashly User";
  const firstName = userName.split(" ")[0];
  const [insightIndex, setInsightIndex] = useState(0);
  const [paidBills, setPaidBills] = useState([]);
  const insight = insights[insightIndex];
  const totalDue = useMemo(() => initialBills.filter((bill) => !paidBills.includes(bill.id)).reduce((sum, bill) => sum + bill.amount, 0), [paidBills]);

  const nextInsight = () => setInsightIndex((current) => (current + 1) % insights.length);
  const togglePaid = (id) => setPaidBills((current) => current.includes(id) ? current.filter((billId) => billId !== id) : [...current, id]);

  return (
    <div className="dashboard-page my-day-page">
      <AppSidebar active="day" />

      <main className="dashboard-main my-day-main">
        <header className="my-day-header">
          <div><span className="today-label">SATURDAY · AUGUST 1</span><h1>Good afternoon, {firstName}.</h1><p>Here’s what matters for your money today.</p></div>
          <UserProfile />
        </header>

        <section className={`ai-insight-card ${insight.accent}`}>
          <div className="insight-glow" />
          <div className="insight-topline"><span className="ai-badge"><Icon name="spark" size={16} /> AI INSIGHT</span><span className="fresh-label"><i /> Updated just now</span></div>
          <div className="insight-content">
            <h2>{insight.title}</h2>
            <p>{insight.detail}</p>
            <div className="insight-actions">
              <button type="button" className="insight-action">{insight.action}<Icon name="arrow" size={17} /></button>
              <button type="button" className="next-insight" onClick={nextInsight}>Show another insight</button>
            </div>
          </div>
          <div className="insight-number">{String(insightIndex + 1).padStart(2, "0")}<span>/ 04</span></div>
        </section>

        <section className="bills-section">
          <div className="section-heading">
            <div><span className="section-kicker"><Icon name="calendar" size={16} /> COMING UP</span><h2>Upcoming bills</h2></div>
            <div className="bills-total"><span>Due in 10 days</span><strong>EGP {totalDue.toLocaleString()}</strong></div>
          </div>
          <div className="bills-list">
            {initialBills.map((bill) => {
              const isPaid = paidBills.includes(bill.id);
              return (
                <article className={`bill-row ${isPaid ? "paid" : ""}`} key={bill.id}>
                  <div className={`bill-mark bill-${bill.mark.toLowerCase()}`}>{isPaid ? <Icon name="check" size={19} /> : bill.mark}</div>
                  <div className="bill-name"><strong>{bill.name}</strong><span>{bill.date}</span></div>
                  <span className={`bill-due ${bill.due === "Tomorrow" ? "urgent" : ""}`}>{isPaid ? "Paid" : bill.due}</span>
                  <strong className="bill-amount">EGP {bill.amount}</strong>
                  <button type="button" className="mark-paid" onClick={() => togglePaid(bill.id)}>{isPaid ? "Undo" : "Mark paid"}</button>
                </article>
              );
            })}
          </div>
          <p className="bill-reassurance"><Icon name="check" size={16} /> Your current balance comfortably covers all upcoming bills.</p>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
