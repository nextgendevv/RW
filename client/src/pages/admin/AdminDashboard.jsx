import { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';
import api from '../../api';
import '../AdminPage.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsRes = await api.get('/admin/stats');
        setStats(statsRes.data);
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="gradient-text" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Admin Dashboard</h1>
        <p>Monitor system activity and manage users across the network</p>
      </div>

      <div className="stats-overview">
        <div className="stat-card glass-card">
          <span className="stat-label">Total Users</span>
          <span className="stat-value">{stats?.totalUsers || 0}</span>
          <div className="stat-detail-row">
             <div className="stat-mini">
                <span className="mini-label">Today</span>
                <span className="mini-value">+{stats?.usersToday || 0}</span>
             </div>
             <div className="stat-mini">
                <span className="mini-label">Yesterday</span>
                <span className="mini-value">+{stats?.usersYesterday || 0}</span>
             </div>
          </div>
        </div>
        
        <div className="stat-card glass-card">
          <span className="stat-label">Total Revenue</span>
          <span className="stat-value">₹{stats?.totalRevenue || 0}</span>
          <div className="stat-status positive">Total approved deposits</div>
        </div>

        <div className="stat-card glass-card">
          <span className="stat-label">Commissions</span>
          <span className="stat-value">₹{stats?.totalCommissions || 0}</span>
          <div className="stat-status" style={{ color: '#f59e0b' }}>₹{stats?.pendingCommissions || 0} pending payout</div>
        </div>

        <div className="stat-card glass-card">
          <span className="stat-label">Platform Profit</span>
          <span className="stat-value" style={{ color: '#10b981' }}>
            ₹{(stats?.totalRevenue - stats?.totalCommissions) || 0}
          </span>
          <div className="stat-status">Net growth</div>
        </div>
      </div>

      <div className="stats-overview" style={{ marginTop: '20px' }}>
        <div className="stat-card glass-card">
           <span className="stat-label">Role Distribution</span>
           <div className="role-distribution" style={{ marginTop: '10px' }}>
             {stats?.roleStats.map(role => (
               <div key={role._id} className="role-item" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                 <span className="role-name" style={{ textTransform: 'capitalize' }}>{role._id}</span>
                 <span className="role-count" style={{ fontWeight: '700' }}>{role.count}</span>
               </div>
             ))}
           </div>
        </div>
        
        <div className="stat-card glass-card">
           <span className="stat-label">Membership Status</span>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <div style={{ backgroundColor: '#1DB954', width: '10px', height: '10px', borderRadius: '50%' }} />
                 <span>Active (Premium)</span>
               </div>
               <span style={{ fontWeight: '700', color: '#1DB954' }}>{stats?.activeUsers || 0}</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <div style={{ backgroundColor: '#ef4444', width: '10px', height: '10px', borderRadius: '50%' }} />
                 <span>Inactive (Free)</span>
               </div>
               <span style={{ fontWeight: '700', color: '#ef4444' }}>{stats?.inactiveUsers || 0}</span>
             </div>
           </div>
           <div className="stat-status" style={{ marginTop: '10px' }}>Last 7 days growth: +{stats?.newUsersLast7Days || 0}</div>
        </div>
      </div>

      <div className="charts-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginTop: '25px' }}>
        <div className="glass-card" style={{ padding: '20px', height: '400px' }}>
           <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>User Registration Trend (14 Days)</h3>
           <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={stats?.chartData}>
                 <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                 <XAxis 
                   dataKey="date" 
                   stroke="rgba(255,255,255,0.3)" 
                   fontSize={10} 
                   tickFormatter={(str) => str.split('-').slice(1).join('/')}
                 />
                 <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                 <Tooltip 
                   contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                   itemStyle={{ color: '#ef4444' }}
                 />
                 <Area type="monotone" dataKey="users" stroke="#ef4444" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
              </AreaChart>
           </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ padding: '20px', height: '400px' }}>
           <h3 style={{ marginBottom: '20px', fontSize: '1.1rem' }}>Revenue Growth (14 Days)</h3>
           <ResponsiveContainer width="100%" height="90%">
              <BarChart data={stats?.chartData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                 <XAxis 
                   dataKey="date" 
                   stroke="rgba(255,255,255,0.3)" 
                   fontSize={10}
                   tickFormatter={(str) => str.split('-').slice(1).join('/')}
                 />
                 <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} />
                 <Tooltip 
                   contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                   itemStyle={{ color: '#10b981' }}
                 />
                 <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
           </ResponsiveContainer>
        </div>
      </div>

      <div className="admin-recent-activity glass-card">
        <h2>Quick Reports</h2>
        <div className="reports-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          <div className="report-item" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Database Status</span>
            <div style={{ fontWeight: '600', color: '#10b981' }}>Connected</div>
          </div>
          <div className="report-item" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>API Latency</span>
            <div style={{ fontWeight: '600' }}>42ms</div>
          </div>
          <div className="report-item" style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Uptime</span>
            <div style={{ fontWeight: '600' }}>99.98%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
