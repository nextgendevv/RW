import { useState, useEffect } from 'react';
import api from '../api';

const TreeNode = ({ node, isLastChild, currentGain }) => {
  return (
    <div className={`tree-node ${isLastChild ? 'last-child' : ''}`}>
      <div className="tree-content">
        <div className="tree-user-info">
          <div className="tree-user-avatar">{node.firstName[0]}</div>
          <div className="tree-user-details">
            <h4>{node.firstName} {node.lastName}</h4>
            <span>Level {node.level} • {new Date(node.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="tree-gain">Gain: ₹{currentGain}</div>
      </div>
      
      {node.children && node.children.length > 0 && (
        <div className="tree-node-children">
          {node.children.map((child, index) => {
            // Mock gain calculation based on level
            const nextGain = Math.max(10 - child.level, 1);
            return (
              <TreeNode 
                key={child._id} 
                node={child} 
                isLastChild={index === node.children.length - 1}
                currentGain={nextGain}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function TeamsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const treeData = data?.tree || [];
  
  // Create summary cards up to 10 dynamically, but we'll only show levels that are populated
  const populatedLevels = [];
  for (let i = 1; i <= 10; i++) {
    const count = data?.summary[`level${i}Count`];
    if (count !== undefined) {
      populatedLevels.push({ level: i, count });
    }
  }

  // Calculate total network earning in UI directly for wow factor based on our mock logic
  // Recurse over tree
  const calculateTotalMockGain = (nodes) => {
    let total = 0;
    const recurse = (list) => {
      for (const n of list) {
        total += Math.max(10 - n.level, 1);
        if (n.children) recurse(n.children);
      }
    };
    recurse(nodes);
    return total;
  };

  const totalGain = calculateTotalMockGain(treeData);

  return (
    <div className="teams-container">
      <div className="teams-header">
        <h1 className="gradient-text">My Network Tree</h1>
        <p>Monitor your 10-level recruitment tree and referral gains</p>
      </div>

      <div className="glass-card table-section" style={{ padding: '32px', marginBottom: '40px' }}>
        <h3 style={{ marginBottom: '20px' }}>Network Performance</h3>
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          <div className="mini-stat">
            <span className="label">Total Members</span>
            <span className="value gradient-text" style={{ fontSize: '2rem' }}>{data?.summary.totalItems || 0}</span>
          </div>
          <div className="mini-stat">
            <span className="label">Total Estimated Gain</span>
            <span className="value" style={{ fontSize: '2rem', color: '#00ff88' }}>₹{totalGain}</span>
          </div>
        </div>
      </div>

      <div className="tree-container">
        <div className="tree-root">
          <h3 style={{ marginBottom: '24px', color: 'var(--primary-green)' }}>Referral Tree Layout</h3>
          {treeData.length > 0 ? (
            treeData.map((node, i) => (
              <TreeNode 
                key={node._id} 
                node={node} 
                isLastChild={i === treeData.length - 1} 
                currentGain={Math.max(10 - node.level, 1)} 
              />
            ))
          ) : (
            <div className="empty-state">
              No network tree found. Start recruiting to build your tree!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}