import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import type { AdminStats, AdminReferrerRow, AdminApplicationRow, AdminCodeRow } from '../types/referral';
import './ReferralAdmin.css';

export default function ReferralAdmin() {
  const [secret, setSecret] = useState(() => sessionStorage.getItem('admin_secret') || '');
  const [inputSecret, setInputSecret] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'stats' | 'referrers' | 'applications' | 'codes'>('stats');
  
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [referrers, setReferrers] = useState<AdminReferrerRow[]>([]);
  const [applications, setApplications] = useState<AdminApplicationRow[]>([]);
  const [codes, setCodes] = useState<AdminCodeRow[]>([]);

  const [showAddReferrer, setShowAddReferrer] = useState(false);
  const [newReferrerData, setNewReferrerData] = useState({ name: '', email: '', tier: 'member' });
  const [newToken, setNewToken] = useState('');

  usePageMeta({ title: 'Referral Admin', description: 'Admin dashboard' });

  const apiCall = async (action: string, params: any = {}) => {
    const res = await fetch('/api/referral/admin/manage', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action, ...params })
    });
    return res.json();
  };

  const loadData = async (tab: string, currentSecret: string) => {
    setLoading(true);
    setError('');
    
    try {
      let action = '';
      if (tab === 'stats') action = 'get_stats';
      if (tab === 'referrers') action = 'list_referrers';
      if (tab === 'applications') action = 'list_applications';
      if (tab === 'codes') action = 'list_codes';

      const res = await fetch('/api/referral/admin/manage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentSecret}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });
      
      const json = await res.json();
      
      if (json.success) {
        if (tab === 'stats') setStats(json.data);
        if (tab === 'referrers') setReferrers(json.data);
        if (tab === 'applications') setApplications(json.data);
        if (tab === 'codes') setCodes(json.data);
        
        if (currentSecret !== secret) {
          setSecret(currentSecret);
          sessionStorage.setItem('admin_secret', currentSecret);
        }
      } else {
        setError(json.error?.message || 'Failed to load data.');
        if (json.error?.code === 'UNAUTHORIZED') {
          handleLogout();
        }
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (secret) loadData(activeTab, secret);
  }, [activeTab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSecret.trim()) loadData(activeTab, inputSecret.trim());
  };

  const handleLogout = () => {
    setSecret('');
    setInputSecret('');
    sessionStorage.removeItem('admin_secret');
  };

  const handleCreateReferrer = async (e: React.FormEvent) => {
    e.preventDefault();
    const json = await apiCall('create_referrer', newReferrerData);
    if (json.success) {
      setNewToken(json.data.accessToken);
      loadData('referrers', secret);
    } else {
      alert(json.error?.message || 'Error creating referrer');
    }
  };

  const handleAction = async (action: string, params: any) => {
    if (!window.confirm(`Are you sure you want to perform: ${action}?`)) return;
    const json = await apiCall(action, params);
    if (json.success) {
      loadData(activeTab, secret);
    } else {
      alert(json.error?.message || 'Action failed');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  if (!secret && !stats && !referrers.length) {
    return (
      <div className="admin-dash">
        <nav className="admin-dash-nav"><h2>Admin Login</h2></nav>
        <div className="admin-login fade vis">
          <div className="admin-login-card">
            <h1>Admin Access</h1>
            {error && <div style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</div>}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input 
                type="password" 
                value={inputSecret} 
                onChange={e => setInputSecret(e.target.value)} 
                placeholder="Admin Secret"
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--div)', background: 'transparent', color: 'white' }}
                autoFocus
              />
              <button type="submit" className="btn btn-primary">Login</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dash">
      <nav className="admin-dash-nav">
        <h2>Referral System Admin</h2>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/" style={{ color: 'var(--tm)', textDecoration: 'none' }}>Back to Site</Link>
          <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Sign Out</button>
        </div>
      </nav>

      <div className="admin-content fade vis">
        <div className="admin-header">
          <div className="admin-tabs">
            <button className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>Dashboard</button>
            <button className={`admin-tab ${activeTab === 'referrers' ? 'active' : ''}`} onClick={() => setActiveTab('referrers')}>Referrers</button>
            <button className={`admin-tab ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>Applications</button>
            <button className={`admin-tab ${activeTab === 'codes' ? 'active' : ''}`} onClick={() => setActiveTab('codes')}>Codes</button>
          </div>
          <div className="admin-actions">
            <a href="/api/referral/admin/manage?action=export_csv&type=applications" download className="btn btn-gray btn-sm">Export Apps</a>
            <a href="/api/referral/admin/manage?action=export_csv&type=referrers" download className="btn btn-gray btn-sm">Export Referrers</a>
          </div>
        </div>

        {loading && <div style={{ padding: '40px', textAlign: 'center', color: 'var(--tm)' }}>Loading...</div>}

        {!loading && activeTab === 'stats' && stats && (
          <div className="admin-stats">
            <div className="admin-stat-card"><div className="admin-stat-label">Referrers</div><div className="admin-stat-val">{stats.activeReferrers} / {stats.totalReferrers}</div></div>
            <div className="admin-stat-card"><div className="admin-stat-label">Total Applications</div><div className="admin-stat-val">{stats.totalApplications}</div></div>
            <div className="admin-stat-card"><div className="admin-stat-label">Accepted</div><div className="admin-stat-val">{stats.acceptedApplications}</div></div>
            <div className="admin-stat-card"><div className="admin-stat-label">Acceptance Rate</div><div className="admin-stat-val">{stats.acceptanceRate}%</div></div>
          </div>
        )}

        {!loading && activeTab === 'referrers' && (
          <div>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowAddReferrer(true)}>+ Add Referrer</button>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Name/Email</th><th>Tier</th><th>Status</th><th>Invites Used/Limit</th><th>Actions</th></tr></thead>
                <tbody>
                  {referrers.map(r => (
                    <tr key={r.id}>
                      <td><div style={{fontWeight:600}}>{r.name}</div><div style={{fontSize:'0.8rem', color:'var(--tm)'}}>{r.email}</div></td>
                      <td><span className={`ref-status-badge`}>{r.tier}</span></td>
                      <td><span className={`ref-status-badge ref-status-${r.status}`}>{r.status}</span></td>
                      <td>{r.invitesUsed} / {r.inviteLimit}</td>
                      <td className="admin-td-actions">
                        {r.status === 'pending' && <button className="btn btn-green btn-sm" onClick={() => handleAction('approve_referrer', { referrerId: r.id })}>Approve</button>}
                        {r.status === 'approved' && <button className="btn btn-gray btn-sm" onClick={() => handleAction('suspend_referrer', { referrerId: r.id })}>Suspend</button>}
                        {r.status === 'suspended' && <button className="btn btn-green btn-sm" onClick={() => handleAction('approve_referrer', { referrerId: r.id })}>Re-Approve</button>}
                        <button className="btn btn-red btn-sm" onClick={() => handleAction('revoke_referrer', { referrerId: r.id })}>Revoke</button>
                        <select className="btn btn-gray btn-sm" value={r.tier} onChange={(e) => handleAction('change_tier', { referrerId: r.id, tier: e.target.value })}>
                          <option value="member">Member</option><option value="trusted">Trusted</option><option value="core">Core</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'applications' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Applicant</th><th>Referrer/Code</th><th>Profile</th><th>Motivation</th><th>Status/Actions</th></tr></thead>
              <tbody>
                {applications.map(a => (
                  <tr key={a.id}>
                    <td><div style={{fontWeight:600}}>{a.applicantName}</div><div style={{fontSize:'0.8rem', color:'var(--tm)'}}>{a.applicantEmail}</div></td>
                    <td><div style={{fontWeight:500}}>{a.referrerName}</div><code>{a.code}</code></td>
                    <td><div style={{fontSize:'0.8rem'}}>{a.college}<br/>{a.year}<br/>{a.researchInterests}</div></td>
                    <td><div style={{fontSize:'0.8rem', maxHeight:'80px', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'200px'}} title={a.motivation || ''}>{a.motivation}</div></td>
                    <td>
                      <span className={`ref-status-badge ref-status-${a.status}`} style={{marginBottom:'8px', display:'inline-block'}}>{a.status}</span>
                      {a.status === 'pending' && (
                        <div className="admin-td-actions">
                          <button className="btn btn-green btn-sm" onClick={() => handleAction('accept_application', { applicationId: a.id })}>Accept</button>
                          <button className="btn btn-red btn-sm" onClick={() => handleAction('reject_application', { applicationId: a.id })}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && activeTab === 'codes' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Code</th><th>Referrer</th><th>Status</th><th>Uses</th><th>Actions</th></tr></thead>
              <tbody>
                {codes.map(c => (
                  <tr key={c.id}>
                    <td><code style={{fontSize:'1.1rem'}}>{c.code}</code></td>
                    <td>{c.referrerName}</td>
                    <td><span className={`ref-status-badge ref-status-${c.status}`}>{c.status}</span></td>
                    <td>{c.usesCount} / {c.maxUses || '∞'}</td>
                    <td>
                      {c.status === 'active' && <button className="btn btn-red btn-sm" onClick={() => handleAction('revoke_code', { codeId: c.id })}>Revoke</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddReferrer && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>Add New Referrer</h3>
            {newToken ? (
              <div className="admin-token-display">
                <p style={{color:'#22c55e', fontWeight:600, marginBottom:'8px'}}>Referrer Approved!</p>
                <p style={{fontSize:'0.8rem', marginBottom:'16px'}}>Send this token to the referrer. It will not be shown again.</p>
                <code>{newToken}</code>
                <button className="btn btn-primary" onClick={() => copyToClipboard(newToken)} style={{width:'100%', marginTop:'12px'}}>Copy Token</button>
              </div>
            ) : (
              <form onSubmit={handleCreateReferrer}>
                <div className="admin-form-group">
                  <label>Name</label>
                  <input required type="text" value={newReferrerData.name} onChange={e => setNewReferrerData({...newReferrerData, name: e.target.value})} />
                </div>
                <div className="admin-form-group">
                  <label>Email</label>
                  <input required type="email" value={newReferrerData.email} onChange={e => setNewReferrerData({...newReferrerData, email: e.target.value})} />
                </div>
                <div className="admin-form-group">
                  <label>Tier</label>
                  <select value={newReferrerData.tier} onChange={e => setNewReferrerData({...newReferrerData, tier: e.target.value})}>
                    <option value="member">Member (3 invites)</option>
                    <option value="trusted">Trusted (5 invites)</option>
                    <option value="core">Core (10 invites)</option>
                  </select>
                </div>
                <div className="admin-modal-actions">
                  <button type="button" className="btn btn-gray" onClick={() => setShowAddReferrer(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create & Approve</button>
                </div>
              </form>
            )}
            {newToken && (
              <div className="admin-modal-actions">
                <button type="button" className="btn btn-gray" onClick={() => { setShowAddReferrer(false); setNewToken(''); }}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
