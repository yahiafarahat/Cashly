import { CalendarDays, Check } from "lucide-react";

const formatMoney = (amount) => `EGP ${Number(amount || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

// Shared "recent activity" list used by My Day (and available to any other
// page that wants the same at-a-glance transaction feed).
function RecentTransactions({ transactions, limit = 3 }) {
  const recentTransactions = transactions.slice(0, limit);
  const recentTotal = recentTransactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);

  return (
    <section className="bills-section">
      <div className="section-heading">
        <div>
          <span className="section-kicker"><CalendarDays size={16} /> RECENT ACTIVITY</span>
          <h2>Recent transactions</h2>
        </div>
        <div className="bills-total"><span>Latest {recentTransactions.length} records</span><strong>{formatMoney(recentTotal)}</strong></div>
      </div>
      <div className="bills-list">
        {recentTransactions.map((transaction) => (
          <article className="bill-row" key={transaction.id}>
            <div className="bill-mark">{transaction.description?.charAt(0)?.toUpperCase() || "T"}</div>
            <div className="bill-name"><strong>{transaction.description}</strong><span>{transaction.date}</span></div>
            <span className="bill-due">{transaction.category}</span>
            <strong className="bill-amount">{formatMoney(transaction.amount)}</strong>
          </article>
        ))}
        {!recentTransactions.length && <p className="bill-reassurance">No transactions recorded yet.</p>}
      </div>
      <p className="bill-reassurance"><Check size={16} /> Every amount above is calculated from your saved transactions.</p>
    </section>
  );
}

export default RecentTransactions;
