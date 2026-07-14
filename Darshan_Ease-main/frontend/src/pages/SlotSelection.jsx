import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTempleById, getSlots } from '../services/templeService';
import { MapPin, Clock, Users, ArrowRight, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const SlotSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [temple, setTemple] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calendar states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(''); // 'YYYY-MM-DD'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const templeData = await getTempleById(id);
        const slotsData = await getSlots(id);
        setTemple(templeData);
        setSlots(slotsData);

        // Pre-select the first date that has available slots
        if (slotsData.length > 0) {
          const firstAvailableSlot = slotsData.find(s => s.availableSeats > 0) || slotsData[0];
          const firstDateStr = new Date(firstAvailableSlot.date).toISOString().split('T')[0];
          setSelectedDateStr(firstDateStr);
          setCurrentDate(new Date(firstAvailableSlot.date));
        } else {
          setSelectedDateStr(new Date().toISOString().split('T')[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleBook = (slotId) => {
    navigate(`/booking/${slotId}`);
  };

  // Helper Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const getFirstDayIndex = (m, y) => new Date(y, m, 1).getDay();

  const daysCount = getDaysInMonth(month, year);
  const firstDayIndex = getFirstDayIndex(month, year);

  // Group slots by date string 'YYYY-MM-DD' for easy querying
  const slotsByDate = {};
  slots.forEach(slot => {
    const dateStr = new Date(slot.date).toISOString().split('T')[0];
    if (!slotsByDate[dateStr]) {
      slotsByDate[dateStr] = [];
    }
    slotsByDate[dateStr].push(slot);
  });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const selectDate = (dayNum) => {
    const d = new Date(year, month, dayNum + 1);
    setSelectedDateStr(d.toISOString().split('T')[0]);
  };

  // Render slots for selected date
  const selectedSlots = slotsByDate[selectedDateStr] || [];

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
        <p>Fetching available darshan slots...</p>
      </div>
    );
  }

  if (!temple) return <div className="container page-center"><p>Temple not found</p></div>;

  return (
    <div className="container page-section fade-in">
      <style>{`
        .booking-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          margin-top: 24px;
        }
        @media(min-width: 992px) {
          .booking-layout {
            grid-template-columns: 420px 1fr;
          }
        }
        .calendar-container {
          background: var(--bg-card, #ffffff);
          border: 1px solid var(--border, #f0f0f0);
          border-radius: var(--radius, 12px);
          padding: 24px;
          box-shadow: var(--shadow-sm);
        }
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .calendar-month-title {
          font-weight: 700;
          font-size: 1.15rem;
          color: var(--text-dark);
        }
        .calendar-nav-btn {
          background: none;
          border: 1px solid var(--border);
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-mid);
          transition: all 0.2s;
        }
        .calendar-nav-btn:hover {
          background: var(--border);
          color: var(--primary);
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          text-align: center;
        }
        .weekday-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-light);
          padding-bottom: 8px;
        }
        .calendar-day {
          position: relative;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          user-select: none;
          color: var(--text-dark);
          border: 1px solid transparent;
        }
        .calendar-day:hover:not(.empty-day) {
          background: var(--border);
        }
        .calendar-day.empty-day {
          cursor: default;
        }
        .calendar-day.has-slots {
          font-weight: 700;
        }
        .calendar-day.has-slots::after {
          content: '';
          position: absolute;
          bottom: 4px;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--primary, #f59e0b);
        }
        .calendar-day.selected {
          background: var(--primary) !important;
          color: #ffffff !important;
        }
        .calendar-day.selected::after {
          background: #ffffff !important;
        }
        .slots-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .slots-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid var(--border);
          padding-bottom: 12px;
          margin-bottom: 12px;
        }
        .slots-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-dark);
        }
        .slots-date-indicator {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-light);
        }
        .temple-banner-card {
          border-radius: var(--radius, 12px);
          overflow: hidden;
          background: var(--bg-card);
          border: 1px solid var(--border);
          margin-bottom: 32px;
          box-shadow: var(--shadow-sm);
        }
        .temple-banner-img {
          width: 100%;
          height: 250px;
          object-fit: cover;
        }
        @media(min-width: 768px) {
          .temple-banner-img {
            height: 300px;
          }
        }
      `}</style>

      {/* Temple Profile Banner Card */}
      <div className="temple-banner-card fade-in">
        <img 
          src={temple.image || 'https://images.unsplash.com/photo-1548013146-72479768bbaa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80'} 
          alt={temple.templeName}
          className="temple-banner-img"
        />
        <div style={{ padding: '30px' }}>
          <span className="badge" style={{ marginBottom: '12px' }}>Divine Sanctuary</span>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '12px', color: 'var(--text-dark)' }}>{temple.templeName}</h1>
          <p className="temple-location" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: '600' }}>
            <MapPin size={18} /> {temple.location}
          </p>
          <p style={{ color: 'var(--text-mid)', lineHeight: '1.7', marginBottom: '24px', fontSize: '1.05rem' }}>{temple.description}</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--border)', padding: '8px 16px', borderRadius: '40px', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-mid)' }}>
            <Clock size={16} /> 
            <span>Operating Hours: {temple.darshanStartTime} - {temple.darshanEndTime}</span>
          </div>
        </div>
      </div>

      <div className="booking-layout">
        {/* Left Side: Premium Calendar Component */}
        <div className="calendar-container fade-in">
          <div className="calendar-header">
            <h4 className="calendar-month-title">
              {monthNames[month]} {year}
            </h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handlePrevMonth} className="calendar-nav-btn" aria-label="Previous Month">
                <ChevronLeft size={16} />
              </button>
              <button onClick={handleNextMonth} className="calendar-nav-btn" aria-label="Next Month">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="calendar-grid">
            {/* Weekdays */}
            {daysOfWeek.map(day => (
              <div key={day} className="weekday-label">{day}</div>
            ))}

            {/* Empty days before 1st of month */}
            {[...Array(firstDayIndex)].map((_, idx) => (
              <div key={`empty-${idx}`} className="calendar-day empty-day" />
            ))}

            {/* Days in Month */}
            {[...Array(daysCount)].map((_, idx) => {
              const dayNum = idx + 1;
              const dateObj = new Date(year, month, dayNum);
              // Format date string to match keys
              const tempStr = dateObj.toISOString().split('T')[0];
              const isSelected = tempStr === selectedDateStr;
              const daySlots = slotsByDate[tempStr] || [];
              const hasSlots = daySlots.some(s => s.availableSeats > 0);

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => selectDate(dayNum)}
                  className={`calendar-day ${hasSlots ? 'has-slots' : ''} ${isSelected ? 'selected' : ''}`}
                >
                  {dayNum}
                </div>
              );
            })}
          </div>
          
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-mid)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
              <span>Slots Available</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-mid)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--border)' }} />
              <span>No Slots</span>
            </div>
          </div>
        </div>

        {/* Right Side: Available Slots for Selected Date */}
        <div className="slots-section fade-in">
          <div className="slots-header">
            <h3 className="slots-title">Select Entry Time</h3>
            <span className="slots-date-indicator">
              {new Date(selectedDateStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </div>

          {selectedSlots.length === 0 ? (
            <div className="card empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <CalendarIcon size={40} style={{ margin: '0 auto 16px', color: 'var(--text-light)', opacity: 0.6 }} />
              <h4 style={{ marginBottom: '8px', color: 'var(--text-dark)' }}>No Slots Scheduled</h4>
              <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
                There are no darshan entry timings scheduled for this date. Please select another date marked with a dot indicator.
              </p>
            </div>
          ) : (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {selectedSlots.map(slot => (
                <div key={slot._id} className="card slot-card fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="slot-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px' }}>
                    <span className="slot-price" style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>₹{slot.price}</span>
                    <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--primary)' }}>Priority Pass</span>
                  </div>
                  
                  <div className="slot-meta" style={{ flex: 1, marginBottom: '24px' }}>
                    <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--text-dark)', fontWeight: '600' }}>
                      <Clock size={18} />
                      <span>{slot.startTime} - {slot.endTime}</span>
                    </div>
                    <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: slot.availableSeats > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: '600', fontSize: '0.9rem' }}>
                      <Users size={18} />
                      <span>{slot.availableSeats > 0 ? `${slot.availableSeats} passes left` : 'Housefull'}</span>
                    </div>
                  </div>

                  <button 
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: 'auto' }}
                    disabled={slot.availableSeats === 0}
                    onClick={() => handleBook(slot._id)}
                  >
                    {slot.availableSeats > 0 ? (
                      <>Select Slot <ArrowRight size={16} /></>
                    ) : 'Housefull'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlotSelection;
