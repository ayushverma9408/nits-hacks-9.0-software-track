import { useEffect, useMemo, useState } from 'react';

const initialApps = [
  { id: 1, name: 'Google Workspace', category: 'Productivity', icon: 'G', color: 'blue', access: 'Full access', scopes: ['Profile', 'Email', 'Drive'], connected: '12 days ago', risk: 'low', active: true },
  { id: 2, name: 'Notion', category: 'Productivity', icon: 'N', color: 'light', access: 'Read & write', scopes: ['Profile', 'Workspace'], connected: '8 days ago', risk: 'low', active: true },
  { id: 3, name: 'Unknown Device', category: 'Unverified', icon: '?', color: 'red', access: 'Unverified session', scopes: ['Profile', 'Location'], connected: 'Just now', risk: 'high', active: true }
];

const initialEvents = [
  { id: 1, app: 'Unknown Device', detail: 'New sign-in pattern detected', time: '2 min ago', severity: 'high', type: 'Anomaly' },
  { id: 2, app: 'Google Workspace', detail: 'Drive permission accessed', time: '18 min ago', severity: 'normal', type: 'Access' },
  { id: 3, app: 'Notion', detail: 'Workspace token refreshed', time: '1 hour ago', severity: 'normal', type: 'Session' },
  { id: 4, app: 'Google Workspace', detail: 'Connected application verified', time: 'Yesterday', severity: 'normal', type: 'Verification' }
];

const weekly = [
  { day: 'MON', value: 35 }, { day: 'TUE', value: 52 }, { day: 'WED', value: 42 },
  { day: 'THU', value: 70 }, { day: 'FRI', value: 48 }, { day: 'SAT', value: 88 }, { day: 'SUN', value: 60 }
];

function scoreFor(apps, events) {
  const active = apps.filter(a => a.active);
  const highApps = active.filter(a => a.risk === 'high').length;
  const highEvents = events.filter(e => e.severity === 'high').length;
  return Math.max(18, Math.min(99, 96 - highApps * 18 - highEvents * 9 - Math.max(0, active.length - 4) * 3));
}

function App() {
  const [apps, setApps] = useState(() => {
    try { return JSON.parse(localStorage.getItem('edith-apps')) || initialApps; } catch { return initialApps; }
  });
  const [events, setEvents] = useState(() => {
    try { return JSON.parse(localStorage.getItem('edith-events')) || initialEvents; } catch { return initialEvents; }
  });
  const [filter, setFilter] = useState('All activity');
  const [notice, setNotice] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => { localStorage.setItem('edith-apps', JSON.stringify(apps)); }, [apps]);
  useEffect(() => { localStorage.setItem('edith-events', JSON.stringify(events)); }, [events]);

  const score = useMemo(() => scoreFor(apps, events), [apps, events]);
  const activeApps = apps.filter(a => a.active).length;
  const highEvents = events.filter(e => e.severity === 'high').length;
  const visibleEvents = events.filter(e => filter === 'All activity' || (filter === 'Alerts' ? e.severity === 'high' : e.type === filter));
  const displayedEvents = showAll ? visibleEvents : visibleEvents.slice(0, 4);

  function updateApp(id, action) {
    const target = apps.find(a => a.id === id);
    if (!target) return;
    setApps(prev => prev.map(a => a.id === id ? { ...a, active: action === 'restore' ? true : false } : a));
    const verb = action === 'restore' ? 'Access restored for' : 'Access revoked for';
    const newEvent = { id: Date.now(), app: target.name, detail: verb + ' ' + target.name, time: 'Just now', severity: 'normal', type: 'Control' };
    setEvents(prev => [newEvent, ...prev]);
    setNotice(action === 'restore' ? target.name + ' access restored' : target.name + ' access revoked');
    window.setTimeout(() => setNotice(''), 2600);
  }

  function resetDemo() {
    setApps(initialApps);
    setEvents(initialEvents);
    setFilter('All activity');
    setNotice('Demo data restored');
    window.setTimeout(() => setNotice(''), 2600);
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">E</div><div><b>E.D.I.T.H.</b><span>IDENTITY INTELLIGENCE</span></div></div>
        <div className="side-label">WORKSPACE</div>
        <button className="nav-item selected"><span>◈</span> Overview <i>01</i></button>
        <button className="nav-item" onClick={() => document.getElementById('connections')?.scrollIntoView({ behavior: 'smooth' })}><span>▦</span> Connected apps</button>
        <button className="nav-item" onClick={() => document.getElementById('activity')?.scrollIntoView({ behavior: 'smooth' })}><span>⌁</span> Activity monitor</button>
        <button className="nav-item" onClick={() => document.getElementById('recommendations')?.scrollIntoView({ behavior: 'smooth' })}><span>✧</span> Recommendations</button>
        <div className="side-bottom"><div className="side-label">SYSTEM STATUS</div><div className="system-status"><span className="pulse"></span><div><b>All systems operational</b><small>Local demo environment</small></div></div><div className="profile"><div className="avatar">AV</div><div><b>Ayush Verma</b><small>Personal workspace</small></div><span className="dots">•••</span></div></div>
      </aside>

      <main className="main">
        <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>Overview</b></div><div className="top-actions"><span className="live"><i></i> LIVE MONITORING</span><button className="icon-btn" title="Notifications">♧<em>{highEvents}</em></button><div className="avatar small">AV</div></div></header>
        <div className="content">
          <section className="welcome"><div><div className="eyebrow"><span className="eyebrow-line"></span> YOUR DIGITAL IDENTITY, AT A GLANCE</div><h1>Identity <span>command center.</span></h1><p>Understand what has access to your digital life. Stay in control.</p></div><button className="outline-btn" onClick={resetDemo}>↻ &nbsp; Reset demo</button></section>

          <section className="stats-grid">
            <div className="stat-card score-card"><div className="stat-head"><span>IDENTITY TRUST SCORE</span><span className="tiny-pill">LIVE</span></div><div className="score-row"><div className="score-number">{score}<small>/100</small></div><div className="score-ring" style={{ '--score': score + '%' }}><div><b>{score >= 80 ? 'Strong' : score >= 55 ? 'Moderate' : 'At risk'}</b><small>Trust level</small></div></div></div><div className="meter"><span style={{ width: score + '%' }}></span></div><div className="stat-foot"><span className="green-text">↗ Updated in real time</span><span>Heuristic model</span></div></div>
            <div className="stat-card"><div className="stat-head"><span>CONNECTED APPLICATIONS</span><span className="stat-icon blue-icon">▦</span></div><div className="stat-value">{activeApps}<small> / {apps.length}</small></div><div className="stat-foot"><span>Currently authorized</span><span className="muted">App connections</span></div><div className="mini-bars"><i style={{height:'42%'}}></i><i style={{height:'65%'}}></i><i style={{height:'50%'}}></i><i style={{height:'82%'}}></i><i style={{height:'60%'}}></i><i style={{height:'95%'}}></i><i style={{height:'72%'}}></i></div></div>
            <div className="stat-card"><div className="stat-head"><span>SECURITY ALERTS</span><span className="stat-icon red-icon">⌁</span></div><div className="stat-value">{highEvents.toString().padStart(2,'0')}<small> active</small></div><div className="stat-foot"><span className={highEvents ? 'red-text' : 'green-text'}>{highEvents ? 'Needs your attention' : 'No active alerts'}</span><span className="muted">Risk signals</span></div><div className="alert-track"><span style={{width: Math.min(100, highEvents * 28) + '%'}}></span></div></div>
            <div className="stat-card"><div className="stat-head"><span>PERMISSIONS REVIEWED</span><span className="stat-icon purple-icon">✓</span></div><div className="stat-value">{apps.filter(a => !a.active).length}<small> revoked</small></div><div className="stat-foot"><span>Actions this session</span><span className="muted">Audit trail</span></div><div className="review-stamp">◷ &nbsp; SESSION TRACKED</div></div>
          </section>

          <section className="middle-grid">
            <div className="panel activity-panel" id="activity"><div className="panel-head"><div><div className="eyebrow">BEHAVIOUR ANALYTICS</div><h2>Activity overview</h2></div><span className="period">LAST 7 DAYS⌄</span></div><div className="chart-summary"><b>248 <span>events</span></b><small className="green-text">↗ 12.8% <span className="muted">vs. previous week</span></small></div><div className="chart"><div className="y-labels"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div className="chart-area"><div className="grid-lines"><i></i><i></i><i></i><i></i><i></i></div><div className="bars">{weekly.map((d,i)=><div className="bar-wrap" key={d.day}><div className={'bar ' + (i===5?'bar-highlight':'')} style={{height:d.value+'%'}} title={d.value+' events'}></div><small>{d.day}</small></div>)}</div></div></div><div className="chart-legend"><span><i className="legend-blue"></i> Normal activity</span><span><i className="legend-purple"></i> Higher activity</span><span className="muted">Illustrative sample data</span></div></div>
            <div className="panel signal-panel"><div className="panel-head"><div><div className="eyebrow">HEURISTIC ENGINE</div><h2>Risk assessment</h2></div><span className="shield">⬡</span></div><div className="signal-score"><div className="signal-number">{highEvents ? '1' : '0'}<small> flagged</small></div><span className={highEvents ? 'risk-chip' : 'safe-chip'}>{highEvents ? 'Review required' : 'Looking good'}</span></div><div className="risk-line"><span>Unusual sign-in pattern</span><b className={highEvents ? 'red-text' : 'green-text'}>{highEvents ? 'DETECTED' : 'CLEAR'}</b></div><div className="risk-line"><span>Connected app permissions</span><b className="green-text">MONITORED</b></div><div className="risk-line"><span>Session activity</span><b className="green-text">NORMAL</b></div><div className="signal-note">ⓘ <span>Signals are generated from the sample events in this local demo. They are not a real security assessment.</span></div></div>
          </section>

          <section className="panel connections-panel" id="connections"><div className="panel-head"><div><div className="eyebrow">ACCESS MANAGEMENT</div><h2>Connected applications</h2><p className="panel-sub">Review the services linked to your digital identity.</p></div><span className="count-pill">{activeApps} ACTIVE</span></div><div className="app-list">{apps.map(app=><div className={'app-row ' + (!app.active?'inactive':'')} key={app.id}><div className={'app-icon '+app.color}>{app.icon}</div><div className="app-info"><b>{app.name}</b><small>{app.category} · Connected {app.connected}</small></div><div className="app-permissions"><small>PERMISSIONS</small><span>{app.scopes.join(' · ')}</span></div><div className="app-access"><small>ACCESS LEVEL</small><span>{app.access}</span></div><div className="app-risk"><span className={app.risk==='high' && app.active?'risk-chip':'safe-chip'}>{!app.active?'REVOKED':app.risk==='high'?'REVIEW':'LOW RISK'}</span></div><button className={app.active?'revoke-btn':'restore-btn'} onClick={()=>updateApp(app.id, app.active?'revoke':'restore')}>{app.active?'Revoke access':'Restore'}</button></div>)}</div><div className="panel-foot"><span>Showing {apps.length} connected services · Demo data</span><span>Changes are saved in this browser</span></div></section>

          <section className="bottom-grid">
            <div className="panel events-panel"><div className="panel-head"><div><div className="eyebrow">TRANSPARENCY FEED</div><h2>Recent activity</h2></div><select value={filter} onChange={e=>{setFilter(e.target.value);setShowAll(false)}}><option>All activity</option><option>Alerts</option><option>Access</option><option>Session</option><option>Control</option><option>Verification</option></select></div><div className="event-list">{displayedEvents.length ? displayedEvents.map(ev=><div className="event-row" key={ev.id}><div className={'event-dot '+(ev.severity==='high'?'event-alert':'')}></div><div className="event-copy"><b>{ev.detail}</b><small>{ev.app} · {ev.type}</small></div><span className="event-time">{ev.time}</span></div>) : <div className="empty-state">No events in this view.</div>}</div>{visibleEvents.length>4&&<button className="text-btn" onClick={()=>setShowAll(v=>!v)}>{showAll?'Show less':'View all activity →'}</button>}</div>
            <div className="panel recommendation-panel" id="recommendations"><div className="panel-head"><div><div className="eyebrow">NEXT BEST ACTION</div><h2>Recommendations</h2></div><span className="spark">✧</span></div>{highEvents ? <div className="recommendation"><div className="recommend-icon warning">!</div><div><b>Review an unfamiliar session</b><p>An unverified device has appeared in the sample activity feed. Review it and revoke access if it is not recognized.</p><button className="recommend-action" onClick={()=>document.getElementById('connections')?.scrollIntoView({behavior:'smooth'})}>Review connected apps →</button></div></div> : <div className="recommendation"><div className="recommend-icon">✓</div><div><b>Your demo workspace looks clear</b><p>No high-risk sample signals are currently active. Continue reviewing permissions periodically.</p></div></div>}<div className="recommend-foot">✦ &nbsp; Recommendations are generated from local demo signals.</div></div>
          </section>
          <footer><span>E.D.I.T.H. <i>·</i> Enhanced Digital Identity, Trust & Heuristics</span><span>HACKATHON PROTOTYPE <i>·</i> NOT A LIVE SECURITY SERVICE</span></footer>
        </div>
      </main>
      {notice && <div className="toast">✓ &nbsp; {notice}</div>}
    </div>
  );
}

export default App;