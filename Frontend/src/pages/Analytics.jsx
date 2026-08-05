import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  XAxis,
  YAxis
} from "recharts";

import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";

import AppSidebar from "../components/AppSidebar";
import UserProfile from "../components/UserProfile";
import { getAnalyticsSummary } from "../services/analytics";

import "../styles/Dashboard.css";
import "../styles/AnalyticsSimple.css";


const CATEGORY_STYLES = {
  Food: {
    color: "#a93859",
    icon: "🍔"
  },
  Groceries: {
    color: "#a93859",
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
    color: "#a93859",
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


// Fixed categorical color order — a validated 7-hue palette (see the dataviz
// skill) assigned by identity, never cycled. Anything past the 7th named
// category (plus any unrecognized name) folds into one shared "other" slot.
const CATEGORY_COLOR_ORDER = [
  "Groceries",
  "Dining & Coffee",
  "Transportation",
  "Bills & Utilities",
  "Fashion",
  "Entertainment",
  "Healthcare"
];

function getCategoryColorVar(categoryName) {
  const index = CATEGORY_COLOR_ORDER.indexOf(categoryName);
  const slot = index === -1 ? 8 : index + 1;
  return `var(--chart-cat-${slot})`;
}


const GRANULARITY_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" }
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


function formatAxisCurrency(value) {
  return new Intl.NumberFormat("en-EG", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(Number(value || 0));
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


function Analytics() {
  const [analytics, setAnalytics] =
    useState(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [granularity, setGranularity] =
    useState("monthly");


  useEffect(() => {
    const controller =
      new AbortController();

    async function loadAnalytics() {
      setIsLoading(true);
      setError("");

      try {
        const data =
          await getAnalyticsSummary(
            controller.signal,
            granularity
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
  }, [granularity]);


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


  const frequencyData = useMemo(() => {
    if (!analytics) {
      return [];
    }

    return analytics.category_frequency.map((entry) => ({
      ...entry,
      fill: getCategoryColorVar(entry.name)
    }));
  }, [analytics]);


  const frequencyChartConfig = useMemo(() => {
    const config = {
      count: { label: "Transactions" }
    };

    frequencyData.forEach((entry) => {
      config[entry.name] = {
        label: entry.name,
        color: entry.fill
      };
    });

    return config;
  }, [frequencyData]);


  const totalTransactionCount = useMemo(
    () =>
      frequencyData.reduce(
        (sum, entry) => sum + entry.count,
        0
      ),
    [frequencyData]
  );


  const periodChartConfig = {
    amount: {
      label: "Total spent",
      color: "var(--chart-bar)"
    },
    average: {
      label: "Running average",
      color: "var(--chart-line)"
    }
  };


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


  const opportunity =
    analytics.biggest_opportunity;

  const periodData = analytics.spending_by_period;
  const hasPeriodData = periodData.some(
    (entry) => entry.amount > 0
  );


  return (
    <div className="analytics-simple-page">
      <AppSidebar active="analytics" />
      <div className="analytics-dot-grid" />
      <div className="analytics-blob analytics-blob-one" />
      <div className="analytics-blob analytics-blob-two" />

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
              A clear look at what changed,
              and what deserves your attention.
            </p>
          </div>

          <UserProfile />
        </header>


        <Card className="analytics-section breakdown-section">
          <div className="analytics-section-title">
            <div>
              <span>01 · FREQUENCY</span>

              <h2>
                Expense frequency by category
              </h2>
            </div>

            <p>
              {analytics.current_month}
            </p>
          </div>

          <div className="breakdown-grid">
            {frequencyData.length > 0 ? (
              <>
                <div className="frequency-chart-wrap">
                  <ChartContainer
                    config={frequencyChartConfig}
                    className="frequency-chart"
                  >
                    <PieChart accessibilityLayer>
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          hideLabel
                          nameKey="name"
                          formatter={(value, name, item) => (
                            <div className="frequency-tooltip-row">
                              <i style={{ background: item.payload.fill }} />
                              <span>{name}</span>
                              <strong>
                                {value} {value === 1 ? "purchase" : "purchases"}
                              </strong>
                              <em>{item.payload.percent}%</em>
                            </div>
                          )}
                        />
                      }
                    />

                    <Pie
                      data={frequencyData}
                      dataKey="count"
                      nameKey="name"
                      innerRadius="58%"
                      outerRadius="88%"
                      paddingAngle={2}
                      strokeWidth={2}
                      stroke="var(--chart-surface)"
                    >
                      {frequencyData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    </PieChart>
                  </ChartContainer>

                  <div className="donut-center frequency-center">
                    <span>Transactions</span>
                    <strong>{totalTransactionCount}</strong>
                    <small>
                      EGP {formatCurrency(analytics.total_spent)} spent
                    </small>
                  </div>
                </div>

                <div className="breakdown-legend">
                  {frequencyData.map((entry) => (
                    <div
                      className="legend-row"
                      key={entry.name}
                    >
                      <i
                        style={{
                          background: entry.fill
                        }}
                      />

                      <strong>
                        {entry.name}
                      </strong>

                      <span>
                        {entry.percent}%
                      </span>

                      <b>
                        {entry.count} {entry.count === 1 ? "purchase" : "purchases"}
                      </b>
                    </div>
                  ))}

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
              </>
            ) : (
              <p className="analytics-empty-state">
                No purchases recorded yet this month —
                add a transaction to see your category mix.
              </p>
            )}
          </div>
        </Card>


        <Card className="analytics-section trend-section">
          <div className="analytics-section-title">
            <div>
              <span>02 · SPENDING OVER TIME</span>

              <h2>
                Total spent by period
              </h2>
            </div>

            <div
              className="period-toggle"
              role="group"
              aria-label="Chart period"
            >
              {GRANULARITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={
                    granularity === option.value ? "active" : ""
                  }
                  onClick={() => setGranularity(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {hasPeriodData ? (
            <ChartContainer
              config={periodChartConfig}
              className="period-chart"
            >
              <ComposedChart
                accessibilityLayer
                data={periodData}
                margin={{ left: 8, right: 8, top: 8 }}
              >
                <CartesianGrid vertical={false} />

                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={formatAxisCurrency}
                  width={48}
                />

                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelKey="period"
                      formatter={(value, name) => (
                        <div className="period-tooltip-row">
                          <span>
                            {name === "amount" ? "Total spent" : "Running average"}
                          </span>
                          <strong>EGP {formatCurrency(value)}</strong>
                        </div>
                      )}
                    />
                  }
                />

                <ChartLegend content={<ChartLegendContent />} />

                <Bar
                  dataKey="amount"
                  fill="var(--color-amount)"
                  radius={4}
                />

                <Line
                  dataKey="average"
                  type="monotone"
                  stroke="var(--color-average)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--color-average)" }}
                />
              </ComposedChart>
            </ChartContainer>
          ) : (
            <p className="analytics-empty-state">
              No purchases in this {granularity.replace("ly", "")} range yet —
              add a transaction to see your spending trend.
            </p>
          )}
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
