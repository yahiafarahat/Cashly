import { useMemo, useState } from "react";
import "../styles/Dashboard.css";
import "../styles/ChallengesSmart.css";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AppSidebar from "../components/AppSidebar";
import UserProfile from "../components/UserProfile";

const Icon = ({ name, size = 20 }) => {
  const paths = {
    day: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    transactions: <><path d="M7 7h11l-3-3M17 17H6l3 3"/><path d="M18 7l-3 3M6 17l3-3"/></>,
    analytics: <path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/>,
    challenges: <><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M7 6H3v2a4 4 0 0 0 4 4M17 6h4v2a4 4 0 0 1-4 4"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 15a2 2 0 0 0 .4 2l-2.8 2.8a2 2 0 0 0-2-.4 2 2 0 0 0-1.2 1.6h-4a2 2 0 0 0-1.2-1.6 2 2 0 0 0-2 .4L3.4 17a2 2 0 0 0 .4-2A2 2 0 0 0 2 13.8v-4A2 2 0 0 0 3.8 8a2 2 0 0 0-.4-2l2.8-2.8a2 2 0 0 0 2 .4A2 2 0 0 0 9.4 2h4a2 2 0 0 0 1.2 1.6 2 2 0 0 0 2-.4L19.4 6a2 2 0 0 0-.4 2 2 2 0 0 0 1.8 1.2v4A2 2 0 0 0 19 15Z"/></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/></>,
    spark: <path d="m12 3-1.2 4.2a5 5 0 0 1-3.6 3.6L3 12l4.2 1.2a5 5 0 0 1 3.6 3.6L12 21l1.2-4.2a5 5 0 0 1 3.6-3.6L21 12l-4.2-1.2a5 5 0 0 1-3.6-3.6L12 3Z"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    arrow: <path d="m9 18 6-6-6-6"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

const suggestions = [
  { id: "coffee", icon: "☕", signal: "You ordered coffee four times this week.", action: "Make coffee at home tomorrow.", saving: 95, period: "tomorrow", button: "Accept", confidence: "Based on 4 recent purchases" },
  { id: "streaming", icon: "▶", signal: "You have three streaming subscriptions.", action: "Pause the one you use least.", saving: 180, period: "every month", button: "Review subscriptions", confidence: "One hasn't been used in 24 days" },
  { id: "delivery", icon: "⌂", signal: "Sunday delivery is becoming a habit.", action: "Plan one easy meal before the weekend.", saving: 240, period: "this week", button: "Plan it", confidence: "Detected 3 Sundays in a row" },
];

function Challenges() {
  const [accepted, setAccepted] = useState([]);
  const [todayComplete, setTodayComplete] = useState(false);
  const [movedSavings, setMovedSavings] = useState(false);
  const scheduledSaving = useMemo(() => suggestions.filter((item) => accepted.includes(item.id)).reduce((sum, item) => sum + item.saving, 0), [accepted]);
  const totalImpact = scheduledSaving + (todayComplete ? 225 : 0) + (movedSavings ? 220 : 0);
  const accept = (id) => setAccepted((current) => current.includes(id) ? current : [...current, id]);

  return (
    <div className="smart-actions-page">
      <AppSidebar active="challenges" />

      <main className="smart-actions-main">
        <header className="smart-actions-header">
          <div><span className="actions-kicker">SMALL MOVES · REAL MONEY</span><h1>Smart actions</h1><p>Cashly found a few things worth doing. Pick only what feels right.</p></div>
          <UserProfile />
        </header>

        <Card className={`today-action ${todayComplete ? "complete" : ""}`}>
          <div className="today-action-copy">
            <Badge className="today-badge"><i/> TODAY'S FOCUS</Badge>
            <h2>{todayComplete ? "You kept EGP 225 today." : "Skip delivery tonight."}</h2>
            <p>{todayComplete ? "That money stays available for something that matters more." : "Your last three Saturday orders averaged EGP 225. There's food at home that expires tomorrow."}</p>
            <Button type="button" onClick={() => setTodayComplete((value) => !value)}>{todayComplete ? <><Icon name="check" size={18}/>Completed</> : "I'll do this"}</Button>
          </div>
          <div className="today-impact"><span>{todayComplete ? "Saved today" : "Keep in your pocket"}</span><strong>EGP 225</strong><small>One decision. No streaks.</small></div>
        </Card>

        <section className="suggestions-section">
          <div className="actions-section-heading"><div><span><Icon name="spark" size={15}/>CASHLY NOTICED</span><h2>Suggestions made for you</h2></div><p>Updated from your latest transactions</p></div>
          <div className="suggestion-list">
            {suggestions.map((item) => {
              const isAccepted = accepted.includes(item.id);
              return <Card className={`suggestion-card ${isAccepted ? "accepted" : ""}`} key={item.id}>
                <div className="suggestion-icon">{isAccepted ? <Icon name="check" size={23}/> : item.icon}</div>
                <div className="suggestion-copy"><span>Cashly notices</span><h3>{item.signal}</h3><div className="suggestion-arrow">→</div><span>Suggested action</span><strong>{item.action}</strong><small>{item.confidence}</small></div>
                <div className="suggestion-impact"><span>Potential saving</span><strong>EGP {item.saving}</strong><small>{item.period}</small><Button variant="outline" type="button" disabled={isAccepted} onClick={() => accept(item.id)}>{isAccepted ? "Added for tomorrow" : item.button}{!isAccepted && <Icon name="arrow" size={16}/>}</Button></div>
              </Card>;
            })}
          </div>
        </section>

        <section className={`money-move ${movedSavings ? "moved" : ""}`}>
          <div className="money-move-icon">↘</div>
          <div><span>SMART MONEY MOVE</span><h2>{movedSavings ? "EGP 220 is now set aside for savings." : "Your electricity bill was lower than usual."}</h2><p>{movedSavings ? "A lower bill became progress instead of disappearing into everyday spending." : "You paid EGP 220 less than your six-month average. Move the difference before it quietly gets spent?"}</p></div>
          <div className="money-move-action"><strong>+ EGP 220</strong><span>to Savings</span><Button variant="outline" type="button" disabled={movedSavings} onClick={() => setMovedSavings(true)}>{movedSavings ? <><Icon name="check" size={17}/>Moved</> : "Yes, move it"}</Button></div>
        </section>

        <footer className="impact-footer">
          <div><span>YOUR PLANNED IMPACT</span><strong>EGP {totalImpact.toLocaleString()}</strong><small>kept or redirected</small></div>
          <p>{accepted.length ? `${accepted.length} smart ${accepted.length === 1 ? "action" : "actions"} ready for tomorrow.` : "Accept a suggestion and Cashly will bring it back at the right time."}</p>
        </footer>
      </main>
    </div>
  );
}

export default Challenges;
