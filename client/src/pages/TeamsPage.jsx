import { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Network, 
  Users, 
  Percent,
  Sprout
} from '../components/Icons';
import api from '../api';

const TreeNode = ({ node, isLastChild, currentGain }) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={`tree-node ${isLastChild ? 'last-child' : ''} ${hasChildren ? 'has-children' : ''}`}>
      <div className="tree-content-wrapper">
        <div className="tree-content" onClick={() => setIsOpen(!isOpen)}>
          <div className="tree-user-info">
            <div className="tree-avatar-wrapper">
              <div className="tree-user-avatar">{node.firstName[0]}</div>
              {hasChildren && (
                <div className={`expand-indicator ${isOpen ? 'open' : ''}`}>
                  {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </div>
              )}
            </div>
            <div className="tree-user-details">
              <h4>{node.firstName} {node.lastName}</h4>
              <div className="tree-meta">
                <span className="level-tag">Level {node.level}</span>
                <span className="date-tag">{new Date(node.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="tree-earning-tag">
            <span className="label">Commission</span>
            <span className="value">10%</span>
          </div>
        </div>
      </div>
      
      {hasChildren && isOpen && (
        <div className="tree-node-children">
          {node.children.map((child, index) => (
            <TreeNode 
              key={child._id} 
              node={child} 
              isLastChild={index === node.children.length - 1}
              currentGain="10%"
            />
          ))}
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
  
  return (
    <div className="teams-container">
      <div className="teams-header-premium">
        <div className="header-main">
          <h1 className="gradient-text">Network Growth Tree</h1>
          <p>Visualize your 10-level hierarchy and tracking commissions</p>
        </div>
        <div className="header-stats">
          <div className="stat-pill">
            <Users size={16} className="text-primary" />
            <span className="label">Total Members</span>
            <span className="value">{data?.summary.totalItems || 0}</span>
          </div>
          <div className="stat-pill">
            <Percent size={16} className="text-primary" />
            <span className="label">Share Rate</span>
            <span className="value">10%</span>
          </div>
        </div>
      </div>

      <div className="glass-card tree-explorer-card">
        <div className="explorer-header" style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <Network size={24} className="text-primary" />
          <div>
            <h3 style={{margin: 0}}>Interactive Tree Explorer</h3>
            <p style={{margin: 0}}>Click on members to expand or collapse their branches</p>
          </div>
        </div>
        
        <div className="tree-viewport">
          <div className="tree-root-container">
            {treeData.length > 0 ? (
              treeData.map((node, i) => (
                <TreeNode 
                  key={node._id} 
                  node={node} 
                  isLastChild={i === treeData.length - 1} 
                  currentGain="10%" 
                />
              ))
            ) : (
              <div className="tree-empty-state">
                <div className="empty-icon">
                  <Sprout size={64} className="text-dim" />
                </div>
                <h4>Your tree is just a seed!</h4>
                <p>Start referring friends to grow your network and earn commissions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}