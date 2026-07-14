import React, { useState, useEffect, useContext } from 'react';
import { getTemples } from '../services/templeService';
import API from '../services/api';
import { ToastContext } from '../context/ToastContext';
import { Plus, Trash, Edit, MapPin, Clock, Users, Calendar, Shield, CreditCard, ChevronRight, UserCheck } from 'lucide-react';

const AdminDashboard = () => {
  const { showToast } = useContext(ToastContext);

  const [activeTab, setActiveTab] = useState('temples');
  
  // Data lists
  const [temples, setTemples] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);

  // Loaders
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    templeName: '',
    location: '',
    darshanStartTime: '06:00',
    darshanEndTime: '20:00',
    description: '',
    image: '',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const templeData = await getTemples();
      setTemples(templeData);

      const { data: bookingsData } = await API.get('/bookings/admin/all');
      setBookings(bookingsData);

      const { data: usersData } = await API.get('/users');
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      showToast('Some admin dashboard data failed to load.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/temples', formData);
      setShowAddForm(false);
      setFormData({
        templeName: '',
        location: '',
        darshanStartTime: '06:00',
        darshanEndTime: '20:00',
        description: '',
        image: '',
        latitude: '',
        longitude: ''
      });
      showToast('Temple profile created successfully.', 'success');
      
      // Reload temples
      const templeData = await getTemples();
      setTemples(templeData);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create temple', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this temple? This will remove all associated slots.')) {
      try {
        await API.delete(`/temples/${id}`);
        showToast('Temple deleted successfully.', 'success');
        setTemples(temples.filter(t => t._id !== id));
      } catch (err) {
        showToast('Failed to delete temple', 'error');
      }
    }
  };

  // User Actions
  const handleRoleChange = async (userId, newRole) => {
    try {
      await API.put(`/users/${userId}/role`, { role: newRole });
      showToast('User role updated successfully.', 'success');
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change role.', 'error');
    }
  };

  const handleUserDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await API.delete(`/users/${userId}`);
        showToast('User removed successfully.', 'success');
        setUsers(users.filter(u => u._id !== userId));
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to remove user.', 'error');
      }
    }
  };

  // Booking Actions
  const handleBookingStatusChange = async (bookingId, newStatus) => {
    try {
      await API.put(`/bookings/${bookingId}/status`, { status: newStatus });
      showToast(`Booking marked as ${newStatus} successfully.`, 'success');
      
      // Reload bookings and users
      const { data: bookingsData } = await API.get('/bookings/admin/all');
      setBookings(bookingsData);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update booking status.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container page-section">
      <style>{`
        .admin-tab-bar {
          display: flex;
          border-bottom: 2px solid var(--border);
          margin-bottom: 30px;
          gap: 20px;
        }
        .admin-tab {
          padding: 12px 6px;
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--text-light);
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
        }
        .admin-tab.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
        }
        .admin-stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }
        .stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: var(--shadow-sm);
        }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(245, 158, 11, 0.1);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-num {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text-dark);
        }
        .stat-label {
          font-size: 0.85rem;
          color: var(--text-light);
        }
        .badge-role {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 20px;
        }
        .role-Admin { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .role-Organizer { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
        .role-User { background: rgba(16, 185, 129, 0.1); color: #10b981; }

        .badge-status {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 20px;
        }
        .status-Confirmed { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .status-Pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .status-Cancelled { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

        .role-select {
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-dark);
          font-family: inherit;
          font-size: 0.85rem;
          font-weight: 600;
          outline: none;
        }
      `}</style>

      <div className="dashboard-header fade-in">
        <h1 className="page-title">Management Dashboard</h1>
        {activeTab === 'temples' && (
          <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
            {showAddForm ? 'Cancel' : (
              <><Plus size={18} /> Add New Temple</>
            )}
          </button>
        )}
      </div>

      {/* Admin Quick Metrics Panel */}
      <div className="admin-stat-grid fade-in">
        <div className="stat-card">
          <div className="stat-icon"><MapPin size={22} /></div>
          <div>
            <div className="stat-num">{temples.length}</div>
            <div className="stat-label">Active Shrines</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Calendar size={22} /></div>
          <div>
            <div className="stat-num">{bookings.length}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Users size={22} /></div>
          <div>
            <div className="stat-num">{users.length}</div>
            <div className="stat-label">Registered Devotees</div>
          </div>
        </div>
      </div>

      {/* Admin Tab Switching Bar */}
      <div className="admin-tab-bar fade-in">
        <div 
          onClick={() => setActiveTab('temples')} 
          className={`admin-tab ${activeTab === 'temples' ? 'active' : ''}`}
        >
          Shrines Directory
        </div>
        <div 
          onClick={() => setActiveTab('bookings')} 
          className={`admin-tab ${activeTab === 'bookings' ? 'active' : ''}`}
        >
          Darshan Bookings
        </div>
        <div 
          onClick={() => setActiveTab('users')} 
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
        >
          Users Directory
        </div>
      </div>

      {/* TABS CONTENT */}
      
      {/* 1. TEMPLES TAB */}
      {activeTab === 'temples' && (
        <div className="fade-in">
          {showAddForm && (
            <div className="card fade-in" style={{ padding: '32px', marginBottom: '40px' }}>
              <h3 style={{ marginBottom: '20px' }}>Register New Temple</h3>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="form-group">
                    <label>Temple Name</label>
                    <input name="templeName" value={formData.templeName} onChange={handleChange} required placeholder="e.g. Somnath Temple" />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input name="location" value={formData.location} onChange={handleChange} required placeholder="e.g. Veraval, Gujarat" />
                  </div>
                  <div className="form-group">
                    <label>Darshan Start Time</label>
                    <input type="time" name="darshanStartTime" value={formData.darshanStartTime} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Darshan End Time</label>
                    <input type="time" name="darshanEndTime" value={formData.darshanEndTime} onChange={handleChange} required />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Image URL</label>
                    <input name="image" value={formData.image} onChange={handleChange} placeholder="https://example.com/image.jpg" />
                  </div>
                  <div className="form-group">
                    <label>Latitude (optional)</label>
                    <input type="number" step="any" name="latitude" value={formData.latitude} onChange={handleChange} placeholder="e.g. 20.8880" />
                  </div>
                  <div className="form-group">
                    <label>Longitude (optional)</label>
                    <input type="number" step="any" name="longitude" value={formData.longitude} onChange={handleChange} placeholder="e.g. 70.4012" />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Brief history or significance..."></textarea>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Create Temple Profile</button>
              </form>
            </div>
          )}

          <div className="dashboard-content">
            <h3 style={{ marginBottom: '20px' }}>Temple Directory</h3>
            {temples.length === 0 ? (
              <div className="card empty-state"><p>No temples registered yet.</p></div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Temple Details</th>
                      <th>Location</th>
                      <th>Darshan Hours</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {temples.map(temple => (
                      <tr key={temple._id}>
                        <td>
                          <div style={{ fontWeight: '600', color: 'var(--text-dark)' }}>{temple.templeName}</div>
                        </td>
                        <td>
                          <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                            <MapPin size={14} /> {temple.location}
                          </div>
                        </td>
                        <td>
                          <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                            <Clock size={14} /> {temple.darshanStartTime} - {temple.darshanEndTime}
                          </div>
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button onClick={() => handleDelete(temple._id)} className="icon-btn delete" title="Delete Temple">
                              <Trash size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        <div className="fade-in">
          <div className="dashboard-content">
            <h3 style={{ marginBottom: '20px' }}>Devotee Bookings List</h3>
            {bookings.length === 0 ? (
              <div className="card empty-state"><p>No bookings found in the system.</p></div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Devotee Details</th>
                      <th>Temple Shrinename</th>
                      <th>Timings & Fees</th>
                      <th>Booking Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => {
                      const user = booking.userId || { name: 'Unknown User', email: 'N/A', phone: 'N/A' };
                      const slot = booking.slotId || { startTime: 'N/A', endTime: 'N/A', date: new Date() };
                      const templeName = slot.templeId?.templeName || 'Unknown Temple';
                      const formattedDate = new Date(slot.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

                      return (
                        <tr key={booking._id}>
                          <td>
                            <div style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{user.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{user.email}</div>
                          </td>
                          <td>
                            <div style={{ fontWeight: '600' }}>{templeName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} /> {formattedDate}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} /> {slot.startTime} - {slot.endTime}
                            </div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                              ₹{booking.totalAmount}
                            </div>
                          </td>
                          <td>
                            <span className={`badge-status status-${booking.status}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td>
                            <div className="actions-cell" style={{ gap: '8px' }}>
                              {booking.status === 'Cancelled' ? (
                                <button 
                                  onClick={() => handleBookingStatusChange(booking._id, 'Confirmed')}
                                  className="btn btn-outline" 
                                  style={{ padding: '4px 10px', fontSize: '0.75rem', height: '28px', color: 'var(--success)', borderColor: 'var(--success)' }}
                                >
                                  Re-confirm
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleBookingStatusChange(booking._id, 'Cancelled')}
                                  className="btn btn-danger" 
                                  style={{ padding: '4px 10px', fontSize: '0.75rem', height: '28px', background: '#fee2e2', color: '#ef4444', border: 'none' }}
                                >
                                  Cancel Booking
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. USERS TAB */}
      {activeTab === 'users' && (
        <div className="fade-in">
          <div className="dashboard-content">
            <h3 style={{ marginBottom: '20px' }}>User Accounts Management</h3>
            {users.length === 0 ? (
              <div className="card empty-state"><p>No users found.</p></div>
            ) : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Account Name</th>
                      <th>Email & Phone</th>
                      <th>Access Level (Role)</th>
                      <th>Manage Role</th>
                      <th>Danger Zone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>
                          <div style={{ fontWeight: '700', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {user.name} 
                            {user.role === 'Admin' && <Shield size={14} color="#ef4444" title="Platform Administrator" />}
                          </div>
                        </td>
                        <td>
                          <div>{user.email}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{user.phone}</div>
                        </td>
                        <td>
                          <span className={`badge-role role-${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <select 
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className="role-select"
                          >
                            <option value="User">User</option>
                            <option value="Organizer">Organizer</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <button 
                            onClick={() => handleUserDelete(user._id)}
                            className="icon-btn delete"
                            title="Delete User Account"
                          >
                            <Trash size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
