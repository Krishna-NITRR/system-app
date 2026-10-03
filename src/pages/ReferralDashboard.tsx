import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import type { DashboardStats, DashboardApplication, DashboardCode } from '../types/referral';
import './ReferralDashboard.css';

export default function ReferralDashboard() {
  const [token, setToken] = useState(() => localStorage.getItem('ref_token') || '');
  const [inputToken, setInputToken] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'applications' | 'codes'>('applications');
  
  const [inviting, setInviting] = useState(false);
  const [newInvite, setNewInvite] = useState<{code: string, url: string} | null>(null);
  
  usePageMeta({
    title: 'Referrer Dashboard — Krishna Mahawar',
    description: 'Manage your exclusive mentorship invitations.',
  });

  const fetchDashboard = async (authToken: string) => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/referral/dashboard', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const json = await res.json();
      
      if (json.success) {
        setData(json.data);
        if (authToken !== token) {
          setToken(authToken);
          localStorage.setItem('ref_token', authToken);
        }
      } else {
        setError(json.error?.message || 'Failed to load dashboard.');
        if (json.error?.code === 'UNAUTHORIZED') {
          handleLogout();
        }
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboard(token);
    }
  }, []); // Only on mount

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputToken.trim()) {
      fetchDashboard(inputToken.trim());
    }
  };

  const handleLogout = () => {
    setToken('');
    setInputToken('');
    setData(null);
    localStorage.removeItem('ref_token');
  };

  const handleInvite = async () => {
    setInviting(true);
    try {
      const res = await fetch('/api/referral/invite', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      
      if (json.success) {
        setNewInvite({ code: json.data.code, url: json.data.inviteUrl });
        // Refresh dashboard data silently
        fetchDashboard(token);
      } else {
        alert(json.error?.message || 'Could not generate invitation.');
      }
    } catch (err) {
      alert('Network error while generating invite.');
    } finally {
      setInviting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      alert('Failed to copy. Please copy manually.');
    }
  };

  // ── Render Login ──
  if (!token && !data) {
    return (
      <div className="ref-dash">
        <nav className="ref-dash-nav">
          <Link to="/" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 600 }}>Krishna Mahawar<span style={{color:'var(--purple)'}}>.</span></Link>
        </nav>
        <div className="ref-login fade vis">
          <div className="ref-login-card">
            <h1>Referrer Portal</h1>
            <p>Enter your access token to view your dashboard.</p>
            {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
            <form onSubmit={handleLogin} className="ref-login-form">
              <input 
                type="password" 
                value={inputToken} 
                onChange={e => setInputToken(e.target.value)} 
                placeholder="Paste your access token..."
                className="ref-login-input"
                autoFocus
              />
              <button type="submit" className="ref-login-btn" disabled={loading}>
                {loading ? 'Verifying...' : 'Access Dashboard'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Render Dashboard ──
  if (!data) return <div className="ref-dash ref-loading">Loading dashboard...</div>;

  const { referrer, stats, applications, codes } = data;

  return (
    <div className="ref-dash">
      <nav className="ref-dash-nav">
        <h2>Referrer Dashboard</h2>
        <button onClick={handleLogout} className="ref-logout">Sign Out</button>
      </nav>

      <div className="ref-dash-content fade vis">
        <header className="ref-header">
          <div className="ref-header-info">
            <span className={`ref-tier-badge ref-tier-${referrer.tier}`}>{referrer.tier} Referrer</span>
            <h1>Welcome, {referrer.name}</h1>
            <p>You can invite trusted individuals to apply for the mentorship program.</p>
          </div>
          
          <div className="ref-invite-action">
            <h3>Invitations Remaining</h3>
            <div className="ref-invite-count">
              {referrer.invitesRemaining} <span>/ {referrer.inviteLimit}</span>
            </div>
            <button 
              className="ref-invite-btn" 
              onClick={handleInvite} 
              disabled={referrer.invitesRemaining <= 0 || inviting}
            >
              {inviting ? 'Generating...' : 'Invite a Candidate'}
            </button>
            {referrer.resetDate && (
              <span className="ref-reset-note">
                Resets on {new Date(referrer.resetDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </header>

        <section className="ref-stats-grid">
          <div className="ref-stat-card">
            <div className="ref-stat-label">Total Applications</div>
            <div className="ref-stat-val">{stats.totalApplications}</div>
          </div>
          <div className="ref-stat-card">
            <div className="ref-stat-label">Accepted</div>
            <div className="ref-stat-val">{stats.acceptedApplications}</div>
          </div>
          <div className="ref-stat-card">
            <div className="ref-stat-label">Pending Review</div>
            <div className="ref-stat-val">{stats.pendingApplications}</div>
          </div>
        </section>

        <div className="ref-tabs">
          <button className={`ref-tab ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>
            Applications
          </button>
          <button className={`ref-tab ${activeTab === 'codes' ? 'active' : ''}`} onClick={() => setActiveTab('codes')}>
            Generated Codes
          </button>
        </div>

        {activeTab === 'applications' && (
          <div className="ref-table-wrap">
            {applications.length === 0 ? (
              <div className="ref-empty">No applications submitted with your codes yet.</div>
            ) : (
              <table className="ref-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Code Used</th>
                    <th>Submitted</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{fontWeight:500}}>{app.applicantName}</div>
                        <div style={{fontSize:'0.8rem', color:'var(--tm)'}}>{app.applicantEmail}</div>
                      </td>
                      <td><code style={{background:'rgba(255,255,255,0.05)', padding:'2px 6px', borderRadius:'4px'}}>{app.code}</code></td>
                      <td>{new Date(app.submittedAt).toLocaleDateString()}</td>
                      <td><span className={`ref-status-badge ref-status-${app.status}`}>{app.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'codes' && (
          <div className="ref-table-wrap">
            {codes.length === 0 ? (
              <div className="ref-empty">You haven't generated any invitation codes yet.</div>
            ) : (
              <table className="ref-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th>Uses</th>
                    <th>Valid Until</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((code, i) => (
                    <tr key={i}>
                      <td style={{fontWeight:600, letterSpacing:'1px', color:'var(--text)'}}>{code.code}</td>
                      <td>{new Date(code.createdAt).toLocaleDateString()}</td>
                      <td><span className={`ref-status-badge ref-status-${code.status}`}>{code.status}</span></td>
                      <td>{code.usesCount} {code.maxUses ? `/ ${code.maxUses}` : ''}</td>
                      <td style={{color:'var(--tm)'}}>{code.validUntil ? new Date(code.validUntil).toLocaleDateString() : 'Forever'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* New Invite Modal */}
      {newInvite && (
        <div className="ref-modal-overlay">
          <div className="ref-modal fade vis">
            <h3>Invitation Generated</h3>
            <p>Share this link with your candidate. They will need it to apply.</p>
            <div className="ref-code-display">{newInvite.code}</div>
            <div className="ref-modal-actions">
              <button className="ref-copy-btn" onClick={() => copyToClipboard(newInvite.url)}>
                Copy Invite Link
              </button>
              <button className="ref-close-btn" onClick={() => setNewInvite(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
