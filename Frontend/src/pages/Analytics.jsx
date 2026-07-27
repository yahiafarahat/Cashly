import { useState } from "react";
import { Link } from "react-router-dom";
import cashlyLogo from "../assets/cashly-img-removebg-preview.png";
import "../styles/Analytics.css";
import "../styles/Dashboard.css";

import {
  financialData,
  formatCurrency,
} from "../data/financialData";

function Analytics() {
  const {
    summary,
    comparisons,
    financialHealth,
    spendingCategories,
    weeklySpending,
  } = financialData;

  const [showIntelligenceReport, setShowIntelligenceReport] =
    useState(false);

  const [selectedPeriod, setSelectedPeriod] =
    useState("6-months");

  const userName =
    localStorage.getItem("cashlyUserName") || "Cashly User";

  const firstLetter = userName.charAt(0).toUpperCase();

  const remainingBudget =
    summary.budget - summary.expenses;

  const budgetUsedPercentage = Math.round(
    (summary.expenses / summary.budget) * 100
  );

  const budgetRemainingPercentage = Math.round(
    (remainingBudget / summary.budget) * 100
  );

  const savingsPercentage = Math.round(
    (summary.savings / summary.income) * 100
  );

  const averageDailySpend = Math.round(
    summary.expenses / 31
  );

  const dailyBudgetLimit = Math.round(
    summary.budget / 31
  );

  const dailyAmountBelowLimit =
    dailyBudgetLimit - averageDailySpend;

  const highestSpendingDay = weeklySpending.reduce(
    (highest, current) =>
      current.amount > highest.amount
        ? current
        : highest
  );

  const lowestSpendingDay = weeklySpending.reduce(
    (lowest, current) =>
      current.amount < lowest.amount
        ? current
        : lowest
  );

  const largestSpendingCategory =
    spendingCategories.reduce((largest, current) =>
      current.amount > largest.amount
        ? current
        : largest
    );

  const smallestSpendingCategory =
    spendingCategories.reduce((smallest, current) =>
      current.amount < smallest.amount
        ? current
        : smallest
    );


  const displayedMonthlyData =
    selectedPeriod === "6-months"
      ? financialData.monthlySpending
      : financialData.yearlySpending;


  const maximumDisplayedSpending = Math.max(
    ...displayedMonthlyData.map((item) => item.amount)
  );


  const maximumWeeklySpending = Math.max(
    ...weeklySpending.map((item) => item.amount)
  );

  const expectedAdditionalExpenses = 1300;

  const expectedExpenses =
    summary.expenses + expectedAdditionalExpenses;

  const expectedSavings = Math.max(
    summary.income - expectedExpenses,
    0
  );

  const predictedSavingsPercentage = Math.round(
    (expectedSavings / summary.income) * 100
  );

  const budgetSuccessChance =
    expectedExpenses <= summary.budget ? 92 : 64;

  const healthScoreDifference =
    financialHealth.targetScore -
    financialHealth.score;

  return (
    <div className="analytics-page">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <img src={cashlyLogo} alt="Cashly Logo" />
          <h2>Cashly</h2>
        </div>

        <nav className="sidebar-menu">
          <Link
            className="sidebar-link"
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
            className="sidebar-link active"
            to="/analytics"
          >
            <span>◫</span>
            Analytics
          </Link>

          <Link
            className="sidebar-link"
            to="/dashboard#challenges"
          >
            <span>★</span>
            Challenges
          </Link>

          <a
            className="sidebar-link"
            href="#settings"
          >
            <span>⚙</span>
            Settings
          </a>
        </nav>

        <Link className="logout-link" to="/login">
          <span>←</span>
          Logout
        </Link>
      </aside>

      {/* Main content */}
      <main className="analytics-main">
        {/* Navbar */}
        <header className="analytics-navbar">
          <div>
            <span className="analytics-page-label">
              Financial Intelligence
            </span>

            <h1>Analytics Overview</h1>

            <p>
              Understand your spending patterns and predict
              your financial future.
            </p>
          </div>

          <div className="analytics-navbar-actions">
            <input
              className="analytics-search"
              type="text"
              placeholder="Search analytics..."
            />

            <button
              className="analytics-notification-button"
              type="button"
            >
              🔔
            </button>

            <div className="analytics-user-profile">
              <div className="analytics-profile-circle">
                {firstLetter}
              </div>

              <div>
                <strong>{userName}</strong>
                <span>Cashly User</span>
              </div>
            </div>
          </div>
        </header>

        {/* Top summary cards */}
        <section className="analytics-summary-grid">
          <div className="analytics-summary-card">
            <div className="analytics-summary-top">
              <span>Total Expenses</span>

              <div className="analytics-summary-icon">
                ↑
              </div>
            </div>

            <h2>
              {formatCurrency(summary.expenses)}
            </h2>

            <p className="analytics-negative-text">
              {comparisons.expensesChange}% higher than last
              month
            </p>
          </div>

          <div className="analytics-summary-card">
            <div className="analytics-summary-top">
              <span>Average Daily Spend</span>

              <div className="analytics-summary-icon">
                ◷
              </div>
            </div>

            <h2>
              {formatCurrency(averageDailySpend)}
            </h2>

            <p className="analytics-positive-text">
              {dailyAmountBelowLimit > 0
                ? `${formatCurrency(
                    dailyAmountBelowLimit
                  )} below your daily limit`
                : `${formatCurrency(
                    Math.abs(dailyAmountBelowLimit)
                  )} above your daily limit`}
            </p>
          </div>

          <div className="analytics-summary-card">
            <div className="analytics-summary-top">
              <span>Highest Spending Day</span>

              <div className="analytics-summary-icon">
                📅
              </div>
            </div>

            <h2>{highestSpendingDay.day}</h2>

            <p className="analytics-neutral-text">
              Average:{" "}
              {formatCurrency(
                highestSpendingDay.amount
              )}
            </p>
          </div>

          <div className="analytics-summary-card">
            <div className="analytics-summary-top">
              <span>Budget Remaining</span>

              <div className="analytics-summary-icon">
                ◆
              </div>
            </div>

            <h2>{formatCurrency(remainingBudget)}</h2>

            <p className="analytics-positive-text">
              {budgetRemainingPercentage}% still available
            </p>
          </div>
        </section>

        {/* Main analytics grid */}
        <section className="analytics-content-grid">
          {/* Monthly spending chart */}
          <div className="analytics-panel monthly-trend-panel">
            <div className="analytics-panel-heading">
              <div>
                <h2>Monthly Spending Trend</h2>

                <p>
{selectedPeriod === "6-months"
  ? "Your expenses during the last six months."
  : "Your expenses throughout the current year."}                </p>
              </div>

              <select
  className="analytics-period-select"
  value={selectedPeriod}
  onChange={(event) =>
    setSelectedPeriod(event.target.value)
  }
>
                <option value="6-months">
                  Last 6 Months
                </option>

                <option value="year">
                  This Year
                </option>
              </select>
            </div>

            <div className="monthly-chart">
              <div className="chart-value-lines">
                <span>EGP 8K</span>
                <span>EGP 6K</span>
                <span>EGP 4K</span>
                <span>EGP 2K</span>
                <span>EGP 0</span>
              </div>

              <div className="monthly-bars">
{displayedMonthlyData.map((item) => (
                      <div
                    className="monthly-bar-column"
                    key={item.month}
                  >
                    <div className="monthly-bar-area">
                      <span className="monthly-bar-value">
                        {formatCurrency(item.amount)}
                      </span>

                      <div
                        className="monthly-bar"
                        style={{
                          height: `${
                            (item.amount /
maximumDisplayedSpending) * 100
                          }%`,
                        }}
                      ></div>
                    </div>

                    <span className="monthly-label">
                      {item.month}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Budget usage */}
          <div className="analytics-panel budget-usage-panel">
            <div className="analytics-panel-heading">
              <div>
                <h2>Budget Usage</h2>

                <p>
                  Your monthly budget progress.
                </p>
              </div>
            </div>

            <div className="budget-gauge">
              <div
                className="budget-gauge-circle"
                style={{
                  background: `conic-gradient(
                    #d4af37 0deg ${
                      budgetUsedPercentage * 3.6
                    }deg,
                    #343434 ${
                      budgetUsedPercentage * 3.6
                    }deg 360deg
                  )`,
                }}
              >
                <div className="budget-gauge-center">
                  <strong>
                    {budgetUsedPercentage}%
                  </strong>

                  <span>Used</span>
                </div>
              </div>
            </div>

            <div className="budget-usage-numbers">
              <div>
                <span>Spent</span>

                <strong>
                  {formatCurrency(summary.expenses)}
                </strong>
              </div>

              <div>
                <span>Budget</span>

                <strong>
                  {formatCurrency(summary.budget)}
                </strong>
              </div>
            </div>

            <div className="budget-status-message">
              <span>✓</span>

              <p>
                You are currently on track to remain within
                your monthly budget.
              </p>
            </div>
          </div>

          {/* Spending categories */}
          <div className="analytics-panel categories-panel">
            <div className="analytics-panel-heading">
              <div>
                <h2>Spending Breakdown</h2>

                <p>
                  Where your money went this month.
                </p>
              </div>

              <span className="analytics-total-label">
                {formatCurrency(summary.expenses)}
              </span>
            </div>

            <div className="spending-breakdown-content">
              <div className="spending-donut">
                <div className="spending-donut-center">
                  <strong>
                    {largestSpendingCategory.percentage}%
                  </strong>

                  <span>
                    {largestSpendingCategory.name}
                  </span>
                </div>
              </div>

              <div className="category-list">
                {spendingCategories.map((category) => (
                  <div
                    className="category-item"
                    key={category.name}
                  >
                    <div className="category-information">
                      <div className="category-icon">
                        {category.icon}
                      </div>

                      <div>
                        <strong>
                          {category.name}
                        </strong>

                        <span>
                          {formatCurrency(
                            category.amount
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="category-percentage-area">
                      <strong>
                        {category.percentage}%
                      </strong>

                      <div className="category-progress">
                        <div
                          className="category-progress-fill"
                          style={{
                            width: `${category.percentage}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly spending */}
          <div className="analytics-panel weekly-spending-panel">
            <div className="analytics-panel-heading">
              <div>
                <h2>Weekly Spending Pattern</h2>

                <p>
                  Your average spending for each day.
                </p>
              </div>
            </div>

            <div className="weekly-spending-list">
              {weeklySpending.map((item) => (
                <div
                  className="weekly-spending-item"
                  key={item.day}
                >
                  <div className="weekly-day-information">
                    <span>{item.day}</span>

                    <strong>
                      {formatCurrency(item.amount)}
                    </strong>
                  </div>

                  <div className="weekly-progress">
                    <div
                      className="weekly-progress-fill"
                      style={{
                        width: `${
                          (item.amount /
                            maximumWeeklySpending) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Forecast section */}
        <section className="forecast-section">
          <div className="analytics-panel forecast-panel">
            <div className="forecast-heading">
              <div>
                <span className="forecast-small-label">
                  Cashly Prediction
                </span>

                <h2>Your Spending Forecast</h2>

                <p>
                  Based on your current spending rate and
                  recent financial behavior.
                </p>
              </div>

              <div className="forecast-icon">
                ✦
              </div>
            </div>

            <div className="forecast-grid">
              <div className="forecast-card">
                <span>Expected Expenses</span>

                <strong>
                  {formatCurrency(expectedExpenses)}
                </strong>

                <p>
                  {formatCurrency(
                    expectedAdditionalExpenses
                  )}{" "}
                  more before month end
                </p>
              </div>

              <div className="forecast-card">
                <span>Expected Savings</span>

                <strong>
                  {formatCurrency(expectedSavings)}
                </strong>

                <p>
                  Approximately{" "}
                  {predictedSavingsPercentage}% of your
                  income
                </p>
              </div>

              <div className="forecast-card">
                <span>Budget Success Chance</span>

                <strong>
                  {budgetSuccessChance}%
                </strong>

                <p>
                  High probability of staying on track
                </p>
              </div>
            </div>
          </div>

          {/* Cashly summary */}
          <div className="analytics-panel ai-summary-panel">
            <div className="ai-summary-icon">
              ✦
            </div>

            <div className="ai-summary-content">
              <span className="ai-summary-label">
                Cashly Intelligence
              </span>

              <h2>Your Monthly Financial Summary</h2>

              <p>
                You saved {savingsPercentage}% of your
                income this month.{" "}
                {largestSpendingCategory.name} remains your
                largest expense category, while{" "}
                {highestSpendingDay.day} is your most
                expensive day. Based on your current
                activity, you have a{" "}
                {budgetSuccessChance}% chance of remaining
                within your budget.
              </p>

              <div className="ai-summary-tags">
                <span>
                  {savingsPercentage}% Saved
                </span>

                <span>
                  {budgetRemainingPercentage}% Budget Left
                </span>

                <span>
                  {largestSpendingCategory.name} Warning
                </span>
              </div>

              <button
                className="open-intelligence-button"
                type="button"
                onClick={() =>
                  setShowIntelligenceReport(true)
                }
              >
                Open Full Intelligence Report
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Cashly Intelligence Report */}
      {showIntelligenceReport && (
        <div
          className="intelligence-modal-overlay"
          onClick={() =>
            setShowIntelligenceReport(false)
          }
        >
          <div
            className="intelligence-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="intelligence-modal-header">
              <div>
                <span className="intelligence-report-label">
                  Cashly Intelligence
                </span>

                <h2>
                  Your Financial Intelligence Report
                </h2>

                <p>
                  A personalized analysis generated from
                  your financial activity.
                </p>
              </div>

              <button
                className="intelligence-close-button"
                type="button"
                onClick={() =>
                  setShowIntelligenceReport(false)
                }
              >
                ×
              </button>
            </div>

            <div className="intelligence-welcome-card">
              <div className="intelligence-avatar">
                {firstLetter}
              </div>

              <div>
                <span>Prepared for</span>

                <h3>Hello, {userName} 👋</h3>

                <p>
                  Cashly analyzed your spending, savings,
                  budget, and financial behavior for this
                  month.
                </p>
              </div>
            </div>

            <div className="intelligence-score-card">
              <div className="intelligence-score-circle">
                <strong>
                  {financialHealth.score}
                </strong>

                <span>/ 100</span>
              </div>

              <div>
                <span className="intelligence-status">
                  {financialHealth.status}
                </span>

                <h3>Your financial health is strong</h3>

                <p>
                  Your score improved by{" "}
                  {comparisons.healthImprovement} points
                  this month. You are only{" "}
                  {healthScoreDifference} points away from
                  your next target.
                </p>
              </div>
            </div>

            <div className="intelligence-report-grid">
              <div className="intelligence-report-card positive-report-card">
                <div className="report-card-icon">
                  📈
                </div>

                <span>Biggest Strength</span>

                <h3>Consistent Savings</h3>

                <strong>
                  {savingsPercentage}% of income
                </strong>

                <p>
                  You saved{" "}
                  {formatCurrency(summary.savings)} this
                  month, which shows strong financial
                  discipline.
                </p>
              </div>

              <div className="intelligence-report-card warning-report-card">
                <div className="report-card-icon">
                  ⚠
                </div>

                <span>Needs Attention</span>

                <h3>
                  {largestSpendingCategory.name} Spending
                </h3>

                <strong>
                  {formatCurrency(
                    largestSpendingCategory.amount
                  )}
                </strong>

                <p>
                  This category represents{" "}
                  {largestSpendingCategory.percentage}% of
                  your total monthly expenses.
                </p>
              </div>

              <div className="intelligence-report-card">
                <div className="report-card-icon">
                  📅
                </div>

                <span>Highest Spending Day</span>

                <h3>{highestSpendingDay.day}</h3>

                <strong>
                  {formatCurrency(
                    highestSpendingDay.amount
                  )}
                </strong>

                <p>
                  Your spending is highest on{" "}
                  {highestSpendingDay.day} and lowest on{" "}
                  {lowestSpendingDay.day}.
                </p>
              </div>

              <div className="intelligence-report-card">
                <div className="report-card-icon">
                  🔮
                </div>

                <span>Cashly Prediction</span>

                <h3>Budget Success</h3>

                <strong>
                  {budgetSuccessChance}%
                </strong>

                <p>
                  You are expected to finish the month with{" "}
                  {formatCurrency(expectedSavings)} in
                  savings.
                </p>
              </div>
            </div>

            <div className="intelligence-observations">
              <div className="intelligence-section-heading">
                <span>✦</span>

                <div>
                  <h3>What Cashly Noticed</h3>

                  <p>
                    Important patterns found in your data.
                  </p>
                </div>
              </div>

              <div className="observation-list">
                <div className="observation-item">
                  <span className="observation-number">
                    01
                  </span>

                  <p>
                    You currently have{" "}
                    <strong>
                      {formatCurrency(remainingBudget)}
                    </strong>{" "}
                    remaining from your monthly budget.
                  </p>
                </div>

                <div className="observation-item">
                  <span className="observation-number">
                    02
                  </span>

                  <p>
                    Your smallest spending category is{" "}
                    <strong>
                      {smallestSpendingCategory.name}
                    </strong>{" "}
                    at{" "}
                    <strong>
                      {formatCurrency(
                        smallestSpendingCategory.amount
                      )}
                    </strong>
                    .
                  </p>
                </div>

                <div className="observation-item">
                  <span className="observation-number">
                    03
                  </span>

                  <p>
                    Your average daily spending is{" "}
                    <strong>
                      {formatCurrency(averageDailySpend)}
                    </strong>
                    .
                  </p>
                </div>

                <div className="observation-item">
                  <span className="observation-number">
                    04
                  </span>

                  <p>
                    Your expenses increased by{" "}
                    <strong>
                      {comparisons.expensesChange}%
                    </strong>{" "}
                    compared with last month.
                  </p>
                </div>
              </div>
            </div>

            <div className="intelligence-recommendation">
              <div className="recommendation-symbol">
                ✦
              </div>

              <div>
                <span>
                  Personalized Recommendation
                </span>

                <h3>
                  Reduce{" "}
                  {largestSpendingCategory.name.toLowerCase()}{" "}
                  spending by 8%
                </h3>

                <p>
                  Reducing this category by approximately{" "}
                  {formatCurrency(
                    Math.round(
                      largestSpendingCategory.amount * 0.08
                    )
                  )}{" "}
                  could help you reach a Financial Health
                  Score of{" "}
                  {financialHealth.targetScore}.
                </p>
              </div>
            </div>

            <div className="intelligence-actions">
              <button
                className="intelligence-secondary-button"
                type="button"
                onClick={() =>
                  window.print()
                }
              >
                Print Report
              </button>

              <button
                className="intelligence-done-button"
                type="button"
                onClick={() =>
                  setShowIntelligenceReport(false)
                }
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;