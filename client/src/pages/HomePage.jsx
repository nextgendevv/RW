import { Link } from 'react-router-dom';
import "./HomePage.css";

export default function Home() {
  return (
    <div className="home">

      {/* NAVBAR */}
      <nav className="navbar">
        <h2 className="logo">Richway</h2>
        <div>
          <Link to="/auth?tab=signin">Login</Link>
          <Link to="/auth?tab=signup" className="nav-btn">Register</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <h1>Grow Faster with Smart Referrals</h1>
          <p>
            Build your network, track your referrals, and manage your profile — all in one place.
          </p>

          <div className="hero-buttons">
            <Link to="/auth?tab=signup" className="btn-primary">Get Started</Link>
            <Link to="/auth?tab=signin" className="btn-outline">Login</Link>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-box"></div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features">
        <div className="feature-card">
          <h3>Easy Signup</h3>
          <p>Create your account in seconds with secure access.</p>
        </div>

        <div className="feature-card">
          <h3>Referral System</h3>
          <p>Share your link and earn benefits from your network.</p>
        </div>

        <div className="feature-card">
          <h3>Profile Control</h3>
          <p>Edit your details and manage your account anytime.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h2>Start Your Journey Today</h2>
        <Link to="/auth?tab=signup" className="btn-primary">Join Now</Link>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <p>© 2026 Richway. All rights reserved.</p>
      </footer>

    </div>
  );
}