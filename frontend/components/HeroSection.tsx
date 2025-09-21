import React, { useState, useEffect } from 'react';

interface HeroSectionProps {
  onStartApplication: () => void;
  onWatchDemo: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartApplication,
  onWatchDemo
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section 
      id="home" 
      className={`hero ${isVisible ? 'animate-in' : ''}`}
      role="banner"
      aria-labelledby="hero-title"
    >
      <div className="hero-background">
        <div id="hero-canvas" className="hero-canvas" aria-hidden="true"></div>
        <div className="hero-gradient"></div>
      </div>

      <div className="hero-container container">
        <div className="hero-content">
          <div className="hero-badge" role="img" aria-label="Built on Hedera Hashgraph">
            <i className="fas fa-star" aria-hidden="true"></i>
            <span>Built on Hedera Hashgraph</span>
          </div>

          <h1 id="hero-title" className="hero-title">
            <span className="title-main">Instant Farm Loans</span>
            <span className="title-accent">Your Crops = Your Collateral</span>
          </h1>

          <p className="hero-subtitle">
            Get funding in 24 hours. No banks, no paperwork. Just your harvest as security.
            <strong className="proof-stat">$2.3M+ funded</strong> • 
            <strong className="proof-stat">97% repaid</strong> • 
            <strong className="proof-stat">1,247 farmers helped</strong>
          </p>

          <div className="hero-actions">
            <button 
              className="btn btn-hero-primary"
              onClick={onStartApplication}
              aria-describedby="farmer-help"
              data-testid="start-application"
            >
              <span>Start My Loan Application</span>
              <i className="fas fa-arrow-right" aria-hidden="true"></i>
            </button>
            <button 
              className="btn btn-hero-secondary"
              onClick={onWatchDemo}
              data-testid="watch-demo"
            >
              <i className="fas fa-play" aria-hidden="true"></i>
              <span>Watch 2min Demo</span>
            </button>
          </div>
          
          <div className="hero-guarantee">
            <i className="fas fa-shield-check" aria-hidden="true"></i>
            <span>No hidden fees • Transparent rates • Secure blockchain</span>
          </div>
          
          <div id="farmer-help" className="sr-only">
            Start loan application process for farmers
          </div>

          <div className="hero-trust">
            <span className="trust-text">Trusted by</span>
            <div className="trust-logos">
              <div className="trust-logo">Hedera</div>
              <div className="trust-logo">AgriCoop</div>
              <div className="trust-logo">FarmTech</div>
              <div className="trust-logo">GreenBank</div>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card glassmorphism">
            <div className="card-header">
              <div className="card-icon">
                <i className="fas fa-seedling" aria-hidden="true"></i>
              </div>
              <div className="card-title">
                <h3>Live Loan Example</h3>
                <p>Coffee Farmer, Kenya</p>
              </div>
            </div>
            <div className="card-metrics">
              <div className="metric">
                <span className="metric-label">Requested</span>
                <span className="metric-value">$5,000</span>
              </div>
              <div className="metric">
                <span className="metric-label">Collateral</span>
                <span className="metric-value">2,500kg Coffee</span>
              </div>
              <div className="metric">
                <span className="metric-label">APR</span>
                <span className="metric-value text-success">8.5%</span>
              </div>
            </div>
            <div className="card-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: '85%' }}
                  role="progressbar"
                  aria-valuenow={85}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="85% funded"
                ></div>
              </div>
              <span className="progress-text">85% Funded</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};