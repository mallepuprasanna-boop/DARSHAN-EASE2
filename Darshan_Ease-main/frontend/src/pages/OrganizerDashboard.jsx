import React, { useState, useEffect } from 'react';
import { getTemples, getSlots } from '../services/templeService';
import API from '../services/api';
import { Plus, Trash, Clock, Calendar, Users, Filter } from 'lucide-react';

const OrganizerDashboard = () => {
  const [temples, setTemples] = useState([]);
  const [selectedTemple, setSelectedTemple] = useState('');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '09:00',
    availableSeats: 50,
    price: 100
  });

  useEffect(() => {
    fetchTemples();
  }, []);

  useEffect(() => {
    if (selectedTemple) {
      fetchSlots();
    }
  }, [selectedTemple]);

  const fetchTemples = async () => {
    try {
      const data = await getTemples();
      setTemples(data);
      if (data.length > 0) setSelectedTemple(data[0]._id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    try {
      const data = await getSlots(selectedTemple);
      setSlots(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/slots', { ...formData, templeId: selectedTemple });
      setShowAddForm(false);
      fetchSlots();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create slot');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this darshan slot?')) {
      try {
        await API.delete(`/slots/${id}`);
        fetchSlots();
      } catch (err) {
        alert('Failed to delete slot');
      }
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
        <p>Loading Organizer Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container page-section">
      <h1 className="page-title">Organizer Dashboard</h1>
      
      <div className="card fade-in" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-mid)', fontWeight: '600' }}>
            <Filter size={18} /> Select Temple:
          </div>
          <select 
            className="form-control"
            value={selectedTemple} 
            onChange={(e) => setSelectedTemple(e.target.value)}
            style={{ 
              padding: '10px 16px', 
              borderRadius: 'var(--radius-sm)', 
              border: '1.5px solid var(--border)',
              flex: 1,
              minWidth: '200px'
            }}
          >
            {temples.map(t => (
              <option key={t._id} value={t._id}>{t.templeName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="dashboard-header fade-in">
        <h3>Manage Darshan Slots</h3>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
          {showAddForm ? 'Cancel' : (
            <><Plus size={18} /> Create New Slot</>
          )}
        </button>
      </div>

      {showAddForm && (
        <div className="card fade-in" style={{ padding: '32px', marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '20px' }}>Configure Darshan Slot</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="form-group">
                <label>Slot Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Start Time</label>
                <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Seat Capacity</label>
                <input type="number" name="availableSeats" value={formData.availableSeats} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Ticket Price (₹)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Generate Slot</button>
          </form>
        </div>
      )}

      <div className="grid fade-in">
        {slots.length === 0 ? (
          <div className="card empty-state" style={{ gridColumn: '1 / -1' }}>
            <p>No slots found for this temple. Click "Create New Slot" to get started.</p>
          </div>
        ) : (
          slots.map(slot => (
            <div key={slot._id} className="card slot-card">
              <div className="slot-header">
                <span className="slot-date">
                  {new Date(slot.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="slot-price">₹{slot.price}</span>
              </div>
              <div className="slot-meta" style={{ marginBottom: '20px' }}>
                <p className="meta-item" style={{ marginBottom: '8px' }}>
                  <Clock size={14} /> {slot.startTime} - {slot.endTime}
                </p>
                <p className="meta-item">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: slot.availableSeats > 0 ? 'var(--success)' : 'var(--danger)' }}>
                    <Users size={14} /> {slot.availableSeats} Seats Available
                  </span>
                </p>
              </div>
              <button 
                onClick={() => handleDelete(slot._id)} 
                className="btn btn-danger" 
                style={{ width: '100%' }}
              >
                <Trash size={16} /> Delete Slot
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;
