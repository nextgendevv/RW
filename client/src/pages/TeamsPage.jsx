import { useState, useEffect } from 'react';
import api from '../api';

export default function TeamsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState('level1');

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await api.get('/teams');
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch teams', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  const currentLevelUsers = data?.levels[activeLevel] || [];

  return (
    <div className="teams-container">
      <div className="teams-header">
        <h1 className="gradient-text">My Network</h1>
        <p>Monitor and manage your multi-level recruitment tree</p>
      </div>

      <div className="level-summary-grid">
        <div 
          className={`glass-card level-card ${activeLevel === 'level1' ? 'active' : ''}`}
          onClick={() => setActiveLevel('level1')}
        >
          <div className="level-badge">Level 1</div>
          <div className="level-count">{data?.summary.level1Count || 0}</div>
          <div className="level-label">Direct Referrals</div>
          <div className="level-indicator" />
        </div>

        <div 
          className={`glass-card level-card ${activeLevel === 'level2' ? 'active' : ''}`}
          onClick={() => setActiveLevel('level2')}
        >
          <div className="level-badge">Level 2</div>
          <div className="level-count">{data?.summary.level2Count || 0}</div>
          <div className="level-label">Indirect Referrals</div>
          <div className="level-indicator" />
        </div>

        <div 
          className={`glass-card level-card ${activeLevel === 'level3' ? 'active' : ''}`}
          onClick={() => setActiveLevel('level3')}
        >
          <div className="level-badge">Level 3</div>
          <div className="level-count">{data?.summary.level3Count || 0}</div>
          <div className="level-label">Extended Network</div>
          <div className="level-indicator" />
        </div>
      </div>

      <div className="glass-card table-section">
        <div className="table-header">
          <h3>
            {activeLevel === 'level1' && 'Direct Recruits'}
            {activeLevel === 'level2' && 'Level 2 Partners'}
            {activeLevel === 'level3' && 'Level 3 Network'}
          </h3>
          <span className="user-count">{currentLevelUsers.length} total users</span>
        </div>

        <div className="table-responsive">
          <table className="teams-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Joined Date</th>
                <th>Code</th>
              </tr>
            </thead>
            <tbody>
              {currentLevelUsers.length > 0 ? (
                currentLevelUsers.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="user-cell">
                        <div className="mini-avatar">{u.firstName[0]}</div>
                        <span>{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td><span className="table-code">{u.referralCode}</span></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-state">
                    No users found in this level yet. Share your link to grow your team!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}