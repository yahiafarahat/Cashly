import { useState } from "react";
import { Link } from "react-router-dom";

import cashlyLogo from "../assets/cashly-img-removebg-preview.png";
import { logoutUser } from "../services/auth";

import "../styles/Dashboard.css";
import "../styles/Challenges.css";

import {
  financialData,
  formatCurrency,
} from "../data/financialData";

const startingDailyChallenges = [
  {
    id: 1,
    icon: "☕",
    title: "Coffee Spending Pause",
    description:
      "Avoid buying coffee outside today and keep that amount within your daily budget.",
    reward: 15,
    difficulty: "Easy",
    completed: false,
  },
  {
    id: 2,
    icon: "🧾",
    title: "Record Today’s Spending",
    description:
      "Record each purchase today to keep your spending data accurate.",
    reward: 10,
    difficulty: "Easy",
    completed: false,
  },
  {
    id: 3,
    icon: "💰",
    title: "Savings Transfer",
    description:
      "Transfer at least EGP 50 to your savings account today.",
    reward: 20,
    difficulty: "Medium",
    completed: false,
  },
  {
    id: 4,
    icon: "🍳",
    title: "Reduce Dining Spend",
    description:
      "Replace one restaurant or delivery order with a meal prepared at home.",
    reward: 20,
    difficulty: "Medium",
    completed: false,
  },
];

function Challenges() {
  const { challenge } = financialData;

  const userName =
    localStorage.getItem("cashlyUserName") || "Cashly User";

  const firstLetter = userName.charAt(0).toUpperCase();

  const challengeProgressStart = Math.round(
    (challenge.spent / challenge.limit) * 100
  );

  const [challengeProgress, setChallengeProgress] =
    useState(challengeProgressStart);

  const [challengeCheckedIn, setChallengeCheckedIn] =
    useState(false);

  const [currentStreak, setCurrentStreak] = useState(6);

  const [dailyChallenges, setDailyChallenges] = useState(
    startingDailyChallenges
  );

  function handleChallengeCheckIn() {
    if (!challengeCheckedIn) {
      setChallengeProgress((currentProgress) =>
        Math.min(currentProgress + 10, 100)
      );

      setCurrentStreak(
        (currentStreakValue) => currentStreakValue + 1
      );

      setChallengeCheckedIn(true);
    }
  }

  function completeDailyChallenge(challengeId) {
    setDailyChallenges((currentChallenges) =>
      currentChallenges.map((dailyChallenge) =>
        dailyChallenge.id === challengeId
          ? {
              ...dailyChallenge,
              completed: true,
            }
          : dailyChallenge
      )
    );
  }

  const completedDailyChallenges =
    dailyChallenges.filter(
      (dailyChallenge) => dailyChallenge.completed
    ).length;

  const earnedDailyXp = dailyChallenges
    .filter((dailyChallenge) => dailyChallenge.completed)
    .reduce(
      (totalXp, dailyChallenge) =>
        totalXp + dailyChallenge.reward,
      0
    );

  const baseXp = 420;
  const featuredChallengeXp = challengeCheckedIn ? 10 : 0;
  const totalXp =
    baseXp + earnedDailyXp + featuredChallengeXp;

  const currentLevel = totalXp >= 500 ? 7 : 6;

  const levelTitle =
    currentLevel === 7
      ? "Financial Strategist"
      : "Building Momentum";

  const levelStartXp = currentLevel === 7 ? 500 : 0;
  const nextLevelXp = currentLevel === 7 ? 650 : 500;

  const levelProgress = Math.round(
    ((totalXp - levelStartXp) /
      (nextLevelXp - levelStartXp)) *
      100
  );

  const xpUntilNextLevel = Math.max(
    nextLevelXp - totalXp,
    0
  );

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <img src={cashlyLogo} alt="Cashly Logo" />
          <h2>Cashly</h2>
        </div>

        <nav className="sidebar-menu">
          <Link className="sidebar-link" to="/dashboard">
            <span>⌂</span>
            Dashboard
          </Link>

          <Link className="sidebar-link" to="/transactions">
            <span>↔</span>
            Transactions
          </Link>

          <Link className="sidebar-link" to="/analytics">
            <span>◫</span>
            Analytics
          </Link>

          <Link
            className="sidebar-link active"
            to="/challenges"
          >
            <span>★</span>
            Challenges
          </Link>

          <Link className="sidebar-link" to="/settings">
            <span>⚙</span>
            Settings
          </Link>
        </nav>

        <Link className="logout-link" to="/login" onClick={logoutUser}>
          <span>←</span>
          Logout
        </Link>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-navbar">
          <div>
            <h1>Financial Challenges</h1>
            <p>
              Build better financial habits with focused daily
              actions and measurable monthly goals.
            </p>
          </div>

          <div className="navbar-actions">
            <input
              className="dashboard-search"
              type="text"
              placeholder="Search financial challenges..."
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

        <section className="challenges-content-layout">
          <div className="challenges-column challenges-column-left">
            <div className="dashboard-panel monthly-challenge-panel">
            <div className="challenge-top">
              <div>
                <span className="challenge-small-label">
                  Monthly Budget Goal
                </span>

                <h2>{challenge.title}</h2>

                <p>
                  Keep restaurant and food delivery spending below{" "}
                  {formatCurrency(challenge.limit)} this month
                  to protect your budget and maintain steady
                  financial progress.
                </p>
              </div>

              <div className="challenge-trophy">🏆</div>
            </div>

            <div className="challenge-progress-information">
              <div className="challenge-progress-heading">
                <span>Budget progress</span>
                <strong>
                  {challengeProgress}% used
                </strong>
              </div>

              <div className="challenge-progress-bar">
                <div
                  className="challenge-progress-fill"
                  style={{ width: `${challengeProgress}%` }}
                ></div>
              </div>

              <div className="challenge-numbers">
                <span>
                  Spent: {formatCurrency(challenge.spent)}
                </span>
                <span>
                  Budget: {formatCurrency(challenge.limit)}
                </span>
              </div>
            </div>

            <div className="featured-challenge-stats">
              <div className="challenge-detail-card">
                <span>Progress points</span>
                <strong>
                  +{challenge.reward * 10} pts
                </strong>
              </div>

              <div className="challenge-detail-card">
                <span>Consistency streak</span>
                <strong>{currentStreak} Days</strong>
              </div>

              <div className="challenge-detail-card">
                <span>Days remaining</span>
                <strong>{challenge.daysRemaining}</strong>
              </div>

              <div className="challenge-detail-card">
                <span>Budget remaining</span>
                <strong>
                  {formatCurrency(
                    challenge.limit - challenge.spent
                  )}
                </strong>
              </div>
            </div>

            <div className="challenge-tip">
              <div className="challenge-tip-icon">✦</div>

              <div>
                <strong>Recommended Action</strong>
                <p>
                  Replace one restaurant or delivery order this week
                  with a home-prepared meal to create more room
                  in your monthly dining budget.
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
                ? "✓ Daily Review Completed · +10 pts"
                : "Complete Daily Review"}
            </button>
          </div>

            <div className="dashboard-panel achievements-panel">
            <div className="panel-heading">
              <div>
                <h2>Financial Milestones</h2>
                <p>
                  A clear record of the habits and results you have built.
                </p>
              </div>

              <span className="achievement-count">
                3 of 6 completed
              </span>
            </div>

            <div className="achievements-grid">
              <div className="achievement-card unlocked-achievement">
                <div className="achievement-badge">💰</div>
                <div>
                  <span className="achievement-status">
                    Completed
                  </span>
                  <h3>First Savings Goal</h3>
                  <p>
                    Saved more than EGP 5,000 in one month.
                  </p>
                </div>
              </div>

              <div className="achievement-card unlocked-achievement">
                <div className="achievement-badge">🔥</div>
                <div>
                  <span className="achievement-status">
                    Completed
                  </span>
                  <h3>Seven-Day Discipline</h3>
                  <p>
                    Avoided unnecessary spending for seven
                    consecutive days.
                  </p>
                </div>
              </div>

              <div className="achievement-card unlocked-achievement">
                <div className="achievement-badge">👑</div>
                <div>
                  <span className="achievement-status">
                    Completed
                  </span>
                  <h3>Budget Master</h3>
                  <p>
                    Stayed within the monthly spending budget.
                  </p>
                </div>
              </div>

              <div className="achievement-card locked-achievement">
                <div className="achievement-badge">🚫</div>
                <div>
                  <span className="achievement-status">
                    In progress
                  </span>
                  <h3>Subscription Slayer</h3>
                  <p>
                    Cancel an unused recurring subscription to reduce
                    monthly expenses.
                  </p>
                </div>
              </div>

              <div className="achievement-card locked-achievement">
                <div className="achievement-badge">📈</div>
                <div>
                  <span className="achievement-status">
                    In progress
                  </span>
                  <h3>Savings Streak</h3>
                  <p>
                    Increase savings for three consecutive months.
                  </p>
                </div>
              </div>

              <div className="achievement-card locked-achievement">
                <div className="achievement-badge">💎</div>
                <div>
                  <span className="achievement-status">
                    In progress
                  </span>
                  <h3>Financial Elite</h3>
                  <p>
                    Reach a Financial Health Score of 95.
                  </p>
                </div>
              </div>
            </div>

            <div className="next-achievement">
              <div className="next-achievement-top">
                <div>
                  <span>Next milestone</span>
                  <strong>Subscription Slayer</strong>
                </div>
                <span>75%</span>
              </div>

              <div className="next-achievement-progress">
                <div className="next-achievement-fill"></div>
              </div>

              <p>
                Review one more recurring subscription to complete
                this milestone.
              </p>
            </div>
          </div>
          </div>

          <div className="challenges-column challenges-column-right">
            <section className="dashboard-panel daily-challenges-panel">
            <div className="daily-challenges-header">
              <div>
                <span className="challenge-section-label">
                  Daily Financial Actions
                </span>

                <h2>Today’s Priorities</h2>

                <p>
                  Complete these focused actions today to improve
                  spending awareness and saving consistency.
                </p>
              </div>

              <div className="daily-summary">
                <strong>
                  {completedDailyChallenges} /{" "}
                  {dailyChallenges.length}
                </strong>
                <span>Completed</span>
              </div>
            </div>

            <div className="daily-progress-section">
              <div className="daily-progress-heading">
                <span>Daily progress</span>
                <strong>
                  {earnedDailyXp} points earned
                </strong>
              </div>

              <div className="daily-progress-bar">
                <div
                  className="daily-progress-fill"
                  style={{
                    width: `${
                      (completedDailyChallenges /
                        dailyChallenges.length) *
                      100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="daily-challenges-grid">
              {dailyChallenges.map((dailyChallenge) => (
                <article
                  className={`daily-challenge-card ${
                    dailyChallenge.completed
                      ? "daily-challenge-completed"
                      : ""
                  }`}
                  key={dailyChallenge.id}
                >
                  <div className="daily-challenge-top">
                    <div className="daily-challenge-icon">
                      {dailyChallenge.icon}
                    </div>

                    <span
                      className={`daily-difficulty ${
                        dailyChallenge.difficulty ===
                        "Medium"
                          ? "medium-difficulty"
                          : ""
                      }`}
                    >
                      {dailyChallenge.difficulty}
                    </span>
                  </div>

                  <div className="daily-challenge-content">
                    <h3>{dailyChallenge.title}</h3>
                    <p>{dailyChallenge.description}</p>
                  </div>

                  <div className="daily-challenge-footer">
                    <div className="daily-xp-reward">
                      <span>Progress</span>
                      <strong>
                        +{dailyChallenge.reward} pts
                      </strong>
                    </div>

                    <button
                      className={`daily-complete-button ${
                        dailyChallenge.completed
                          ? "daily-completed-button"
                          : ""
                      }`}
                      type="button"
                      onClick={() =>
                        completeDailyChallenge(
                          dailyChallenge.id
                        )
                      }
                      disabled={dailyChallenge.completed}
                    >
                      {dailyChallenge.completed
                        ? "✓ Completed"
                        : "Complete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="daily-reset-message">
              <span>◷</span>
              <p>
                Today’s actions refresh in{" "}
                <strong>6 hours and 24 minutes</strong>.
              </p>
            </div>
          </section>

            <section className="dashboard-panel level-panel">
            <div className="compact-level-header">
              <div className="compact-level-title">
                <div className="compact-level-icon">
                  {currentLevel}
                </div>

                <div>
                  <span className="challenge-section-label">
                    Progress Overview
                  </span>

                  <h2>{levelTitle}</h2>
                </div>
              </div>

              <span className="level-xp-today">
                Today · +{earnedDailyXp + featuredChallengeXp} pts
              </span>
            </div>

            <div className="level-progress-heading">
              <span>
                {totalXp} / {nextLevelXp} points
              </span>
              <strong>{levelProgress}%</strong>
            </div>

            <div className="level-progress-bar">
              <div
                className="level-progress-fill"
                style={{
                  width: `${Math.min(levelProgress, 100)}%`,
                }}
              ></div>
            </div>

            <div className="compact-level-footer">
              <p>
                <strong>{xpUntilNextLevel} points</strong> until
                Level {currentLevel + 1}
              </p>

              <div className="next-unlock">
                <span>Next status</span>
                <strong>Financial Strategist</strong>
              </div>
            </div>
          </section>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Challenges;