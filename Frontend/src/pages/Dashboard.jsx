import { useEffect, useMemo, useState } from "react";
import { Zap } from "lucide-react";
import "../styles/Dashboard.css";
import "../styles/MyDay.css";
import "../styles/Transactions.css";
import { getCurrentUser } from "../services/auth";
import { getAnalyticsSummary } from "../services/analytics";
import { fetchTransactions } from "../services/transactions";
import { getMonthlyIncome } from "../utils/profile";
import { useFinancialHealth } from "../hooks/useFinancialHealth";
import AppSidebar from "../components/AppSidebar";
import UserProfile from "../components/UserProfile";
import RecentTransactions from "../components/RecentTransactions";
import TransactionFormModal from "../components/TransactionFormModal";
import RadialProgress from "../components/ui/radial-progress";

const POSITIVE_COLOR = "#6fcf97";
const NEGATIVE_COLOR = "#eb7676";
const ACCENT_COLOR = "#d4af37";

const formatMoney = (amount) => `EGP ${Number(amount || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function calculateTransactionStreak(transactions) {
  const daysWithTransactions = new Set(
    transactions.map((transaction) => transaction.date)
  );

  const cursor = new Date();

  // Don't zero out the streak just because today hasn't been logged yet —
  // it only breaks once a full day passes with nothing recorded.
  if (!daysWithTransactions.has(toDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;

  while (daysWithTransactions.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function Dashboard() {
  const currentUser = getCurrentUser();
  const userName = currentUser?.name?.trim() || localStorage.getItem("cashlyUserName") || "Cashly User";
  const firstName = userName.split(" ")[0];
  const [analytics, setAnalytics] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  // Bumped on every open so TransactionFormModal remounts with a clean form.
  const [addTransactionSessionId, setAddTransactionSessionId] = useState(0);

  const { score: healthScore, status: healthStatus } = useFinancialHealth();

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

  const streak = useMemo(() => calculateTransactionStreak(transactions), [transactions]);
  const todayLabel = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase();
  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const todaySpent = useMemo(
    () => transactions
      .filter((transaction) => transaction.date === todayKey)
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0),
    [transactions, todayKey]
  );

  const monthlyIncome = getMonthlyIncome();
  const monthlyExpenses = analytics?.total_spent ?? 0;
  const totalBalance = (monthlyIncome ?? 0) - monthlyExpenses;

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  // A fair daily share of the monthly income; falls back to this month's
  // average daily spend so the ring stays meaningful before income is set.
  const dailyBudget = monthlyIncome
    ? monthlyIncome / daysInMonth
    : monthlyExpenses / dayOfMonth;
  const dailySpentPercent = dailyBudget > 0 ? (todaySpent / dailyBudget) * 100 : 0;
  const dailySpentColor = dailySpentPercent > 100 ? NEGATIVE_COLOR : ACCENT_COLOR;

  const balancePercent = monthlyIncome ? (totalBalance / monthlyIncome) * 100 : 0;
  const balanceColor = totalBalance < 0 ? NEGATIVE_COLOR : POSITIVE_COLOR;

  function handleTransactionSaved(savedTransaction) {
    setTransactions((current) => [savedTransaction, ...current]);
    setIsAddTransactionOpen(false);
  }

  return (
    <div className="dashboard-page my-day-page">
      <AppSidebar active="day" />
      <main className="dashboard-main my-day-main">
        <header className="my-day-header">
          <div><span className="today-label">{todayLabel}</span><h1>Good afternoon, {firstName}.</h1><p>Here&apos;s what matters for your money today.</p></div>
          <div className="my-day-header-actions">
            <div className="streak-badge" title="Consecutive days with a logged transaction">
              <Zap size={15} />
              <span>{streak}</span>
            </div>

            <button
              type="button"
              className="add-transaction-button"
              onClick={() => {
                setAddTransactionSessionId((current) => current + 1);
                setIsAddTransactionOpen(true);
              }}
            >
              <span>＋</span>
              Add Transaction
            </button>

            <UserProfile />
          </div>
        </header>

        <section className="summary-cards my-day-metrics">
          <article className="summary-card my-day-radial-card">
            <div className="summary-card-top">
              <span>Total Daily Spent</span>
            </div>
            <div className="flex justify-center py-2">
              <RadialProgress percent={dailySpentPercent} color={dailySpentColor} size={184} thickness={16}>
                <strong className="text-base font-semibold tracking-tight text-foreground">{formatMoney(todaySpent)}</strong>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">spent today</span>
              </RadialProgress>
            </div>
            <p>{dailyBudget > 0 ? `${Math.round(dailySpentPercent)}% of your ${formatMoney(dailyBudget)} daily budget` : "Spent so far today"}</p>
          </article>

          <article className="summary-card my-day-radial-card">
            <div className="summary-card-top">
              <span>Total Balance</span>
            </div>
            <div className="flex justify-center py-2">
              <RadialProgress percent={Math.abs(balancePercent)} color={balanceColor} size={184} thickness={16}>
                <strong className="text-base font-semibold tracking-tight text-foreground">{formatMoney(totalBalance)}</strong>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">balance</span>
              </RadialProgress>
            </div>
            <p>{monthlyIncome === null ? "Add your monthly income in Settings" : "Monthly income minus expenses"}</p>
          </article>

          <article className="summary-card">
            <div className="summary-card-top">
              <span>Financial Health Score</span>
            </div>
            <h2>{healthScore}<small> / 100</small></h2>
            <p>{healthStatus}</p>
            <div className="health-progress"><div className="health-progress-fill" style={{ width: `${healthScore}%` }} /></div>
          </article>
        </section>

        <RecentTransactions transactions={transactions} />
      </main>

      <TransactionFormModal
        key={addTransactionSessionId}
        open={isAddTransactionOpen}
        onClose={() => setIsAddTransactionOpen(false)}
        onSaved={handleTransactionSaved}
      />
    </div>
  );
}

export default Dashboard;
