import { ArrowRight, ArrowUpRight, ChartNoAxesCombined, Sparkles, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/Welcome.css";

function Welcome() {
  return (
    <main className="welcome-page">
      <div className="welcome-glow welcome-glow-one" />
      <div className="welcome-glow welcome-glow-two" />
      <div className="welcome-grid" />

      <nav className="welcome-nav" aria-label="Main navigation">
        <Link to="/" className="welcome-brand"><span>Cashly</span></Link>
        <div className="welcome-nav-actions"><Link to="/login" className="welcome-sign-in">Log in</Link><Link to="/signup" className="welcome-nav-cta">Create account <ArrowRight size={17} /></Link></div>
      </nav>

      <section className="welcome-hero">
        <div className="welcome-copy">
          <span className="welcome-eyebrow"><Sparkles size={15} /> PERSONAL FINANCE, MADE HUMAN</span>
          <h1>Make your money <em>feel lighter.</em></h1>
          <p>Cashly turns everyday spending into calm, clear decisions. Track your rhythm, share plans, and make progress worth celebrating.</p>
          <div className="welcome-actions"><Link to="/signup" className="welcome-primary">Start your free space <ArrowRight size={19} /></Link><Link to="/login" className="welcome-secondary">I already have an account</Link></div>
          <div className="welcome-proof"><span className="welcome-proof-avatars"><i>SM</i><i>NA</i><i>OK</i></span><span>Built for every money moment.</span></div>
        </div>

        <div className="welcome-visual" aria-label="Cashly dashboard preview">
          <div className="visual-orbit visual-orbit-one" /><div className="visual-orbit visual-orbit-two" />
          <article className="preview-balance-card"><div className="preview-card-top"><span>Your balance</span><button type="button" aria-label="More options">•••</button></div><strong>EGP 24,680</strong><small><ArrowUpRight size={14} /> 12.4% from last month</small><div className="preview-chart"><i /><i /><i /><i /><i /><i /><i /></div><p>Money moving in the right direction</p></article>
          <article className="preview-insight-card"><ChartNoAxesCombined size={20} /><div><span>WEEKLY INSIGHT</span><strong>You&apos;re ahead of plan</strong></div></article>
          <article className="preview-streak-card"><div className="preview-streak-icon"><WalletCards size={22} /></div><div><span>SAVING STREAK</span><strong>12 days</strong></div><b>✦</b></article>
        </div>
      </section>

      <footer className="welcome-footer"><span>EGP · Your money, your pace</span><span>Clarity is a habit. Start today.</span></footer>
    </main>
  );
}

export default Welcome;
