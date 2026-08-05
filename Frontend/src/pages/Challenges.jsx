import { useMemo } from "react";
import { Check, Sparkles } from "lucide-react";
import "../styles/Dashboard.css";
import "../styles/ChallengesSmart.css";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AppSidebar from "../components/AppSidebar";
import UserProfile from "../components/UserProfile";
import { useFinancialHealth } from "../hooks/useFinancialHealth";

const formatMoney = (amount) => `EGP ${Number(amount || 0).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

function Challenges() {
  const {
    analytics,
    focus,
    suggestions,
    acceptedIds,
    todayComplete,
    acceptSuggestion,
    toggleTodayComplete,
    completed,
    total,
    score,
    status,
  } = useFinancialHealth();

  const scheduledSaving = useMemo(
    () => suggestions.filter((item) => acceptedIds.includes(item.id)).reduce((sum, item) => sum + item.saving, 0),
    [acceptedIds, suggestions]
  );
  const totalImpact = scheduledSaving + (todayComplete ? (focus?.saving || 0) : 0);

  return (
    <div className="smart-actions-page">
      <AppSidebar active="challenges" />
      <main className="smart-actions-main">
        <header className="smart-actions-header">
          <div><span className="actions-kicker">SMALL MOVES · REAL MONEY</span><h1>Smart actions</h1><p>Suggestions are calculated from this month&apos;s transaction data.</p></div>
          <UserProfile />
        </header>

        <Card className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h2>Financial Health</h2>
              <p>Calculated from the challenges you&apos;ve completed below.</p>
            </div>
          </div>

          <div className="health-content">
            <div className="health-score-circle" style={{ "--score-angle": `${(score / 100) * 360}deg` }}>
              <strong>{score}</strong>
              <span>/ 100</span>
            </div>

            <div className="health-information">
              <h3>{status}</h3>
              <div className="health-progress"><div className="health-progress-fill" style={{ width: `${score}%` }} /></div>
              <p>{completed} of {total || 0} challenges completed</p>
            </div>
          </div>
        </Card>

        <Card className={`today-action ${todayComplete ? "complete" : ""}`}>
          <div className="today-action-copy">
            <Badge className="today-badge"><i /> TODAY&apos;S FOCUS</Badge>
            <h2>{focus ? (todayComplete ? `You set aside ${formatMoney(focus.saving)} today.` : `Reduce ${focus.category.toLowerCase()} spending today.`) : "Record a transaction to get your first focus."}</h2>
            <p>{focus ? `${focus.category} represents ${analytics?.category_breakdown?.[0]?.percent ?? 0}% of your spending this month. A 10% reduction could keep ${formatMoney(focus.saving)} available.` : "Cashly will create tailored actions once there is spending data to analyse."}</p>
            {focus && <Button type="button" onClick={toggleTodayComplete}>{todayComplete ? <><Check size={18} />Completed</> : "I'll do this"}</Button>}
          </div>
          <div className="today-impact"><span>{todayComplete ? "Potential saving" : "Could keep"}</span><strong>{formatMoney(focus?.saving)}</strong><small>10% of your largest category</small></div>
        </Card>

        <section className="suggestions-section">
          <div className="actions-section-heading"><div><span><Sparkles size={15} />CASHLY NOTICED</span><h2>Suggestions made for you</h2></div><p>Updated from your latest transactions</p></div>
          <div className="suggestion-list">
            {suggestions.map((item) => {
              const isAccepted = acceptedIds.includes(item.id);
              return <Card className={`suggestion-card ${isAccepted ? "accepted" : ""}`} key={item.id}>
                <div className="suggestion-icon">{isAccepted ? <Check size={23} /> : <Sparkles size={23} />}</div>
                <div className="suggestion-copy"><span>Cashly notices</span><h3>{item.signal}</h3><div className="suggestion-arrow">→</div><span>Suggested action</span><strong>{item.action}</strong><small>{item.confidence}</small></div>
                <div className="suggestion-impact"><span>Potential saving</span><strong>{formatMoney(item.saving)}</strong><small>this month</small><Button variant="outline" type="button" disabled={isAccepted} onClick={() => acceptSuggestion(item.id)}>{isAccepted ? "Added" : "Accept"}</Button></div>
              </Card>;
            })}
            {analytics && !suggestions.length && <p>No spending has been recorded this month yet.</p>}
          </div>
        </section>

        <footer className="impact-footer">
          <div><span>YOUR PLANNED IMPACT</span><strong>{formatMoney(totalImpact)}</strong><small>potentially kept or redirected</small></div>
          <p>{acceptedIds.length ? `${acceptedIds.length} smart ${acceptedIds.length === 1 ? "action" : "actions"} ready for this month.` : "Accept a suggestion to track its potential impact."}</p>
        </footer>
      </main>
    </div>
  );
}

export default Challenges;
