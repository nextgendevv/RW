import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  DollarSign, 
  Search, 
  Filter, 
  Download, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  Bank,
  ArrowLeft
} from '../components/Icons';
import api from '../api';
import './TransactionsPage.css';

export default function TransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    depositBalance: 0,
    mainBalance: 0,
    deposits: [],
    withdrawals: [],
    commissions: [],
    bankDetails: {}
  });

  // Filters & Search
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'deposits', 'withdrawals', 'commissions'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'approved', 'pending', 'rejected'

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get('/wallet/summary');
        setData(res.data);
      } catch (err) {
        console.error('Error fetching transaction summary:', err);
        setError('Failed to fetch transaction records. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Formats date nicely
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Compile all transaction types into a single chronologically sorted array
  const getAllTransactions = () => {
    const all = [
      ...data.deposits.map(d => ({
        _id: d._id,
        type: 'deposit',
        amount: d.amount,
        status: d.status,
        date: d.createdAt,
        reference: d.utrNumber || 'N/A',
        details: 'Deposit Request via UPI/Bank Transfer'
      })),
      ...data.withdrawals.map(w => ({
        _id: w._id,
        type: 'withdrawal',
        amount: w.amount,
        status: w.status,
        date: w.createdAt,
        reference: w.bankDetails?.accountNumber ? `A/C ..${w.bankDetails.accountNumber.slice(-4)}` : 'Bank Transfer',
        details: `Withdrawal to ${w.bankDetails?.bankName || 'Registered Bank'}`
      })),
      ...data.commissions.map(c => ({
        _id: c._id,
        type: 'commission',
        amount: c.amount,
        status: c.status || 'approved',
        date: c.createdAt,
        reference: c.fromUser ? `${c.fromUser.firstName} (${c.plan.replace('_', ' ')})` : 'System Referral',
        details: `10% Level ${c.level || 1} Network Commission`
      }))
    ];
    return all.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Filter lists based on tab, search term, and status filter
  const getFilteredTransactions = () => {
    let list = [];
    if (activeTab === 'all') {
      list = getAllTransactions();
    } else if (activeTab === 'deposits') {
      list = data.deposits.map(d => ({
        _id: d._id,
        type: 'deposit',
        amount: d.amount,
        status: d.status,
        date: d.createdAt,
        reference: d.utrNumber,
        details: 'Deposit Request via UPI/Bank Transfer'
      }));
    } else if (activeTab === 'withdrawals') {
      list = data.withdrawals.map(w => ({
        _id: w._id,
        type: 'withdrawal',
        amount: w.amount,
        status: w.status,
        date: w.createdAt,
        reference: w.bankDetails?.accountNumber ? `A/C ..${w.bankDetails.accountNumber.slice(-4)}` : 'Bank Transfer',
        details: `Withdrawal to ${w.bankDetails?.bankName || 'Registered Bank'}`,
        bankInfo: w.bankDetails
      }));
    } else if (activeTab === 'commissions') {
      list = data.commissions.map(c => ({
        _id: c._id,
        type: 'commission',
        amount: c.amount,
        status: c.status || 'approved',
        date: c.createdAt,
        reference: c.fromUser ? `${c.fromUser.firstName} (${c.plan.replace('_', ' ')})` : 'System Referral',
        details: `10% Network Commission`
      }));
    }

    // Apply Search Filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      list = list.filter(item => 
        item.reference?.toLowerCase().includes(term) ||
        item.details?.toLowerCase().includes(term) ||
        item.amount.toString().includes(term)
      );
    }

    // Apply Status Filter
    if (statusFilter !== 'all') {
      list = list.filter(item => item.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    return list;
  };

  const filteredItems = getFilteredTransactions();

  // Export filtered transactions to CSV
  const exportToCSV = () => {
    if (filteredItems.length === 0) return;
    
    const headers = ['ID', 'Date', 'Type', 'Amount (INR)', 'Status', 'Reference', 'Details'];
    const rows = filteredItems.map(item => [
      item._id,
      formatDate(item.date),
      item.type.toUpperCase(),
      item.amount,
      item.status.toUpperCase(),
      item.reference,
      item.details
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `richway_transactions_${activeTab}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;

  return (
    <div className="transactions-container-premium">
      {/* Header section */}
      <div className="transactions-header-banner">
        <div className="welcome-text">
          <div className="back-link-container">
            <Link to="/dashboard" className="back-to-dashboard">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
          </div>
          <h1 className="gradient-text">Wallet Ledger & History</h1>
          <p>Real-time audit records of your deposits, withdrawals, and network commission earnings.</p>
        </div>
        <div className="header-actions">
          <Link to="/profile" className="btn-primary-gold">Manage Funds</Link>
        </div>
      </div>

      {/* Balance Summary Row */}
      <div className="stats-row-premium">
        <div className="balance-card-premium gold-glow">
          <div className="card-top">
            <div className="icon-wrap">
              <Wallet size={20} className="gold-text" />
            </div>
            <span className="card-lbl">Deposit Wallet Balance</span>
          </div>
          <div className="card-amount">
            <span className="currency-symbol">₹</span>
            <span className="number">{data.depositBalance.toLocaleString('en-IN')}</span>
          </div>
          <p className="card-sub">Used for subscriptions & memberships</p>
        </div>

        <div className="balance-card-premium emerald-glow">
          <div className="card-top">
            <div className="icon-wrap emerald-bg">
              <DollarSign size={20} style={{ color: '#1DB954' }} />
            </div>
            <span className="card-lbl">Main Wallet Balance (Earnings)</span>
          </div>
          <div className="card-amount emerald-text">
            <span className="currency-symbol">₹</span>
            <span className="number">{data.mainBalance.toLocaleString('en-IN')}</span>
          </div>
          <p className="card-sub">Withdrawable commission & network profits</p>
        </div>

        <div className="balance-card-premium info-glow">
          <div className="card-top">
            <div className="icon-wrap info-bg">
              <Bank size={20} className="info-text" />
            </div>
            <span className="card-lbl">Settlement Bank Account</span>
          </div>
          {data.bankDetails?.bankName ? (
            <div className="bank-card-details">
              <div className="bank-name">{data.bankDetails.bankName}</div>
              <div className="bank-ac">A/C: {data.bankDetails.accountNumber}</div>
              <div className="bank-ifsc">IFSC: {data.bankDetails.ifscCode}</div>
            </div>
          ) : (
            <div className="bank-card-empty">
              <span>No active settlement bank account configured.</span>
              <Link to="/profile" className="link-action">Set Bank Details</Link>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Table Control Block */}
      <div className="ledger-card-premium glass-card">
        <div className="ledger-controls">
          {/* Navigation Tabs */}
          <div className="ledger-tabs">
            <button 
              className={`ledger-tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => { setActiveTab('all'); setStatusFilter('all'); }}
            >
              All Ledgers
            </button>
            <button 
              className={`ledger-tab ${activeTab === 'deposits' ? 'active' : ''}`}
              onClick={() => { setActiveTab('deposits'); setStatusFilter('all'); }}
            >
              Deposits
            </button>
            <button 
              className={`ledger-tab ${activeTab === 'withdrawals' ? 'active' : ''}`}
              onClick={() => { setActiveTab('withdrawals'); setStatusFilter('all'); }}
            >
              Withdrawals
            </button>
            <button 
              className={`ledger-tab ${activeTab === 'commissions' ? 'active' : ''}`}
              onClick={() => { setActiveTab('commissions'); setStatusFilter('all'); }}
            >
              Commissions
            </button>
          </div>

          {/* Export Action */}
          <button 
            className="btn-export-csv" 
            onClick={exportToCSV}
            disabled={filteredItems.length === 0}
          >
            <Download size={16} /> Export to CSV
          </button>
        </div>

        {/* Filter bar */}
        <div className="filter-search-bar">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon-fixed" />
            <input 
              type="text" 
              placeholder="Search reference, UTR, holder, plan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ledger-search-input"
            />
          </div>

          <div className="filter-dropdown-wrap">
            <Filter size={16} className="filter-icon" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="ledger-filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved / Active</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Transaction Ledger Table */}
        <div className="ledger-table-wrap">
          {filteredItems.length > 0 ? (
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Details</th>
                  <th>Reference Info</th>
                  <th>Status</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item._id} className="ledger-row">
                    <td className="col-date">
                      <div className="date-main">
                        <Calendar size={12} className="inline-icon" />
                        {formatDate(item.date)}
                      </div>
                    </td>
                    <td className="col-type">
                      <span className={`ledger-type-badge ${item.type}`}>
                        {item.type === 'deposit' && <ArrowDownCircle size={12} />}
                        {item.type === 'withdrawal' && <ArrowUpCircle size={12} />}
                        {item.type === 'commission' && <DollarSign size={12} />}
                        {item.type}
                      </span>
                    </td>
                    <td className="col-details">
                      <span className="details-txt">{item.details}</span>
                    </td>
                    <td className="col-ref">
                      <span className="ref-txt">{item.reference}</span>
                    </td>
                    <td className="col-status">
                      <span className={`status-badge-premium ${item.status || 'approved'}`}>
                        {item.status === 'approved' && <CheckCircle size={12} />}
                        {item.status === 'pending' && <Clock size={12} />}
                        {item.status === 'rejected' && <XCircle size={12} />}
                        {!item.status && <CheckCircle size={12} />}
                        {item.status || 'approved'}
                      </span>
                    </td>
                    <td className={`col-amount text-right ${item.type === 'withdrawal' ? 'negative' : 'positive'}`}>
                      {item.type === 'withdrawal' ? '-' : '+'}₹{item.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="ledger-empty-state">
              <Clock size={40} className="empty-state-icon" />
              <h3>No Transactions Found</h3>
              <p>We couldn't find any financial transactions matching your current filters.</p>
              <div className="empty-actions">
                <button 
                  className="btn-clear-filters" 
                  onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
