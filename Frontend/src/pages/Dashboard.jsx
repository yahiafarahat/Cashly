import { useState } from "react";
import { Link } from "react-router-dom";
import cashlyLogo from "../assets/cashly-img-removebg-preview.png";
import "../styles/Dashboard.css";
import {
  financialData,
  formatCurrency,
} from "../data/financialData";
import { logoutUser } from "../services/auth";

const coachMessages = [
  {
    title: "You are close to your savings goal",
    message:
      "You are only EGP 180 away from reaching your savings target this month. Keep going!",
    icon: "🎯",
  },
  {
    title: "Excellent transport progress",
    message:
      "You spent 23% less on transportation this week compared with last week.",
    icon: "🚗",
  },
  {
    title: "Your coffee spending improved",
    message:
      "You have not purchased coffee for four days. That saved you approximately EGP 320.",
    icon: "☕",
  },
  {
    title: "Prepare for weekend spending",
    message:
      "Your weekend spending is usually 35% higher than your weekday spending.",
    icon: "📅",
  },
  {
    title: "Your savings are growing",
    message:
      "You saved 42% of your income this month, which is higher than last month.",
    icon: "💰",
  },
];

const smartInsights = [
  {
    title: "Your food spending increased by 18%",
    message:
      "Most of this increase happened during weekends. Reducing two food orders could save you approximately EGP 450.",
    category: "Food",
  },
  {
    title: "You spent less on transportation",
    message:
      "Your transportation spending decreased by 23% this week. You saved approximately EGP 280.",
    category: "Transport",
  },
  {
    title: "A recurring subscription was detected",
    message:
      "Your Netflix subscription renews every month for EGP 220. Review whether you still use it regularly.",
    category: "Subscription",
  },
  {
    title: "Friday is your most expensive day",
    message:
      "You spend approximately 31% more on Fridays than on other days of the week.",
    category: "Weekly Pattern",
  },
  {
    title: "Your savings improved this month",
    message:
      "You saved EGP 850 more than last month. At this rate, you may exceed your monthly goal.",
    category: "Savings",
  },
];

function Dashboard() {
  const {
    summary,
    comparisons,
    financialHealth,
    challenge,
    recentTransactions,
  } = financialData;

const savingsPercentage = Math.round(
  (summary.savings / summary.income) * 100
);


const challengeProgressStart = Math.round(
  (challenge.spent / challenge.limit) * 100
);
 const [challengeProgress, setChallengeProgress] =
  useState(challengeProgressStart);
const [challengeCheckedIn, setChallengeCheckedIn] = useState(false);

function handleChallengeCheckIn() {
  if (!challengeCheckedIn) {
    setChallengeProgress((currentProgress) =>
      Math.min(currentProgress + 10, 100)
    );

    setChallengeCheckedIn(true);
  }
}
  const userName =
    localStorage.getItem("cashlyUserName") || "Cashly User";

  const firstLetter = userName.charAt(0).toUpperCase();

  const [showHealthDetails, setShowHealthDetails] =
    useState(false);

  const [coachIndex, setCoachIndex] = useState(() =>
    Math.floor(Math.random() * coachMessages.length)
  );

  const [insightIndex, setInsightIndex] = useState(() =>
    Math.floor(Math.random() * smartInsights.length)
  );

  const currentCoachMessage = coachMessages[coachIndex];
  const currentInsight = smartInsights[insightIndex];

  function showNewCoachMessage() {
    setCoachIndex((currentIndex) => {
      let newIndex = Math.floor(
        Math.random() * coachMessages.length
      );

      while (
        newIndex === currentIndex &&
        coachMessages.length > 1
      ) {
        newIndex = Math.floor(
          Math.random() * coachMessages.length
        );
      }

      return newIndex;
    });
  }

  function showNewInsight() {
    setInsightIndex((currentIndex) => {
      let newIndex = Math.floor(
        Math.random() * smartInsights.length
      );

      while (
        newIndex === currentIndex &&
        smartInsights.length > 1
      ) {
        newIndex = Math.floor(
          Math.random() * smartInsights.length
        );
      }

      return newIndex;
    });
  }

  return (
    <div className="dashboard-page">

      {/* Sidebar */}
      <aside className="dashboard-sidebar">

        <div className="sidebar-logo">
          <img src={cashlyLogo} alt="Cashly Logo" />
          <h2>Cashly</h2>
        </div>

        <nav className="sidebar-menu">

          <Link
            className="sidebar-link active"
            to="/dashboard"
          >
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            className="sidebar-link"
            to="/transactions"
          >
            <span>↔</span>
            Transactions
          </Link>

          <Link
  className="sidebar-link"
  to="/analytics"
>
  <span>◫</span>
  Analytics
</Link>
          <Link
  className="sidebar-link"
  to="/challenges"
>
  <span>★</span>
  Challenges
</Link> 

          <Link
            className="sidebar-link"
            to="/settings"
          >
            <span>⚙</span>
            Settings
          </Link>

        </nav>

        <Link className="logout-link" to="/login" onClick={logoutUser}>
          <span>←</span>
          Logout
        </Link>

      </aside>

      {/* Main dashboard content */}
      <main className="dashboard-main">

        {/* Navbar */}
        <header className="dashboard-navbar">

          <div>
            <h1>Good afternoon, {userName}</h1>

            <p>
              Here is your financial overview for this month.
            </p>
          </div>

          <div className="navbar-actions">

            <input
              className="dashboard-search"
              type="text"
              placeholder="Search..."
            />

            <button
              className="notification-button"
              type="button"
            >
              🔔
            </button>

            <div className="user-profile">

              <div className="profile-circle">
                {firstLetter}
              </div>

              <div>
                <strong>{userName}</strong>
                <span>Cashly User</span>
              </div>

            </div>

          </div>

        </header>

        {/* Cashly Coach */}
        <section className="cashly-coach">

          <div className="coach-icon">
            {currentCoachMessage.icon}
          </div>

          <div className="coach-message">

            <span className="coach-label">
              Cashly Coach
            </span>

            <h2>{currentCoachMessage.title}</h2>

            <p>{currentCoachMessage.message}</p>

          </div>

          <button
            className="new-advice-button"
            type="button"
            onClick={showNewCoachMessage}
          >
            New Advice
          </button>

        </section>

        {/* Summary cards */}
        <section className="summary-cards">

          <div className="summary-card">

            <div className="summary-card-top">
              <span>Total Balance</span>
              <div className="summary-icon">£</div>
            </div>

<h2>{formatCurrency(summary.balance)}</h2>

            <p className="positive-text">
            +{comparisons.balanceChange}% from last month
            </p>

          </div>

          <div className="summary-card">

            <div className="summary-card-top">
              <span>Monthly Income</span>
              <div className="summary-icon">↓</div>
            </div>

            <h2>{formatCurrency(summary.income)}</h2>

            <p className="positive-text">
              +{comparisons.incomeChange}% from last month
            </p>

          </div>

          <div className="summary-card">

            <div className="summary-card-top">
              <span>Monthly Expenses</span>
              <div className="summary-icon">↑</div>
            </div>

<h2>{formatCurrency(summary.expenses)}</h2>

            <p className="negative-text">
            +{comparisons.expensesChange}% from last month
            </p>

          </div>

          <div className="summary-card">

            <div className="summary-card-top">
              <span>Total Savings</span>
              <div className="summary-icon">◆</div>
            </div>

            <h2>{formatCurrency(summary.savings)}</h2>

            <p className="positive-text">
{savingsPercentage}% of your income            </p>

          </div>

        </section>

        {/* Final two-column dashboard layout */}
        <section className="dashboard-columns" id="challenges">
          <div className="dashboard-column dashboard-column-left">
            {/* Financial Health */}
          <div className="dashboard-panel health-panel">

            <div className="panel-heading">

              <div>
                <h2>Financial Health</h2>

                <p>
                  Your score is based on your spending and
                  savings.
                </p>
              </div>

              <button
                className="small-action-button"
                type="button"
                onClick={() =>
                  setShowHealthDetails(true)
                }
              >
                View Details
              </button>

            </div>

            <div className="health-content">

              <div className="health-score-circle">
<strong>{financialHealth.score}</strong>                <span>/ 100</span>
              </div>

              <div className="health-information">

<h3>{financialHealth.status}</h3>
                <p>
                  You are managing your money well and saving
                  consistently.
                </p>

                <div className="health-progress">
                  <div className="health-progress-fill"></div>
                </div>

                <small>
                  You improved by {comparisons.healthImprovement} points
                  this month.
                </small>

              </div>

            </div>

          </div>

            {/* Dynamic Smart Insight */}
          <div className="dashboard-panel insight-panel">

            <div className="panel-heading">

              <div>
                <h2>Smart Insight</h2>

                <p>
                  A personal observation based on your activity.
                </p>
              </div>

              <span className="insight-category">
                {currentInsight.category}
              </span>

            </div>

            <div className="insight-content">

              <div className="insight-icon">
                ✦
              </div>

              <div>

                <h3>{currentInsight.title}</h3>

                <p>{currentInsight.message}</p>

                <button
                  className="insight-button"
                  type="button"
                  onClick={showNewInsight}
                >
                  Show Another Insight
                </button>

              </div>

            </div>

          </div>

            {/* Monthly Challenge */}
  <div className="dashboard-panel monthly-challenge-panel">

    <div className="challenge-top">

      <div>
        <span className="challenge-small-label">
          July Challenge
        </span>

<h2>{challenge.title}</h2>
      <p>
  Keep your restaurant and food delivery spending below{" "}
  {formatCurrency(challenge.limit)} this month.
</p> 
      </div>

      <div className="challenge-trophy">
        🏆
      </div>

    </div>

    <div className="challenge-progress-information">

      <div className="challenge-progress-heading">
        <span>Monthly progress</span>

        <strong>{challengeProgress}%</strong>
      </div>

      <div className="challenge-progress-bar">
        <div
          className="challenge-progress-fill"
          style={{ width: `${challengeProgress}%` }}
        ></div>
      </div>

      <div className="challenge-numbers">
        <span>{formatCurrency(challenge.spent)} spent</span>

<span>{formatCurrency(challenge.limit)} limit</span>
      </div>

    </div>

    <div className="challenge-details">

      <div className="challenge-detail-card">
        <span>Days remaining</span>
<strong>{challenge.daysRemaining}</strong>      </div>

      <div className="challenge-detail-card">
        <span>Available budget</span>
       <strong>
  {formatCurrency(
    challenge.limit - challenge.spent
  )}
</strong>
      </div>

      <div className="challenge-detail-card">
        <span>Reward</span>
       <strong>+{challenge.reward} Score</strong>
      </div>

    </div>

    <div className="challenge-tip">

      <div className="challenge-tip-icon">
        ✦
      </div>

      <div>
        <strong>Cashly Tip</strong>

        <p>
          Replace one restaurant order this week with a home meal
          to stay safely below your limit.
        </p>
      </div>

    </div>

    <button
      className={`challenge-check-button ${
        challengeCheckedIn ? "checked-in" : ""
      }`}
      type="button"
      onClick={handleChallengeCheckIn}
      disabled={challengeCheckedIn}
    >
      {challengeCheckedIn
        ? "✓ Today's Check-In Completed"
        : "Complete Today's Check-In"}
    </button>

  </div>
          </div>

          <div className="dashboard-column dashboard-column-right">
            {/* Spending Personality */}
<div className="dashboard-panel personality-panel">

  <div className="panel-heading">

    <div>
      <h2>Spending Personality</h2>
      <p>Your financial behavior based on this month.</p>
    </div>

    <span className="personality-confidence">
      92% Match
    </span>

  </div>

  <div className="personality-profile">

    <div className="personality-main">

      <div className="personality-icon">
        ♛
      </div>

      <div>
        <span className="personality-label">
          Your personality
        </span>

        <h3>Balanced Planner</h3>

        <p>
          You maintain a healthy balance between spending,
          saving and enjoying your income.
        </p>
      </div>

    </div>

    <div className="personality-confidence-section">

      <div className="confidence-heading">
        <span>Personality confidence</span>
        <strong>92%</strong>
      </div>

      <div className="confidence-progress">
        <div className="confidence-progress-fill"></div>
      </div>

    </div>

    <div className="personality-traits">

      <div className="personality-trait positive-trait">
        <span>✓</span>

        <div>
          <strong>Consistent Saver</strong>
          <p>You regularly save before optional spending.</p>
        </div>
      </div>

      <div className="personality-trait positive-trait">
        <span>✓</span>

        <div>
          <strong>Budget Conscious</strong>
          <p>You rarely exceed your planned monthly budget.</p>
        </div>
      </div>

      <div className="personality-trait warning-trait">
        <span>!</span>

        <div>
          <strong>Weekend Spender</strong>
          <p>Your spending rises noticeably during weekends.</p>
        </div>
      </div>

    </div>

    <div className="personality-comparison">

      <h4>Compared with last month</h4>

      <div className="comparison-grid">

        <div className="comparison-card">
          <span>Savings</span>
          <strong className="comparison-positive">
            ↑ 11%
          </strong>
        </div>

        <div className="comparison-card">
          <span>Shopping</span>
          <strong className="comparison-positive">
            ↓ 8%
          </strong>
        </div>

        <div className="comparison-card">
          <span>Food</span>
          <strong className="comparison-negative">
            ↑ 5%
          </strong>
        </div>

      </div>

    </div>

  </div>

</div>

            {/* Recent Transactions */}
          <div className="dashboard-panel transactions-panel">

            <div className="panel-heading">

              <div>
                <h2>Recent Transactions</h2>
                <p>Your latest financial activity.</p>
              </div>

              <Link
                className="view-all-link"
                to="/transactions"
              >
                View All
              </Link>

            </div>

          <div className="transaction-list">

  {recentTransactions.slice(0, 3).map((transaction) => (
    <div
      className="transaction-item"
      key={transaction.id}
    >

      <div className="transaction-left">

        <div className="transaction-icon">
          {transaction.icon}
        </div>

        <div>
          <h3>{transaction.name}</h3>

          <p>
            {transaction.category} · {transaction.date}
          </p>
        </div>

      </div>

      <strong
        className={
          transaction.amount >= 0
            ? "transaction-positive"
            : "transaction-negative"
        }
      >
        {transaction.amount >= 0 ? "+ " : "- "}
        {formatCurrency(
          Math.abs(transaction.amount)
        )}
      </strong>

    </div>
  ))}

</div> 
</div>

            {/* Achievements */}
  <div className="dashboard-panel achievements-panel">

    <div className="panel-heading">

      <div>
        <h2>Financial Milestones</h2>

        <p>
          Your progress and financial milestones.
        </p>
      </div>

      <span className="achievement-count">
        3 / 4 Achieved
      </span>

    </div>

    <div className="achievements-grid">

      <div className="achievement-card unlocked-achievement">

        <div className="achievement-badge">
          💰
        </div>

        <div>
          <span className="achievement-status">
            Unlocked
          </span>

          <h3>First Savings Goal</h3>

          <p>
            Saved more than EGP 5,000 in one month.
          </p>
        </div>

      </div>

      <div className="achievement-card unlocked-achievement">

        <div className="achievement-badge">
          🔥
        </div>

        <div>
          <span className="achievement-status">
            Unlocked
          </span>

          <h3>Seven-Day Discipline</h3>

          <p>
            Completed seven days without unnecessary spending.
          </p>
        </div>

      </div>

      <div className="achievement-card unlocked-achievement">

        <div className="achievement-badge">
          👑
        </div>

        <div>
          <span className="achievement-status">
            Unlocked
          </span>

          <h3>Budget Master</h3>

          <p>
            Stayed below the monthly spending budget.
          </p>
        </div>

      </div>

      <div className="achievement-card locked-achievement">

        <div className="achievement-badge">
          🚫
        </div>

        <div>
          <span className="achievement-status">
            Locked
          </span>

          <h3>Subscription Review</h3>

          <p>
            Review and remove an unused recurring subscription.
          </p>
        </div>

      </div>

    </div>

    <div className="next-achievement">

      <div className="next-achievement-top">

        <div>
          <span>Next achievement</span>
          <strong>Subscription Review</strong>
        </div>

        <span>75%</span>

      </div>

      <div className="next-achievement-progress">
        <div className="next-achievement-fill"></div>
      </div>

      <p>
        Review one more recurring payment to complete this milestone.
      </p>

    </div>

  </div>
          </div>
        </section>

      </main>

      {/* Financial Health Popup */}
      {showHealthDetails && (
        <div
          className="health-modal-overlay"
          onClick={() =>
            setShowHealthDetails(false)
          }
        >
          <div
            className="health-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="health-modal-header">

              <div>

                <span className="modal-small-title">
                  Cashly Financial Report
                </span>

                <h2>Your Financial Health</h2>

                <p>
                  A detailed explanation of your current score.
                </p>

              </div>

              <button
                className="modal-close-button"
                type="button"
                onClick={() =>
                  setShowHealthDetails(false)
                }
              >
                ×
              </button>

            </div>

            <div className="modal-score-section">

              <div className="modal-score-circle">
                <strong>84</strong>
                <span>/ 100</span>
              </div>

              <div className="modal-score-information">

                <span className="modal-status">
                  Excellent
                </span>

                <h3>You are doing very well</h3>

                <p>
                  Your savings are strong, your expenses are
                  controlled and you are staying within your
                  monthly budget.
                </p>

              </div>

            </div>

            <div className="health-breakdown">

              <h3>Score Breakdown</h3>

              <div className="breakdown-item">

                <div className="breakdown-text">

                  <div>

                    <span className="breakdown-positive-icon">
                      +
                    </span>

                    <div>
                      <strong>Stayed within budget</strong>

                      <p>
                        Your spending remained below your
                        monthly limit.
                      </p>
                    </div>

                  </div>

                  <span className="breakdown-points positive-points">
                    +10
                  </span>

                </div>

              </div>

              <div className="breakdown-item">

                <div className="breakdown-text">

                  <div>

                    <span className="breakdown-positive-icon">
                      +
                    </span>

                    <div>
                      <strong>Consistent savings</strong>

                      <p>
                        You saved 42% of your monthly income.
                      </p>
                    </div>

                  </div>

                  <span className="breakdown-points positive-points">
                    +8
                  </span>

                </div>

              </div>

              <div className="breakdown-item">

                <div className="breakdown-text">

                  <div>

                    <span className="breakdown-negative-icon">
                      −
                    </span>

                    <div>
                      <strong>
                        Food spending increased
                      </strong>

                      <p>
                        Your food expenses increased during
                        weekends.
                      </p>
                    </div>

                  </div>

                  <span className="breakdown-points negative-points">
                    -4
                  </span>

                </div>

              </div>

              <div className="breakdown-item">

                <div className="breakdown-text">

                  <div>

                    <span className="breakdown-positive-icon">
                      +
                    </span>

                    <div>
                      <strong>
                        Income exceeded expenses
                      </strong>

                      <p>
                        Your income is comfortably higher than
                        your monthly expenses.
                      </p>
                    </div>

                  </div>

                  <span className="breakdown-points positive-points">
                    +6
                  </span>

                </div>

              </div>

            </div>

            <div className="health-recommendation">

              <div className="recommendation-icon">
                ✦
              </div>

              <div>

                <span>Cashly Recommendation</span>

                <h3>
                  Reduce weekend food spending by 8%
                </h3>

                <p>
                  This could save you approximately EGP 450
                  and help you reach a Financial Health Score
                  of 90 next month.
                </p>

              </div>

            </div>

            <div className="target-score-section">

              <div>
                <span>Next target</span>
                <strong> {financialHealth.targetScore} / 100</strong>
              </div>

              <div className="target-progress">
                <div className="target-progress-fill"></div>
              </div>

             <p>
  You are only{" "}
  {financialHealth.targetScore -
    financialHealth.score}{" "}
  points away from your next financial milestone.
</p>

            </div>

            <button
              className="modal-done-button"
              type="button"
              onClick={() =>
                setShowHealthDetails(false)
              }
            >
              Done
            </button>

          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard; 

