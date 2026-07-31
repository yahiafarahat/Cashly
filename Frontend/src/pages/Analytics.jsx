import { Link } from "react-router-dom";
import cashlyLogo from "../assets/cashly-img-removebg-preview.png";
import "../styles/Dashboard.css";
import "../styles/AnalyticsSimple.css";

const Icon = ({ name, size = 20 }) => {
  const paths = {
    day: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    transactions: <><path d="M7 7h11l-3-3M17 17H6l3 3"/><path d="M18 7l-3 3M6 17l3-3"/></>,
    analytics: <path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/>,
    challenges: <><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M7 6H3v2a4 4 0 0 0 4 4M17 6h4v2a4 4 0 0 1-4 4"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 15a2 2 0 0 0 .4 2l-2.8 2.8a2 2 0 0 0-2-.4 2 2 0 0 0-1.2 1.6h-4a2 2 0 0 0-1.2-1.6 2 2 0 0 0-2 .4L3.4 17a2 2 0 0 0 .4-2A2 2 0 0 0 2 13.8v-4A2 2 0 0 0 3.8 8a2 2 0 0 0-.4-2l2.8-2.8a2 2 0 0 0 2 .4A2 2 0 0 0 9.4 2h4a2 2 0 0 0 1.2 1.6 2 2 0 0 0 2-.4L19.4 6a2 2 0 0 0-.4 2 2 2 0 0 0 1.8 1.2v4A2 2 0 0 0 19 15Z"/></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/></>,
    spark: <path d="m12 3-1.2 4.2a5 5 0 0 1-3.6 3.6L3 12l4.2 1.2a5 5 0 0 1 3.6 3.6L12 21l1.2-4.2a5 5 0 0 1 3.6-3.6L21 12l-4.2-1.2a5 5 0 0 1-3.6-3.6L12 3Z"/>,
    arrow: <path d="m9 18 6-6-6-6"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

const categories = [
  { name: "Food", amount: 5200, percent: 35, color: "#e8c45b", icon: "🍔", change: "↑ 12%", tone: "up" },
  { name: "Bills", amount: 3600, percent: 24, color: "#738bd7", icon: "⌂", change: "Stable", tone: "stable" },
  { name: "Transport", amount: 2100, percent: 14, color: "#5eb9a0", icon: "🚕", change: "↓ 8%", tone: "down" },
  { name: "Shopping", amount: 2300, percent: 15, color: "#cf7f83", icon: "◊", change: "↑ 4%", tone: "up" },
  { name: "Entertainment", amount: 1800, percent: 12, color: "#9876c7", icon: "♪", change: "↓ 3%", tone: "down" },
];

const monthly = [13200, 12800, 12100, 13400, 11900, 11600, 10800, 11400, 10300, 9900, 9600, 9200];
const monthLabels = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const habits = [
  { icon: "✦", title: "Fridays cost you the most", text: "You spend 34% more on Fridays, mainly on food and rides.", tag: "Weekly pattern" },
  { icon: "☕", title: "Coffee purchases increased 30%", text: "That is EGP 240 more than last month — about three extra visits.", tag: "Worth watching" },
  { icon: "↘", title: "Groceries are moving the right way", text: "You spent EGP 480 less than last month without buying less often.", tag: "Good progress", positive: true },
  { icon: "!", title: "The last week is your budget trap", text: "You usually exceed your food budget between the 24th and payday.", tag: "Cashly forecast" },
];

function TrendChart() {
  const width = 900, height = 250, padX = 20, padY = 26;
  const max = 14000, min = 8500;
  const points = monthly.map((value, index) => ({ x: padX + index * ((width - padX * 2) / (monthly.length - 1)), y: padY + (max - value) * ((height - padY * 2) / (max - min)) }));
  const line = points.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${points.at(-1).x},${height} L${points[0].x},${height} Z`;
  return (
    <div className="trend-chart-wrap">
      <svg className="trend-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Monthly spending declined from EGP 13,200 to EGP 9,200 over twelve months">
        <defs><linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dfbb52" stopOpacity=".3"/><stop offset="1" stopColor="#dfbb52" stopOpacity="0"/></linearGradient></defs>
        {[50, 110, 170, 230].map((y) => <line key={y} x1="0" y1={y} x2={width} y2={y} className="trend-grid" />)}
        <path d={area} fill="url(#trendFill)"/><path d={line} className="trend-line"/>
        {points.map((p, index) => <g key={monthLabels[index]} className="trend-point"><circle cx={p.x} cy={p.y} r="11" className="trend-point-hit"/><circle cx={p.x} cy={p.y} r={index === 11 ? 5 : 3}/><text x={p.x} y={p.y - 17}>EGP {monthly[index].toLocaleString()}</text></g>)}
      </svg>
      <div className="month-labels">{monthLabels.map((month) => <span key={month}>{month}</span>)}</div>
    </div>
  );
}

function Analytics() {
  const userName = localStorage.getItem("cashlyUserName") || "Cashly User";
  const total = categories.reduce((sum, item) => sum + item.amount, 0);
  return (
    <div className="analytics-simple-page">
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo"><img src={cashlyLogo} alt="Cashly"/><h2>Cashly</h2></div>
        <nav className="sidebar-menu">
          <Link className="sidebar-link" to="/dashboard"><Icon name="day"/>My Day</Link>
          <Link className="sidebar-link" to="/transactions"><Icon name="transactions"/>Transactions</Link>
          <Link className="sidebar-link active" to="/analytics"><Icon name="analytics"/>Analytics</Link>
          <Link className="sidebar-link" to="/challenges"><Icon name="challenges"/>Challenges</Link>
          <Link className="sidebar-link" to="/settings"><Icon name="settings"/>Settings</Link>
        </nav>
        <Link className="logout-link" to="/login"><Icon name="logout"/>Logout</Link>
      </aside>

      <main className="analytics-simple-main">
        <header className="analytics-simple-header">
          <div><span className="analytics-kicker">YOUR MONEY, EXPLAINED</span><h1>Where is your money going?</h1><p>A clear look at what changed — and what deserves your attention.</p></div>
          <div className="analytics-avatar" title={userName}>{userName.charAt(0).toUpperCase()}</div>
        </header>

        <section className="analytics-section breakdown-section">
          <div className="analytics-section-title"><div><span>01 · BREAKDOWN</span><h2>Spending breakdown</h2></div><p>August 2026</p></div>
          <div className="breakdown-grid">
            <div className="donut" style={{ "--segments": "#e8c45b 0 35%, #738bd7 35% 59%, #5eb9a0 59% 73%, #cf7f83 73% 88%, #9876c7 88% 100%" }}>
              <div className="donut-center"><span>Total spent</span><strong>EGP {total.toLocaleString()}</strong><small>this month</small></div>
            </div>
            <div className="breakdown-legend">
              {categories.map((category) => <div className="legend-row" key={category.name}><i style={{ background: category.color }}/><strong>{category.name}</strong><span>{category.percent}%</span><b>EGP {category.amount.toLocaleString()}</b></div>)}
              <div className="breakdown-callout"><span>Biggest opportunity</span><strong>Food takes EGP 1 of every EGP 3 you spend.</strong><p>Reducing it by 10% saves EGP 520 this month.</p></div>
            </div>
          </div>
        </section>

        <section className="analytics-section trend-section">
          <div className="analytics-section-title"><div><span>02 · TREND</span><h2>Monthly spending trend</h2></div><div className="trend-summary"><b>↓ 30%</b><span>over 12 months</span></div></div>
          <TrendChart />
          <p className="trend-caption"><i/> Your spending is moving down consistently. You kept <strong>EGP 4,000 more</strong> this August than last September.</p>
        </section>

        <section className="analytics-section habits-section">
          <div className="analytics-section-title"><div><span className="ai-title"><Icon name="spark" size={15}/>03 · CASHLY AI</span><h2>What your spending habits say</h2></div><p>Based on your last 90 days</p></div>
          <div className="habits-grid">
            {habits.map((habit) => <article className="habit-card" key={habit.title}><div className={`habit-icon ${habit.positive ? "positive" : ""}`}>{habit.icon}</div><div><span>{habit.tag}</span><h3>{habit.title}</h3><p>{habit.text}</p></div><Icon name="arrow" size={18}/></article>)}
          </div>
        </section>

        <section className="analytics-section category-section">
          <div className="analytics-section-title"><div><span>04 · CATEGORIES</span><h2>Your biggest expense categories</h2></div><p>Compared with July</p></div>
          <div className="category-cards">
            {categories.slice(0, 3).map((category, index) => <article className={`category-card rank-${index + 1}`} key={category.name}><div className="category-card-top"><div className="category-icon" style={{ color: category.color, background: `${category.color}18` }}>{category.icon}</div><span>#{index + 1}</span></div><p>{category.name}</p><h3>EGP {category.amount.toLocaleString()}</h3><div className="category-meta"><span className={category.tone}>{category.change}</span><small>vs last month</small></div><div className="category-bar"><i style={{ width: `${category.percent * 2.3}%`, background: category.color }}/></div></article>)}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Analytics;
