import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react';

const Home = () => {
  return (
    <div className="home fade-in">
      {/* ── Hero Section ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-overlay" />

        {/* Floating particles */}
        <div className="hero-particles">
          {[...Array(12)].map((_, i) => (
            <span
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${4 + Math.random() * 4}s`,
                fontSize: `${6 + Math.random() * 10}px`,
              }}
            />
          ))}
        </div>

        <div className="container hero-content">
          <span className="hero-badge">
            <Sparkles size={14} /> Divine Darshan Awaits
          </span>
          <h1 className="hero-title">Experience Spiritual Peace</h1>
          <p className="hero-subtitle">
            Secure your presence at the most sacred shrines. Skip the long queues and focus on your devotion with our seamless booking system.
          </p>
          <Link to="/temples" className="btn btn-saffron hero-cta">
            Explore Temples <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="features-section">
        <div className="container">
          <h2 className="features-heading">Why Choose Darshan Ease?</h2>
          <div className="grid">
            <div className="card feature-card">
              <div className="feature-icon">
                <Calendar size={28} />
              </div>
              <h3>Instant Scheduling</h3>
              <p>Reserve your preferred date and time for darshan in just a few clicks from anywhere.</p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">
                <Clock size={28} />
              </div>
              <h3>Priority Entry</h3>
              <p>Save valuable time with confirmed slots and dedicated entry lanes at your chosen hour.</p>
            </div>
            <div className="card feature-card">
              <div className="feature-icon">
                <Sparkles size={28} />
              </div>
              <h3>Digital Tickets</h3>
              <p>Get immediate confirmation and a QR-coded ticket for effortless verification at the temple.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
