import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Clock, Info, ArrowRight } from 'lucide-react';

const Booking = () => {
  const { slotId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  
  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }

    const fetchSlot = async () => {
      try {
        const { data } = await API.get(`/slots/${slotId}`);
        setSlot(data);
      } catch (err) {
        setError('Failed to fetch slot details');
      } finally {
        setLoading(false);
      }
    };
    fetchSlot();
  }, [slotId, userInfo, navigate]);

  const handleProceedToPayment = () => {
    navigate(`/payment/${slotId}`);
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
        <p>Loading booking details...</p>
      </div>
    );
  }

  if (error) return <div className="container page-center"><p className="error-text">{error}</p></div>;
  if (!slot) return <div className="container page-center"><p>Slot not found</p></div>;

  return (
    <div className="container page-center" style={{ maxWidth: '600px' }}>
      <h1 className="page-title">Confirm Booking</h1>
      <div className="card booking-card fade-in">
        <div className="booking-temple-info">
          <h3>{slot.templeId?.templeName}</h3>
          <div className="booking-meta">
            <div className="meta-item">
              <Calendar size={18} />
              <span>{new Date(slot.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="meta-item">
              <Clock size={18} />
              <span>{slot.startTime} - {slot.endTime}</span>
            </div>
          </div>
        </div>

        <div className="booking-pricing">
          <div className="price-row">
            <span>Darshan Fee</span>
            <span>₹{slot.price}</span>
          </div>
          <div className="price-row">
            <span>Booking Charges</span>
            <span className="text-success">FREE</span>
          </div>
          <div className="price-divider" />
          <div className="price-row price-total">
            <span>Total Payable</span>
            <span>₹{slot.price}</span>
          </div>
        </div>

        <div className="booking-notice">
          <Info size={20} />
          <p>
            Please arrive at the temple gate at least 15 minutes before your slot time with a valid ID proof and your digital ticket.
          </p>
        </div>

        <button 
          className="btn btn-primary booking-cta"
          onClick={handleProceedToPayment}
        >
          Proceed to Payment <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Booking;
