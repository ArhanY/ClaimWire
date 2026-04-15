import React, { useState, useEffect } from 'react';
import './App.css';

// Using mock state data matching Phase 2 functionality but styling to match Phase 1
const MOCK_POLICIES = [
  { id: 'ZMT-BOM-1029', user: 'Ramesh K.', zone: 'Andheri', premium: '₹58/wk', status: 'ACTIVE' },
  { id: 'SWG-DEL-0099', user: 'Suresh P.', zone: 'Powai', premium: '₹41/wk', status: 'ACTIVE' },
  { id: 'ZMT-BOM-4488', user: 'Arjun D.', zone: 'Bandra', premium: '₹71/wk', status: 'ACTIVE' },
];

const MOCK_TRIGGERS = [
  { type: 'SEVERE_RAIN', val: '68mm/hr', zone: 'Andheri' },
];

const MOCK_PAYOUTS = [
  { id: 'CLM-ABCD12', user: 'Ramesh K.', zone: 'Andheri', tag: 'Paid', cls: 'ct-paid', statusCS: 'cs-paid', amt: '₹300', time: 'Just now' },
  { id: 'CLM-EFGH34', user: 'Priya M.', zone: 'Bandra', tag: 'Paid', cls: 'ct-paid', statusCS: 'cs-paid', amt: '₹512', time: '8:31am' },
];

function App() {
  const [policies, setPolicies] = useState(MOCK_POLICIES);
  const [triggers, setTriggers] = useState(MOCK_TRIGGERS);
  const [payouts, setPayouts] = useState(MOCK_PAYOUTS);

  return (
    <div>
      <nav>
        <div className="nav-brand">
          <div className="nav-logo">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
          </div>
          <span className="nav-title">GigShield</span>
          <span className="nav-badge">live deployment</span>
        </div>
      </nav>

      <div className="dash">
        <div className="dash-header">
          <div>
            <div className="dash-title">Insurer Admin Dashboard</div>
            <div className="dash-sub">Mumbai cluster &middot; Realtime Phase 2 Monitoring</div>
          </div>
          <div className="live-pill">Live feed</div>
        </div>

        {/* Live Disruption Ticker based on triggers state */}
        {triggers.length > 0 && (
          <div className="ticker-wrap">
            <span className="ticker-icon">⚡</span>
            <span className="ticker-text">Live: Automation detected {triggers[0].type.replace('_', ' ')} in {triggers[0].zone} — {triggers[0].val}. Cross-checking active limits...</span>
            <span className="ticker-time">Just now</span>
          </div>
        )}

        {/* Top KPI Metrics */}
        <div className="metrics-grid">
          <div className="metric">
            <div className="metric-label">Active policies</div>
            <div className="metric-val green">1,247</div>
            <div className="metric-sub">+83 this week</div>
          </div>
          <div className="metric">
            <div className="metric-label">Loss ratio</div>
            <div className="metric-val green">61%</div>
            <div className="metric-sub" style={{color: 'var(--green)'}}>▲ Target &lt;65%</div>
          </div>
          <div className="metric">
            <div className="metric-label">Claims paid today</div>
            <div className="metric-val amber">₹3.2L</div>
            <div className="metric-sub">14 claims &middot; avg ₹643</div>
          </div>
          <div className="metric">
            <div className="metric-label">Fraud flagged</div>
            <div className="metric-val red">3</div>
            <div className="metric-sub">Held for review</div>
          </div>
        </div>

        {/* Tables */}
        <div className="dash-grid">
          
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Latest Automated Payouts</span>
              <span className="panel-badge pb-green">Processing</span>
            </div>
            <div className="claim-list">
              {payouts.map((c, i) => (
                <div className="claim-row" key={i}>
                  <div className={`claim-status ${c.statusCS}`}></div>
                  <div>
                    <div className="claim-name">{c.user} &middot; {c.id}</div>
                    <div className="claim-zone">{c.zone} &middot; Automatic Settlement</div>
                  </div>
                  <span className={`claim-tag ${c.cls}`}>{c.tag}</span>
                  <div className="claim-amt">{c.amt}</div>
                  <div className="claim-time">{c.time}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Live Policy Stream</span>
              <span className="panel-badge pb-amber">Syncing Guidewire</span>
            </div>
            <div className="claim-list">
              {policies.map((pol, i) => (
                <div className="claim-row" key={i}>
                  <div className="claim-status cs-active"></div>
                  <div>
                    <div className="claim-name">{pol.user} &middot; {pol.id}</div>
                    <div className="claim-zone">Base Zone: {pol.zone}</div>
                  </div>
                  <span className="claim-tag ct-active">{pol.status}</span>
                  <div className="claim-amt">{pol.premium}</div>
                  <div className="claim-time">Live</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
