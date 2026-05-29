import { useState, useEffect } from 'react';
import { 
  DollarSign,
  Edit2,
  Save,
  X
} from '../../components/Icons';
import api from '../../api';
import '../AdminPage.css';

export default function CommissionSettings() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCommissionConfigs();
  }, []);

  const fetchCommissionConfigs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/commission-config');
      setConfigs(res.data);
    } catch (err) {
      console.error('Failed to fetch commission config', err);
      setMessage('Failed to load commission settings');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (config) => {
    setEditingId(config._id);
    setEditValue(config.commissionPercentage);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSave = async (id) => {
    try {
      if (editValue < 0 || editValue > 100) {
        setMessage('Percentage must be between 0 and 100');
        return;
      }

      setSaving(true);
      await api.put(`/admin/commission-config/${id}`, {
        commissionPercentage: parseFloat(editValue)
      });

      setConfigs(configs.map(c => 
        c._id === id ? { ...c, commissionPercentage: parseFloat(editValue) } : c
      ));

      setEditingId(null);
      setEditValue('');
      setMessage('Commission percentage updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Failed to update commission', err);
      setMessage('Failed to save commission settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="gradient-text" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Commission Settings
        </h1>
        <p>Configure commission percentages for each subscription plan</p>
      </div>

      {message && (
        <div className="message-alert glass-card" style={{
          padding: '12px 16px',
          marginBottom: '20px',
          borderLeft: '4px solid #10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)'
        }}>
          {message}
        </div>
      )}

      <div className="user-management-section glass-card">
        <div className="section-header">
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <DollarSign size={22} className="text-primary" />
            <h2 style={{margin: 0}}>Plan Commission Rates</h2>
          </div>
          <span className="badge" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            {configs.length} Plans
          </span>
        </div>

        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Plan Name</th>
                <th>Plan Price (₹)</th>
                <th>Commission %</th>
                <th>Commission Amount (₹)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {configs.map(config => (
                <tr key={config._id}>
                  <td>
                    <strong>{config.planName || 'Unknown'}</strong>
                  </td>
                  <td>
                    <span style={{ fontWeight: '500' }}>₹{config.planPrice?.toFixed(2) || '0.00'}</span>
                  </td>
                  <td>
                    {editingId === config._id ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{
                          width: '60px',
                          padding: '6px 8px',
                          borderRadius: '4px',
                          border: '1px solid #e5e7eb',
                          fontSize: '14px'
                        }}
                      />
                    ) : (
                      <span style={{ fontWeight: '600', color: '#10b981' }}>
                        {config.commissionPercentage}%
                      </span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontWeight: '500', color: '#f59e0b' }}>
                      ₹{config.commissionAmount?.toFixed(2) || '0.00'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {editingId === config._id ? (
                        <>
                          <button
                            onClick={() => handleSave(config._id)}
                            disabled={saving}
                            style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: saving ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              opacity: saving ? 0.6 : 1
                            }}
                          >
                            <Save size={14} /> Save
                          </button>
                          <button
                            onClick={handleCancel}
                            disabled={saving}
                            style={{
                              background: '#6b7280',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: saving ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px'
                            }}
                          >
                            <X size={14} /> Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEdit(config)}
                          style={{
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px'
                          }}
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Section */}
      <div className="glass-card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
        <h3 style={{ marginTop: 0, color: '#10b981' }}>📋 How It Works</h3>
        <ul style={{ lineHeight: '1.8', color: '#6b7280', marginBottom: 0 }}>
          <li>When a user subscribes to a plan, commission is calculated as: <strong>Plan Price × Commission % ÷ 100</strong></li>
          <li>Click "Edit" to change the commission percentage for any plan</li>
          <li>Changes take effect immediately for new subscriptions</li>
          <li>Commission appears as "pending" in Commission Management until manually approved by admin</li>
          <li>Once approved, the referrer receives the commission in their main wallet</li>
        </ul>
      </div>
    </div>
  );
}
