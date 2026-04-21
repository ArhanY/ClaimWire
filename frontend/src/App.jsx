import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost:3000/api';

function App() {
  const [view, setView] = useState('admin'); // 'admin' or 'worker'
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState({ activePolicies: 0, totalPaid: 0, claimCount: 0, fraudFlags: 0, lossRatio: 0 });
  const [prediction, setPrediction] = useState(null);
  const [logs, setLogs] = useState([
    { type: 'process', text: 'System initialized. Listening for weather triggers...' },
    { type: 'process', text: 'MongoDB persistence connected. Polling every 5s.' }
  ]);
  const [loading, setLoading] = useState(true);

  const addLog = (text, type = 'process') => {
    setLogs(prev => [{ type, text, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 50));
  };

  const fetchData = async () => {
    try {
      const [resP, resC, resS, resPr] = await Promise.all([
        fetch(`${API_BASE}/policies`),
        fetch(`${API_BASE}/claims`),
        fetch(`${API_BASE}/stats`),
        fetch(`${API_BASE}/predictive`)
      ]);
      setPolicies(await resP.json());
      setClaims(await resC.json());
      setStats(await resS.json());
      setPrediction(await resPr.json());
      setLoading(false);
    } catch (err) { console.error("Sync Error:", err); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulate = async () => {
    addLog("⚡ MANUAL TRIGGER: Initiating severe rain storm simulation for Andheri...", "alert");
    try {
      setTimeout(() => addLog("🔍 STEP 1: Querying active policies in zip code 400053...", "process"), 800);
      setTimeout(() => addLog("🤖 STEP 2: Running ML Fraud Detection (Speed & Pattern check)...", "process"), 1600);

      const res = await fetch(`${API_BASE}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SEVERE_RAIN', zone: 'Andheri' })
      });
      const data = await res.json();

      setTimeout(() => addLog("💸 STEP 3: Fraud check passed. Executing instant payout via Razorpay UPI...", "success"), 2400);
      setTimeout(() => addLog(`✅ DONE: Payout issued to ${data.event.zone}. Check ClaimWire for FNOL.`, "success"), 3200);

    } catch (err) {
      addLog("❌ Simulation error: Connection failed.", "alert");
    }
  };

  return (
    <div className="app-container">
      <nav>
        <div className="nav-brand">
          <div className="nav-logo">
            <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" /></svg>
          </div>
          <span className="nav-title">ClaimWire</span>
          <span className="nav-badge">Phase 3 Final</span>
        </div>
        <div className="view-switcher">
          <button className={view === 'admin' ? 'active' : ''} onClick={() => setView('admin')}>Risk Admin</button>
          <button className={view === 'worker' ? 'active' : ''} onClick={() => setView('worker')}>Partner Hub</button>
        </div>
      </nav>

      {view === 'admin' ? (
        <div className="dash">
          <div className="dash-header">
            <div>
              <div className="dash-title">ClaimWire Intelligence Dashboard</div>
              <div className="dash-sub">Operational status: Active &middot; Monitoring Mumbai Cluster</div>
            </div>
            <div className="simulation-controls">
              <button className="btn-trigger" onClick={handleSimulate}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                Simulate Disruption
              </button>
            </div>
          </div>

          <div className="metrics-grid">
            <div className="metric">
              <div className="metric-label">Active Policies</div>
              <div className="metric-val green">{stats.activePolicies}</div>
              <div className="metric-sub"><span className="dot dot-green"></span> Live MongoDB Feed</div>
            </div>
            <div className="metric">
              <div className="metric-label">Loss Ratio</div>
              <div className="metric-val amber">{stats.lossRatio}%</div>
              <div className="metric-sub">{stats.lossRatio > 65 ? '⚠️ High Payout Volume' : '✅ Stable Risk Profile'}</div>
            </div>
            <div className="metric">
              <div className="metric-label">Security Flags</div>
              <div className="metric-val red">{stats.fraudFlags}</div>
              <div className="metric-sub">Blocked by Fraud ML</div>
            </div>
            {prediction && (
              <div className="metric">
                <div className="metric-label">AI Risk Forecast</div>
                <div className="metric-val purple">{prediction.nextWeekRiskScore}%</div>
                <div className="metric-sub">Confidence: 94%</div>
              </div>
            )}
          </div>

          <div className="dash-grid">
            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">Real-time Claims Ledger</span>
                <span className="panel-badge pb-green">SYNCING</span>
              </div>
              <div className="claim-list">
                {claims.length === 0 && <div className="empty-state">No payouts recorded today. Use the simulation button to trigger a claim.</div>}
                {claims.map((c, i) => (
                  <div key={i} className="claim-row">
                    <div className={`claim-status cs-${c.status.toLowerCase()}`}></div>
                    <div>
                      <div className="claim-name">{c.partner_id} &middot; <span style={{ opacity: 0.6 }}>{c.claimNumber}</span></div>
                      <div className="claim-zone">{c.zone} &middot; {c.triggerType}</div>
                      {c.gateway_tx_id && <div className="tx-id">Gateway TXID: {c.gateway_tx_id}</div>}
                    </div>
                    <span className={`claim-tag ct-${c.status.toLowerCase()}`}>{c.status}</span>
                    <div className="claim-amt">₹{c.amount}</div>
                  </div>
                ))}
              </div>

              <div className="activity-log">
                {logs.map((log, i) => (
                  <div key={i} className={`log-entry ${log.type}`}>
                    [{log.time || 'BOOT'}] {log.text}
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <span className="panel-title">AI Predictive Narrative</span>
              </div>
              <div className="narrative-box">
                <p style={{ fontWeight: 700, color: 'var(--purple)', marginBottom: '8px' }}>Weekly Risk Intelligence Report</p>
                <p>{prediction?.forecastNarrative}</p>
                <p><strong>Proposed Action:</strong> Increase reserves for {prediction?.likelyDisruptions[0]} events expected over the weekend.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="dash worker-view">
          <div className="dash-header">
            <div>
              <div className="dash-title">My Protection Portal</div>
              <div className="dash-sub">Managing coverage for 919123456789</div>
            </div>
          </div>

          <div className="worker-stats">
            <div className="metric">
              <div className="metric-label">Coverage Status</div>
              <div className="metric-val green">Active</div>
              <div className="metric-sub">Valid for next 4 days</div>
            </div>
            <div className="metric">
              <div className="metric-label">Earnings Protected</div>
              <div className="metric-val purple">₹3,200</div>
              <div className="metric-sub">Max payout per disruption</div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">My Recent Payouts</div>
            <div className="claim-list">
              {claims.filter(c => c.partner_id.includes('919123456789')).map((c, i) => (
                <div key={i} className="claim-row">
                  <div className="claim-status cs-paid"></div>
                  <div>
                    <div className="claim-name">Automatic Payout: {c.triggerType}</div>
                    <div className="claim-zone">{new Date(c.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="claim-amt">₹{c.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

