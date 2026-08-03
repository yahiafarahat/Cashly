import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Check, Sparkles } from "lucide-react";
import "../styles/Dashboard.css";
import "../styles/MyDay.css";
import { getCurrentUser } from "../services/auth";
import { getAnalyticsSummary } from "../services/analytics";
import { fetchTransactions } from "../services/transactions";
import AppSidebar from "../components/AppSidebar";
import UserProfile from "../components/UserProfile";

const formatMoney = (amount) => `EGP ${Number(amount || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

function Dashboard() {
  const currentUser = getCurrentUser();
  const userName = currentUser?.name?.trim() || localStorage.getItem("cashlyUserName") || "Cashly User";
  const firstName = userName.split(" ")[0];
  const [insightIndex, setInsightIndex] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([getAnalyticsSummary(controller.signal), fetchTransactions(controller.signal)])
      .then(([summary, savedTransactions]) => {
        setAnalytics(summary);
        setTransactions(savedTransactions);
      })
      .catch((error) => {
        if (error.name !== "AbortError") console.error("Unable to load My Day data", error);
      });
    return () => controller.abort();
  }, []);

  const insights = useMemo(() => (analytics?.insights || []).map((insight, index) => ({
    ...insight,
    accent: ["food", "forecast", "cash", "weekly"][index % 4],
  })), [analytics]);
  const insight = insights[insightIndex % Math.max(insights.length, 1)];
  const recentTransactions = useMemo(() => transactions.slice(0, 3), [transactions]);
  const recentTotal = useMemo(() => recentTransactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0), [recentTransactions]);
  const todayLabel = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase();

  return (
    <div className="dashboard-page my-day-page">
      <AppSidebar active="day" />
      <main className="dashboard-main my-day-main">
        <header className="my-day-header">
          <div><span className="today-label">{todayLabel}</span><h1>Good afternoon, {firstName}.</h1><p>Here&apos;s what matters for your money today.</p></div>
          <UserProfile />
        </header>

        <section className={`ai-insight-card ${insight?.accent || "cash"}`}>
          <div className="insight-glow" />
          <div className="insight-topline"><span className="ai-badge"><Sparkles size={16} /> AI INSIGHT</span><span className="fresh-label"><i /> Updated from transactions</span></div>
          <div className="insight-content">
            <h2>{insight?.title || "Add transactions to unlock a personalised insight."}</h2>
            <p>{insight?.text || "Cashly calculates My Day insights from your saved transactions."}</p>
            {insights.length > 1 && <div className="insight-actions"><button type="button" className="next-insight" onClick={() => setInsightIndex((current) => (current + 1) % insights.length)}>Show another insight</button></div>}
          </div>
          <div className="insight-number">{String(insights.length ? insightIndex + 1 : 0).padStart(2, "0")}<span>/ {String(insights.length).padStart(2, "0")}</span></div>
        </section>

        <section className="bills-section">
          <div className="section-heading">
            <div><span className="section-kicker"><CalendarDays size={16} /> RECENT ACTIVITY</span><h2>Recent transactions</h2></div>
            <div className="bills-total"><span>Latest {recentTransactions.length} records</span><strong>{formatMoney(recentTotal)}</strong></div>
          </div>
          <div className="bills-list">
            {recentTransactions.map((transaction) => (
              <article className="bill-row" key={transaction.id}>
                <div className="bill-mark">{transaction.merchant?.charAt(0)?.toUpperCase() || "T"}</div>
                <div className="bill-name"><strong>{transaction.merchant}</strong><span>{transaction.date}</span></div>
                <span className="bill-due">{transaction.category}</span>
                <strong className="bill-amount">{formatMoney(transaction.amount)}</strong>
              </article>
            ))}
            {!recentTransactions.length && <p className="bill-reassurance">No transactions recorded yet.</p>}
          </div>
          <p className="bill-reassurance"><Check size={16} /> Every amount above is calculated from your saved transactions.</p>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
