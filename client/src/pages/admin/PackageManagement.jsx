import { useState, useEffect } from 'react';
import api from '../../api';
import '../AdminPage.css';

export default function PackageManagement() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPkg, setEditingPkg] = useState(null);
  const [form, setForm] = useState({
    name: '',
    key: '',
    price: '',
    originalPrice: '',
    discountPercentage: '',
    durationInDays: '',
    description: '',
    features: '',
    isActive: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await api.get('/admin/packages');
      setPackages(res.data);
    } catch (err) {
      console.error('Failed to fetch packages', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (pkg) => {
    setEditingPkg(pkg);
    setForm({
      name: pkg.name,
      key: pkg.key,
      price: pkg.price,
      originalPrice: pkg.originalPrice || '',
      discountPercentage: pkg.discountPercentage || '',
      durationInDays: pkg.durationInDays,
      description: pkg.description || '',
      features: pkg.features?.join(', ') || '',
      isActive: pkg.isActive
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditingPkg(null);
    setForm({
      name: '',
      key: '',
      price: '',
      originalPrice: '',
      discountPercentage: '',
      durationInDays: '',
      description: '',
      features: '',
      isActive: true
    });
  };

  const calculateDiscount = (original, percentage) => {
    if (!original || !percentage) return '';
    const discount = (original * percentage) / 100;
    return Math.round(original - discount);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setForm(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      // Auto calculate price if originalPrice or discountPercentage changes
      if (name === 'originalPrice' || name === 'discountPercentage') {
        const newPrice = calculateDiscount(
          name === 'originalPrice' ? value : prev.originalPrice,
          name === 'discountPercentage' ? value : prev.discountPercentage
        );
        if (newPrice !== '') {
          updated.price = newPrice;
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        features: form.features.split(',').map(f => f.trim()).filter(Boolean),
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        discountPercentage: form.discountPercentage ? Number(form.discountPercentage) : undefined,
        durationInDays: Number(form.durationInDays)
      };

      if (editingPkg) {
        await api.put(`/admin/packages/${editingPkg._id}`, payload);
      } else {
        await api.post('/admin/packages', payload);
      }
      
      fetchPackages();
      handleCancel();
    } catch (err) {
      console.error('Failed to save package', err);
      alert(err.response?.data?.message || 'Failed to save package');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;
    try {
      await api.delete(`/admin/packages/${id}`);
      setPackages(packages.filter(p => p._id !== id));
    } catch (err) {
      console.error('Failed to delete package', err);
      alert('Failed to delete package');
    }
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="gradient-text" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Package Management</h1>
        <p>Create and manage subscription packages for users</p>
      </div>

      <div className="glass-card" style={{ marginBottom: '20px', padding: '20px' }}>
        <h2 style={{ marginBottom: '15px' }}>{editingPkg ? 'Edit Package' : 'Create New Package'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label>Package Name</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. 1 Year Premium" />
          </div>
          <div className="form-group">
            <label>Key (Unique Identifier)</label>
            <input name="key" value={form.key} onChange={handleChange} required placeholder="e.g. 1_year" disabled={!!editingPkg} />
          </div>
          <div className="form-group">
            <label>Original Price (₹)</label>
            <input type="number" name="originalPrice" value={form.originalPrice} onChange={handleChange} placeholder="Optional" />
          </div>
          <div className="form-group">
            <label>Discount Percentage (%)</label>
            <input type="number" name="discountPercentage" value={form.discountPercentage} onChange={handleChange} placeholder="Optional" />
          </div>
          <div className="form-group">
            <label>Final Price (₹)</label>
            <input type="number" name="price" value={form.price} onChange={handleChange} required placeholder="0" />
          </div>
          <div className="form-group">
            <label>Duration (Days)</label>
            <input type="number" name="durationInDays" value={form.durationInDays} onChange={handleChange} required placeholder="365" />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Briefly describe the package" style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Features (Comma separated)</label>
            <input name="features" value={form.features} onChange={handleChange} placeholder="Feature 1, Feature 2, Feature 3" />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} id="isActive" />
            <label htmlFor="isActive" style={{ margin: 0 }}>Active and Visible to Users</label>
          </div>
          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : (editingPkg ? 'Update Package' : 'Create Package')}
            </button>
            {editingPkg && <button type="button" className="btn-ghost" onClick={handleCancel}>Cancel</button>}
          </div>
        </form>
      </div>

      <div className="user-management-section glass-card">
        <div className="section-header">
          <h2>Available Packages</h2>
          <span className="badge" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)' }}>{packages.length} Packages</span>
        </div>
        
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Package Details</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {packages.map(pkg => (
                <tr key={pkg._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{pkg.name}</div>
                    <div className="text-dim" style={{ fontSize: '0.8rem' }}>Key: {pkg.key}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>₹{pkg.price}</div>
                    {pkg.originalPrice && (
                      <div className="text-dim" style={{ fontSize: '0.8rem', textDecoration: 'line-through' }}>
                        ₹{pkg.originalPrice}
                      </div>
                    )}
                    {pkg.discountPercentage && (
                      <div style={{ fontSize: '0.75rem', color: '#1DB954' }}>
                        {pkg.discountPercentage}% OFF
                      </div>
                    )}
                  </td>
                  <td>{pkg.durationInDays} Days</td>
                  <td>
                    <span className={`badge ${pkg.isActive ? 'approved' : 'rejected'}`} style={{ backgroundColor: pkg.isActive ? '#1DB954' : '#ef4444' }}>
                      {pkg.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleEdit(pkg)} className="btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Edit</button>
                      <button onClick={() => handleDelete(pkg._id)} className="btn-ghost" style={{ padding: '4px 8px', fontSize: '0.8rem', color: '#ef4444' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
