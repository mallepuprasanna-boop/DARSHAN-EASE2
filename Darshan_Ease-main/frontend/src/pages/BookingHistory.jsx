import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyBookings } from '../services/bookingService';
import { Calendar, Clock, MapPin, Download } from 'lucide-react';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await getMyBookings();
        setBookings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
        <p>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="container page-section">
      <h1 className="page-title">My Booking History</h1>
      {bookings.length === 0 ? (
        <div className="card empty-state">
          <p>You haven't made any bookings yet.</p>
        </div>
      ) : (
        <div className="history-list">
          {bookings.map(booking => (
            <div key={booking._id} className="card history-card fade-in">
              <div className="history-info">
                <div className="history-header">
                  <h3>{booking.slotId?.templeId?.templeName}</h3>
                  <span className={`status-badge status-${booking.status?.toLowerCase()}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="history-meta">
                  <span className="meta-item">
                    <MapPin size={14} /> {booking.slotId?.templeId?.location}
                  </span>
                  <span className="meta-item">
                    <Calendar size={14} /> {new Date(booking.slotId?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span className="meta-item">
                    <Clock size={14} /> {booking.slotId?.startTime} - {booking.slotId?.endTime}
                  </span>
                </div>
              </div>
              <div className="history-actions">
                <span className="history-amount">₹{booking.totalAmount}</span>
                {booking.status === 'Confirmed' && (
                  <button
                    className="btn btn-outline"
                    onClick={() => navigate(`/ticket/${booking._id}`)}
                  >
                    <Download size={16} /> View Ticket
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
