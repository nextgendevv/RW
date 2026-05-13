import { useState, useEffect } from 'react';
import api from '../../api';
import { 
  MessageSquare, 
  Send, 
  User, 
  Filter,
  CheckCircle,
  Clock,
  AlertCircle
} from '../../components/Icons';

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/admin/support/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to fetch admin tickets', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e, closeTicket = false) => {
    e.preventDefault();
    if (!reply.trim() && !closeTicket) return;
    setSubmitting(true);
    try {
      const status = closeTicket ? 'closed' : 'in-progress';
      const res = await api.post(`/admin/support/tickets/${selectedTicket._id}/reply`, { 
        message: reply || "Ticket closed by administrator.", 
        status 
      });
      setSelectedTicket(res.data);
      setTickets(tickets.map(t => t._id === res.data._id ? res.data : t));
      setReply('');
    } catch (err) {
      alert('Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(`/admin/support/tickets/${id}/status`, { status });
      setTickets(tickets.map(t => t._id === res.data._id ? res.data : t));
      if (selectedTicket?._id === id) setSelectedTicket(res.data);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filteredTickets = tickets.filter(t => filter === 'all' || t.status === filter);

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="gradient-text" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Support Ticket Management</h1>
        <p>Review and respond to user queries and technical issues</p>
      </div>

      <div className="support-filters" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
         {['all', 'open', 'in-progress', 'closed'].map(s => (
           <button 
             key={s} 
             onClick={() => setFilter(s)}
             className={`btn-filter ${filter === s ? 'active' : ''}`}
             style={{ 
               padding: '8px 16px', 
               borderRadius: '20px', 
               background: filter === s ? 'var(--text-primary)' : 'rgba(255,255,255,0.05)',
               color: filter === s ? '#000' : '#fff',
               border: 'none',
               cursor: 'pointer',
               fontSize: '0.85rem',
               textTransform: 'capitalize'
             }}
           >
             {s} ({tickets.filter(t => s === 'all' || t.status === s).length})
           </button>
         ))}
      </div>

      <div className="support-admin-grid" style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '25px' }}>
        {/* Tickets List */}
        <div className="glass-card tickets-list" style={{ height: 'calc(100vh - 280px)', overflowY: 'auto' }}>
           {filteredTickets.map(t => (
             <div 
               key={t._id} 
               onClick={() => setSelectedTicket(t)}
               className={`ticket-row ${selectedTicket?._id === t._id ? 'selected' : ''}`}
               style={{ 
                 padding: '20px', 
                 borderBottom: '1px solid rgba(255,255,255,0.05)', 
                 cursor: 'pointer',
                 background: selectedTicket?._id === t._id ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                 borderLeft: selectedTicket?._id === t._id ? '4px solid #3b82f6' : '4px solid transparent'
               }}
             >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>{t.user?.firstName?.[0]}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{t.user?.firstName} {t.user?.lastName}</div>
                   </div>
                   <span className={`status-dot ${t.status}`} style={{ width: '10px', height: '10px', borderRadius: '50%', background: t.status === 'open' ? '#1DB954' : t.status === 'closed' ? '#ef4444' : '#f59e0b' }} />
                </div>
                <div style={{ fontWeight: '700', marginBottom: '5px' }}>{t.subject}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                   <span>{t.category.toUpperCase()} • {t.priority.toUpperCase()}</span>
                   <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                </div>
             </div>
           ))}
        </div>

        {/* Conversation View */}
        <div className="glass-card ticket-chat" style={{ height: 'calc(100vh - 280px)', display: 'flex', flexDirection: 'column' }}>
           {selectedTicket ? (
             <>
                <div className="chat-head" style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between' }}>
                   <div>
                      <h2 style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{selectedTicket.subject}</h2>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>From: {selectedTicket.user?.email}</div>
                   </div>
                   <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <select 
                        value={selectedTicket.status} 
                        onChange={(e) => updateStatus(selectedTicket._id, e.target.value)}
                        style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', color: '#fff', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}
                      >
                         <option value="open">Open</option>
                         <option value="in-progress">In Progress</option>
                         <option value="closed">Closed</option>
                      </select>
                   </div>
                </div>

                <div className="chat-body" style={{ flex: 1, overflowY: 'auto', padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                   <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '15px' }}>
                      <div style={{ fontWeight: '700', marginBottom: '10px' }}>User Issue:</div>
                      <p style={{ margin: 0, lineHeight: 1.6 }}>{selectedTicket.message}</p>
                   </div>

                   {selectedTicket.replies.map((rep, idx) => (
                     <div 
                       key={idx} 
                       style={{ 
                         alignSelf: rep.sender === 'admin' ? 'flex-end' : 'flex-start',
                         maxWidth: '75%',
                         background: rep.sender === 'admin' ? '#3b82f6' : 'rgba(255,255,255,0.08)',
                         color: '#fff',
                         padding: '12px 18px',
                         borderRadius: '15px',
                         boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                       }}
                     >
                        <div style={{ fontSize: '0.95rem' }}>{rep.message}</div>
                        <div style={{ fontSize: '0.7rem', marginTop: '6px', opacity: 0.6, textAlign: 'right' }}>
                           {rep.sender === 'admin' ? 'You' : selectedTicket.user?.firstName} • {new Date(rep.createdAt).toLocaleString()}
                        </div>
                     </div>
                   ))}
                </div>

                <div className="chat-footer" style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                   <form onSubmit={handleReply} style={{ display: 'flex', gap: '15px' }}>
                      <textarea 
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Type your response to the user..."
                        style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '15px', borderRadius: '12px', color: '#fff', height: '80px', resize: 'none' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button type="submit" className="btn-primary" disabled={submitting || !reply.trim()} style={{ background: '#3b82f6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                           <Send size={18} /> Send
                        </button>
                        <button type="button" onClick={(e) => handleReply(e, true)} className="btn-logout-minimal" disabled={submitting} style={{ margin: 0, padding: '8px' }}>
                           Close Ticket
                        </button>
                      </div>
                   </form>
                </div>
             </>
           ) : (
             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                <MessageSquare size={100} />
                <h2>Select a ticket to respond</h2>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
