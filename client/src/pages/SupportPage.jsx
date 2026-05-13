import { useState, useEffect } from 'react';
import api from '../api';
import { 
  HelpCircle, 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus
} from '../components/Icons';

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', category: 'other', message: '', priority: 'medium' });
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/support/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error('Failed to fetch tickets', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/support/tickets', newTicket);
      setTickets([res.data, ...tickets]);
      setShowNewTicket(false);
      setNewTicket({ subject: '', category: 'other', message: '', priority: 'medium' });
    } catch (err) {
      alert('Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/support/tickets/${selectedTicket._id}/reply`, { message: reply });
      setSelectedTicket(res.data);
      setTickets(tickets.map(t => t._id === res.data._id ? res.data : t));
      setReply('');
    } catch (err) {
      alert('Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <div className="support-container" style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
      <div className="support-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Customer Support</h1>
          <p className="text-dim">Our team is here to help you 24/7 with any issues or questions.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowNewTicket(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> New Support Ticket
        </button>
      </div>

      <div className="support-content-grid" style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '20px' }}>
        {/* Tickets List */}
        <div className="glass-card tickets-sidebar" style={{ height: 'calc(100vh - 250px)', overflowY: 'auto', padding: '15px' }}>
          <h3 style={{ marginBottom: '15px', fontSize: '1.1rem' }}>Your Tickets</h3>
          {tickets.length === 0 && <p className="text-dim" style={{ textAlign: 'center', marginTop: '50px' }}>No tickets yet.</p>}
          {tickets.map(t => (
            <div 
              key={t._id} 
              onClick={() => setSelectedTicket(t)}
              className={`ticket-item ${selectedTicket?._id === t._id ? 'active' : ''}`}
              style={{
                padding: '15px',
                borderRadius: '12px',
                background: selectedTicket?._id === t._id ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                cursor: 'pointer',
                marginBottom: '10px',
                transition: 'all 0.2s',
                border: selectedTicket?._id === t._id ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span className={`status-tag ${t.status}`} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: t.status === 'open' ? '#1DB954' : t.status === 'closed' ? '#ef4444' : '#f59e0b', color: '#fff' }}>
                  {t.status.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{new Date(t.updatedAt).toLocaleDateString()}</span>
              </div>
              <div style={{ fontWeight: '600', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '5px' }}>Cat: {t.category}</div>
            </div>
          ))}
        </div>

        {/* Ticket Detail & Chat */}
        <div className="glass-card ticket-chat-view" style={{ height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column' }}>
          {selectedTicket ? (
            <>
              <div className="chat-header" style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <h2 style={{ fontSize: '1.4rem' }}>{selectedTicket.subject}</h2>
                   <div style={{ display: 'flex', gap: '10px' }}>
                      <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(255,255,255,0.05)' }}>{selectedTicket.category}</span>
                      <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '20px', background: selectedTicket.priority === 'high' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)', color: selectedTicket.priority === 'high' ? '#ef4444' : 'inherit' }}>{selectedTicket.priority} priority</span>
                   </div>
                </div>
              </div>
              
              <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="msg-original" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', borderLeft: '4px solid var(--text-primary)' }}>
                  <div style={{ fontWeight: '600', marginBottom: '5px', fontSize: '0.9rem' }}>Issue Description:</div>
                  <p style={{ margin: 0 }}>{selectedTicket.message}</p>
                </div>

                {selectedTicket.replies.map((rep, idx) => (
                  <div 
                    key={idx} 
                    className={`message-bubble ${rep.sender}`}
                    style={{
                      maxWidth: '80%',
                      padding: '12px 18px',
                      borderRadius: '18px',
                      alignSelf: rep.sender === 'user' ? 'flex-end' : 'flex-start',
                      background: rep.sender === 'user' ? 'var(--text-primary)' : 'rgba(255,255,255,0.1)',
                      color: rep.sender === 'user' ? '#000' : '#fff',
                      position: 'relative'
                    }}
                  >
                    <div style={{ fontSize: '0.85rem' }}>{rep.message}</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
                      {rep.sender === 'admin' ? 'Support Team' : 'You'} • {new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>

              {selectedTicket.status !== 'closed' ? (
                <form onSubmit={handleReply} style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Type your message here..." 
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: '25px', color: '#fff' }}
                  />
                  <button type="submit" className="btn-primary" disabled={submitting || !reply.trim()} style={{ borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                    <Send size={20} />
                  </button>
                </form>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', fontWeight: '600' }}>
                   This ticket has been closed. If you still need help, please open a new ticket.
                </div>
              )}
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
               <MessageSquare size={80} style={{ marginBottom: '20px' }} />
               <h3>Select a ticket to view conversation</h3>
               <p>Or open a new one if you need assistance</p>
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="edit-modal-overlay">
          <div className="glass-card edit-modal-content" style={{ maxWidth: '600px' }}>
            <h2 className="modal-title">Create Support Ticket</h2>
            <form onSubmit={handleCreateTicket} className="edit-form-premium">
               <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Subject</label>
                    <input 
                      required 
                      value={newTicket.subject} 
                      onChange={e => setNewTicket({...newTicket, subject: e.target.value})} 
                      placeholder="e.g. Deposit not reflecting"
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={newTicket.category} onChange={e => setNewTicket({...newTicket, category: e.target.value})} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}>
                       <option value="deposit">Deposit</option>
                       <option value="withdrawal">Withdrawal</option>
                       <option value="subscription">Subscription</option>
                       <option value="technical">Technical</option>
                       <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select value={newTicket.priority} onChange={e => setNewTicket({...newTicket, priority: e.target.value})} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px' }}>
                       <option value="low">Low</option>
                       <option value="medium">Medium</option>
                       <option value="high">High</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Message / Description</label>
                    <textarea 
                      required 
                      rows="5"
                      value={newTicket.message} 
                      onChange={e => setNewTicket({...newTicket, message: e.target.value})} 
                      placeholder="Describe your issue in detail..."
                      style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', resize: 'none' }}
                    />
                  </div>
               </div>
               <div className="modal-actions" style={{ marginTop: '20px' }}>
                  <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Ticket'}</button>
                  <button type="button" className="btn-ghost" onClick={() => setShowNewTicket(false)}>Cancel</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
