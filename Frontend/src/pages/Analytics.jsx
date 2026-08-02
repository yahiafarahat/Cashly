import {
  useEffect,
  useMemo,
  useState
} from "react";

import { Card } from "@/components/ui/card";

import AppSidebar from "../components/AppSidebar";
import UserProfile from "../components/UserProfile";
import { getAnalyticsSummary } from "../services/analytics";

import "../styles/Dashboard.css";
import "../styles/AnalyticsSimple.css";


const CATEGORY_STYLES = {
  Food: {
    color: "#e8c45b",
    icon: "🍔"
  },
  Groceries: {
    color: "#e8c45b",
    icon: "🛒"
  },
  Bills: {
    color: "#738bd7",
    icon: "⌂"
  },
  Transport: {
    color: "#5eb9a0",
    icon: "🚕"
  },
  Shopping: {
    color: "#cf7f83",
    icon: "◊"
  },
  Entertainment: {
    color: "#9876c7",
    icon: "♪"
  },
  Health: {
    color: "#69a8c9",
    icon: "✚"
  },
  Education: {
    color: "#d28f52",
    icon: "⌘"
  }
};


const FALLBACK_STYLES = [
  {
    color: "#e8c45b",
    icon: "•"
  },
  {
    color: "#738bd7",
    icon: "•"
  },
  {
    color: "#5eb9a0",
    icon: "•"
  },
  {
    color: "#cf7f83",
    icon: "•"
  },
  {
    color: "#9876c7",
    icon: "•"
  }
];


const INSIGHT_ICONS = [
  "✦",
  "◉",
  "↘",
  "!"
];


function Icon({
  name,
  size = 20
}) {
  const paths = {
    spark: (
      <path
        d="m12 3-1.2 4.2a5 5 0 0 1-3.6 3.6L3 12l4.2 1.2a5 5 0 0 1 3.6 3.6L12 21l1.2-4.2a5 5 0 0 1 3.6-3.6L21 12l-4.2-1.2a5 5 0 0 1-3.6-3.6L12 3Z"
      />
    ),
    arrow: (
      <path d="m9 18 6-6-6-6" />
    )
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}


function formatCurrency(value) {
  return Number(value || 0).toLocaleString(
    "en-EG",
    {
      maximumFractionDigits: 2
    }
  );
}


function formatCategoryChange(category) {
  const change = category.change_percent;

  if (change === null || change === undefined) {
    return "New";
  }

  if (change > 1) {
    return `↑ ${Math.abs(change)}%`;
  }

  if (change < -1) {
    return `↓ ${Math.abs(change)}%`;
  }

  return "Stable";
}


function createDonutSegments(categories) {
  if (!categories.length) {
    return "#2a2a2a 0% 100%";
  }

  let currentPercent = 0;

  return categories
    .map((category) => {
      const start = currentPercent;

      currentPercent += category.percent;

      const end = Math.min(
        currentPercent,
        100
      );

      return (
        `${category.color} ` +
        `${start}% ${end}%`
      );
    })
    .join(", ");
}


function TrendChart({
  monthlyValues,
  monthLabels
}) {
  const width = 900;
  const height = 250;
  const padX = 20;
  const padY = 26;
  const chartBottom = height - padY;

  const safeValues = monthlyValues.length
    ? monthlyValues
    : [0];

  const highestValue = Math.max(
    ...safeValues,
    1
  );

  const chartMaximum = highestValue * 1.15;

  const pointDistance =
    monthlyValues.length > 1
      ? (
          (width - padX * 2)
          / (monthlyValues.length - 1)
        )
      : 0;

  const points = monthlyValues.map(
    (value, index) => {
      const x =
        padX + index * pointDistance;

      const y =
        padY +
        (
          (chartMaximum - value)
          / chartMaximum
        ) *
        (chartBottom - padY);

      return {
        x,
        y
      };
    }
  );

  const line = points
    .map(
      (point, index) =>
        `${index ? "L" : "M"}` +
        `${point.x},${point.y}`
    )
    .join(" ");

  const lastPoint =
    points[points.length - 1];

  const firstPoint = points[0];

  const area =
    points.length > 0
      ? (
          `${line} ` +
          `L${lastPoint.x},${chartBottom} ` +
          `L${firstPoint.x},${chartBottom} Z`
        )
      : "";

  return (
    <div className="trend-chart-wrap">
      <svg
        className="trend-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Monthly spending trend"
      >
        <defs>
          <linearGradient
            id="trendFill"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0"
              stopColor="#dfbb52"
              stopOpacity=".3"
            />

            <stop
              offset="1"
              stopColor="#dfbb52"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        {[50, 110, 170, 224].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2={width}
            y2={y}
            className="trend-grid"
          />
        ))}

        {area && (
          <>
            <path
              d={area}
              fill="url(#trendFill)"
            />

            <path
              d={line}
              className="trend-line"
            />
          </>
        )}

        {points.map((point, index) => (
          <g
            key={`${monthLabels[index]}-${index}`}
            className="trend-point"
          >
            <circle
              cx={point.x}
              cy={point.y}
              r="11"
              className="trend-point-hit"
            />

            <circle
              cx={point.x}
              cy={point.y}
              r={
                index === points.length - 1
                  ? 5
                  : 3
              }
            />

            <text
              x={point.x}
              y={point.y - 17}
            >
              EGP{" "}
              {formatCurrency(
                monthlyValues[index]
              )}
            </text>
          </g>
        ))}
      </svg>

      <div className="month-labels">
        {monthLabels.map((month, index) => (
          <span key={`${month}-${index}`}>
            {month}
          </span>
        ))}
      </div>
    </div>
  );
}


function Analytics() {
  const [analytics, setAnalytics] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    const controller =
      new AbortController();

    async function loadAnalytics() {
      setIsLoading(true);
      setError("");

      try {
        const data =
          await getAnalyticsSummary(
            controller.signal
          );

        setAnalytics(data);
      } catch (requestError) {
        if (
          requestError.name !== "AbortError"
        ) {
          setError(requestError.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      controller.abort();
    };
  }, []);


  const categories = useMemo(() => {
    if (!analytics) {
      return [];
    }

    return analytics.category_breakdown.map(
      (category, index) => {
        const style =
          CATEGORY_STYLES[category.name] ||
          FALLBACK_STYLES[
            index % FALLBACK_STYLES.length
          ];

        return {
          ...category,
          color: style.color,
          icon: style.icon,
          change:
            formatCategoryChange(category)
        };
      }
    );
  }, [analytics]);


  const donutSegments = useMemo(
    () => createDonutSegments(categories),
    [categories]
  );


  if (isLoading) {
    return (
      <div className="analytics-simple-page">
        <AppSidebar active="analytics" />

        <main className="analytics-simple-main">
          <header className="analytics-simple-header">
            <div>
              <span className="analytics-kicker">
                YOUR MONEY, EXPLAINED
              </span>

              <h1>
                Loading your analytics...
              </h1>

              <p>
                Cashly is calculating your
                latest spending patterns.
              </p>
            </div>

            <UserProfile />
          </header>
        </main>
      </div>
    );
  }


  if (error || !analytics) {
    return (
      <div className="analytics-simple-page">
        <AppSidebar active="analytics" />

        <main className="analytics-simple-main">
          <header className="analytics-simple-header">
            <div>
              <span className="analytics-kicker">
                YOUR MONEY, EXPLAINED
              </span>

              <h1>
                Analytics could not be loaded
              </h1>

              <p>
                {error ||
                  "Please try again later."}
              </p>
            </div>

            <UserProfile />
          </header>
        </main>
      </div>
    );
  }


  const monthlyValues =
    analytics.monthly_trend.map(
      (month) => month.amount
    );

  const monthLabels =
    analytics.monthly_trend.map(
      (month) => month.month
    );

  const trendChange =
    analytics.trend_change_percent;

  const amountDifference =
    analytics.amount_difference;

  const opportunity =
    analytics.biggest_opportunity;


  function getTrendCaption() {
    if (amountDifference > 0) {
      return (
        <>
          Your spending decreased. You kept{" "}
          <strong>
            EGP{" "}
            {formatCurrency(
              amountDifference
            )}{" "}
            more
          </strong>{" "}
          in the latest month.
        </>
      );
    }

    if (amountDifference < 0) {
      return (
        <>
          Your spending increased by{" "}
          <strong>
            EGP{" "}
            {formatCurrency(
              Math.abs(amountDifference)
            )}
          </strong>{" "}
          compared with your earliest
          active month.
        </>
      );
    }

    return (
      <>
        Add more transactions to build a
        meaningful monthly comparison.
      </>
    );
  }


  return (
    <div className="analytics-simple-page">
      <AppSidebar active="analytics" />

      <main className="analytics-simple-main">
        <header className="analytics-simple-header">
          <div>
            <span className="analytics-kicker">
              YOUR MONEY, EXPLAINED
            </span>

            <h1>
              Where is your money going?
            </h1>

            <p>
              A clear look at what changed —
              and what deserves your attention.
            </p>
          </div>

          <UserProfile />
        </header>


        <Card className="analytics-section breakdown-section">
          <div className="analytics-section-title">
            <div>
              <span>01 · BREAKDOWN</span>

              <h2>
                Spending breakdown
              </h2>
            </div>

            <p>
              {analytics.current_month}
            </p>
          </div>

          <div className="breakdown-grid">
            <div
              className="donut"
              style={{
                "--segments": donutSegments
              }}
            >
              <div className="donut-center">
                <span>Total spent</span>

                <strong>
                  EGP{" "}
                  {formatCurrency(
                    analytics.total_spent
                  )}
                </strong>

                <small>this month</small>
              </div>
            </div>

            <div className="breakdown-legend">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <div
                    className="legend-row"
                    key={category.name}
                  >
                    <i
                      style={{
                        background:
                          category.color
                      }}
                    />

                    <strong>
                      {category.name}
                    </strong>

                    <span>
                      {category.percent}%
                    </span>

                    <b>
                      EGP{" "}
                      {formatCurrency(
                        category.amount
                      )}
                    </b>
                  </div>
                ))
              ) : (
                <p>
                  No spending recorded for
                  this month yet.
                </p>
              )}

              {opportunity && (
                <div className="breakdown-callout">
                  <span>
                    Biggest opportunity
                  </span>

                  <strong>
                    {opportunity.category} takes{" "}
                    {opportunity.share_percent}%
                    of this month&apos;s spending.
                  </strong>

                  <p>
                    Reducing it by 10% could
                    save EGP{" "}
                    {formatCurrency(
                      opportunity
                        .potential_savings
                    )}{" "}
                    this month.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>


        <Card className="analytics-section trend-section">
          <div className="analytics-section-title">
            <div>
              <span>02 · TREND</span>

              <h2>
                Monthly spending trend
              </h2>
            </div>

            <div className="trend-summary">
              <b>
                {trendChange > 0
                  ? "↑"
                  : trendChange < 0
                    ? "↓"
                    : "—"}{" "}
                {Math.abs(trendChange)}%
              </b>

              <span>
                across active months
              </span>
            </div>
          </div>

          <TrendChart
            monthlyValues={monthlyValues}
            monthLabels={monthLabels}
          />

          <p className="trend-caption">
            <i />
            {getTrendCaption()}
          </p>
        </Card>


        <Card className="analytics-section habits-section">
          <div className="analytics-section-title">
            <div>
              <span className="ai-title">
                <Icon
                  name="spark"
                  size={15}
                />
                03 · CASHLY INTELLIGENCE
              </span>

              <h2>
                What your spending habits say
              </h2>
            </div>

            <p>
              Based on your last 90 days
            </p>
          </div>

          <div className="habits-grid">
            {analytics.insights.length > 0 ? (
              analytics.insights.map(
                (insight, index) => (
                  <Card
                    className="habit-card"
                    key={`${insight.title}-${index}`}
                  >
                    <div
                      className={
                        `habit-icon ` +
                        `${
                          insight.positive
                            ? "positive"
                            : ""
                        }`
                      }
                    >
                      {
                        INSIGHT_ICONS[
                          index %
                            INSIGHT_ICONS.length
                        ]
                      }
                    </div>

                    <div>
                      <span>
                        {insight.tag}
                      </span>

                      <h3>
                        {insight.title}
                      </h3>

                      <p>
                        {insight.text}
                      </p>
                    </div>

                    <Icon
                      name="arrow"
                      size={18}
                    />
                  </Card>
                )
              )
            ) : (
              <p>
                Add more transactions to
                unlock spending insights.
              </p>
            )}
          </div>
        </Card>


        <Card className="analytics-section category-section">
          <div className="analytics-section-title">
            <div>
              <span>
                04 · CATEGORIES
              </span>

              <h2>
                Your biggest expense categories
              </h2>
            </div>

            <p>
              Compared with last month
            </p>
          </div>

          <div className="category-cards">
            {categories.length > 0 ? (
              categories
                .slice(0, 3)
                .map((category, index) => (
                  <Card
                    className={
                      `category-card ` +
                      `rank-${index + 1}`
                    }
                    key={category.name}
                  >
                    <div className="category-card-top">
                      <div
                        className="category-icon"
                        style={{
                          color:
                            category.color,
                          background:
                            `${category.color}18`
                        }}
                      >
                        {category.icon}
                      </div>

                      <span>
                        #{index + 1}
                      </span>
                    </div>

                    <p>
                      {category.name}
                    </p>

                    <h3>
                      EGP{" "}
                      {formatCurrency(
                        category.amount
                      )}
                    </h3>

                    <div className="category-meta">
                      <span
                        className={
                          category.tone
                        }
                      >
                        {category.change}
                      </span>

                      <small>
                        vs last month
                      </small>
                    </div>

                    <div className="category-bar">
                      <i
                        style={{
                          width:
                            `${Math.min(
                              category.percent,
                              100
                            )}%`,
                          background:
                            category.color
                        }}
                      />
                    </div>
                  </Card>
                ))
            ) : (
              <p>
                No categories to display yet.
              </p>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}


export default Analytics;