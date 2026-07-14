import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { CreditCard, Smartphone, Shield, CheckCircle, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';

const PaymentPage = () => {
  const { slotId } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);

  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState('');

  // Local payment simulator modal states
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simulatedMethod, setSimulatedMethod] = useState('card'); // 'card' or 'upi'
  const [simulatedStep, setSimulatedStep] = useState(1); // 1 = select/input, 2 = OTP, 3 = loading
  const [otpCode, setOtpCode] = useState('');
  const [cardData, setCardData] = useState({ number: '4312 9908 1234 5678', expiry: '12/28', cvv: '123' });
  const [upiId, setUpiId] = useState('user@okaxis');
  
  // Script status
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!userInfo) { navigate('/login'); return; }

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

    // Dynamically load Razorpay SDK
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => console.log('Razorpay SDK failed to load. Will use robust custom fallback.');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [slotId, userInfo, navigate]);

  const handlePayInitiate = async () => {
    setProcessing(true);
    setError('');

    try {
      // 1. Create Razorpay order on backend
      const { data } = await API.post('/bookings/razorpay-order', { slotId });

      if (data.isMock) {
        // If mock configuration is active, trigger our premium simulation gateway modal
        setProcessing(false);
        setSimulatedStep(1);
        setShowSimulateModal(true);
        // Save the mock details to be used on confirmation
        window.activeMockOrder = data;
      } else {
        // Run standard real Razorpay Checkout SDK
        if (!scriptLoaded) {
          throw new Error('Razorpay Gateway script not fully loaded yet. Please try again.');
        }

        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: 'INR',
          name: 'Darshan Ease',
          description: `Entry Pass to ${slot.templeId?.templeName}`,
          order_id: data.orderId,
          handler: async function (response) {
            setProcessing(true);
            try {
              const verifyRes = await API.post('/bookings/verify-payment', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                slotId: slot._id,
                totalAmount: slot.price,
              });

              setPaymentSuccess(true);
              showToast('Payment Successful! Ticket generated.', 'success');
              setTimeout(() => {
                navigate(`/ticket/${verifyRes.data.booking._id}`);
              }, 2000);
            } catch (err) {
              setError(err.response?.data?.message || 'Signature verification failed.');
              setProcessing(false);
            }
          },
          prefill: {
            name: userInfo.name,
            email: userInfo.email,
            contact: userInfo.phone,
          },
          theme: {
            color: '#f59e0b',
          },
          modal: {
            ondismiss: function () {
              setProcessing(false);
              showToast('Payment cancelled by user.', 'info');
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to start payment gateway.');
      setProcessing(false);
    }
  };

  const handleSimulatedSubmit = async () => {
    // Transition to loading inside mock panel
    setSimulatedStep(3);
    await new Promise(resolve => setTimeout(resolve, 1800));
    // Transition to OTP step if card was used
    if (simulatedMethod === 'card' && otpCode === '') {
      setSimulatedStep(2);
      return;
    }
    
    // Complete verification against backend
    try {
      const mockOrder = window.activeMockOrder;
      const verifyRes = await API.post('/bookings/verify-payment', {
        razorpay_order_id: mockOrder?.orderId || `mock_order_${slotId}`,
        razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 10)}`,
        razorpay_signature: 'mock_payment_signature_ok',
        slotId: slot._id,
        totalAmount: slot.price,
      });

      setShowSimulateModal(false);
      setPaymentSuccess(true);
      showToast('Payment Successful! Ticket generated.', 'success');
      setTimeout(() => {
        navigate(`/ticket/${verifyRes.data.booking._id}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Mock payment verification failed.');
      setShowSimulateModal(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner" />
        <p>Loading payment details...</p>
      </div>
    );
  }

  if (error && !slot) {
    return <div className="container page-center"><p className="error-text">{error}</p></div>;
  }

  if (paymentSuccess) {
    return (
      <div className="page-loader">
        <div className="payment-success-anim fade-in" style={{ textAlign: 'center' }}>
          <CheckCircle size={72} color="var(--success, #10b981)" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ fontWeight: 800, color: 'var(--text-dark)' }}>Payment Successful!</h2>
          <p style={{ color: 'var(--text-mid)' }}>Preparing your digital ticket pass...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container page-center" style={{ maxWidth: '540px', padding: '40px 20px' }}>
      <style>{`
        .payment-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 30px;
          box-shadow: var(--shadow-md);
        }
        .summary-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          border-bottom: 2px solid var(--border);
          padding-bottom: 16px;
        }
        .payment-summary-box {
          background: var(--border);
          border-radius: var(--radius-sm);
          padding: 20px;
          margin-bottom: 24px;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 0.95rem;
          color: var(--text-mid);
        }
        .summary-item:last-child {
          margin-bottom: 0;
        }
        .summary-item strong {
          color: var(--text-dark);
        }
        .pay-cta-btn {
          width: 100%;
          font-weight: 700;
          font-size: 1.1rem;
          padding: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        /* Gateway Mock Modal overlay */
        .gateway-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          backdrop-filter: blur(4px);
        }
        .gateway-modal {
          background: #ffffff;
          width: 100%;
          max-width: 440px;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          font-family: 'Inter', sans-serif;
          color: #2d3748;
          border: 1px solid #e2e8f0;
          animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .gateway-header {
          background: #0f172a;
          color: #ffffff;
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .gateway-logo {
          font-weight: 800;
          font-size: 1.2rem;
          color: #f59e0b;
          letter-spacing: 0.5px;
        }
        .gateway-amount {
          font-weight: 700;
          font-size: 1.1rem;
        }
        .gateway-content {
          padding: 24px;
        }
        .gateway-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 20px;
        }
        .gateway-tab {
          padding: 10px;
          text-align: center;
          font-weight: 600;
          font-size: 0.9rem;
          background: #f7fafc;
          border: 1.5px solid #edf2f7;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          color: #718096;
        }
        .gateway-tab.active {
          border-color: #3b82f6;
          background: #eff6ff;
          color: #2563eb;
        }
        .gateway-input-group {
          margin-bottom: 16px;
        }
        .gateway-input-group label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: #718096;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .gateway-input {
          width: 100%;
          padding: 10px 14px;
          border: 1.5px solid #cbd5e0;
          border-radius: 6px;
          font-size: 0.95rem;
          color: #2d3748;
          background: #ffffff;
          outline: none;
        }
        .gateway-input:focus {
          border-color: #3b82f6;
        }
        .gateway-submit-btn {
          width: 100%;
          background: #2563eb;
          color: #ffffff;
          border: none;
          padding: 12px;
          font-weight: 700;
          font-size: 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .gateway-submit-btn:hover {
          background: #1d4ed8;
        }
        .gateway-footer {
          background: #f7fafc;
          padding: 16px 24px;
          font-size: 0.75rem;
          color: #a0aec0;
          text-align: center;
          border-top: 1px solid #edf2f7;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
      `}</style>

      <div className="payment-card fade-in">
        <div className="summary-header">
          <Shield size={26} color="var(--primary)" />
          <h2 style={{ margin: 0, fontWeight: '800', fontSize: '1.4rem' }}>Priority Booking Pass</h2>
        </div>

        {/* Selected Slot info */}
        <div className="payment-summary-box">
          <div className="summary-item">
            <span>Shrine:</span>
            <strong>{slot?.templeId?.templeName}</strong>
          </div>
          <div className="summary-item">
            <span>Location:</span>
            <strong>{slot?.templeId?.location}</strong>
          </div>
          <div className="summary-item">
            <span>Date:</span>
            <strong>{new Date(slot?.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}</strong>
          </div>
          <div className="summary-item">
            <span>Entry Hour:</span>
            <strong>{slot?.startTime} - {slot?.endTime}</strong>
          </div>
          <div style={{ borderTop: '1px dashed var(--text-light)', opacity: 0.3, margin: '14px 0' }} />
          <div className="summary-item" style={{ fontSize: '1.15rem' }}>
            <span>Amount Payable:</span>
            <strong style={{ color: 'var(--primary)' }}>₹{slot?.price}</strong>
          </div>
        </div>

        {error && (
          <div className="card" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
            <p className="error-text" style={{ margin: 0, fontSize: '0.9rem' }}>{error}</p>
          </div>
        )}

        <button 
          className="btn btn-primary pay-cta-btn" 
          onClick={handlePayInitiate}
          disabled={processing}
        >
          {processing ? (
            <><Loader2 className="spinner" size={20} /> Starting Gateway...</>
          ) : (
            `Proceed to Pay ₹${slot?.price}`
          )}
        </button>

        <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '16px', textAlign: 'center', margin: '16px 0 0' }}>
          <Shield size={14} /> 256-bit SSL Encrypted secure checkout with Razorpay.
        </p>
      </div>

      {/* Robust High-fidelity Customized Razorpay Gateway Modal Simulator */}
      {showSimulateModal && (
        <div className="gateway-modal-overlay">
          <div className="gateway-modal">
            <div className="gateway-header">
              <span className="gateway-logo">razorpay</span>
              <span className="gateway-amount">₹{slot?.price}</span>
            </div>

            {simulatedStep === 1 && (
              <div className="gateway-content fade-in">
                <p style={{ fontSize: '0.8rem', color: '#718096', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>
                  Test Mode Payments Gateway
                </p>

                <div className="gateway-tabs">
                  <div 
                    onClick={() => setSimulatedMethod('card')} 
                    className={`gateway-tab ${simulatedMethod === 'card' ? 'active' : ''}`}
                  >
                    Credit / Debit Card
                  </div>
                  <div 
                    onClick={() => setSimulatedMethod('upi')} 
                    className={`gateway-tab ${simulatedMethod === 'upi' ? 'active' : ''}`}
                  >
                    UPI Payment
                  </div>
                </div>

                {simulatedMethod === 'card' ? (
                  <div>
                    <div className="gateway-input-group">
                      <label>Card Number</label>
                      <input 
                        className="gateway-input" 
                        value={cardData.number}
                        onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                        placeholder="4312 9900 1234 5678" 
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="gateway-input-group">
                        <label>Expiry Date</label>
                        <input 
                          className="gateway-input" 
                          value={cardData.expiry}
                          onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                          placeholder="MM/YY" 
                        />
                      </div>
                      <div className="gateway-input-group">
                        <label>CVV</label>
                        <input 
                          className="gateway-input" 
                          value={cardData.cvv}
                          onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                          placeholder="123" 
                          type="password"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="gateway-input-group">
                      <label>UPI Address (VPA)</label>
                      <input 
                        className="gateway-input" 
                        value={upiId} 
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="username@okaxis" 
                      />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#a0aec0', margin: '0 0 12px' }}>
                      A secure test payment request will be sent to your UPI device immediately.
                    </p>
                  </div>
                )}

                <button onClick={handleSimulatedSubmit} className="gateway-submit-btn">
                  Simulate Success Pay
                </button>
              </div>
            )}

            {simulatedStep === 2 && (
              <div className="gateway-content fade-in" style={{ textAlign: 'center' }}>
                <Shield size={36} color="#2563eb" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ margin: '0 0 8px', fontSize: '1.05rem', fontWeight: '700' }}>Secure OTP Authorization</h4>
                <p style={{ fontSize: '0.85rem', color: '#718096', margin: '0 0 20px' }}>
                  A test verification code has been dispatched to your prefilled contact phone number. Enter code below to authorize.
                </p>

                <div className="gateway-input-group" style={{ maxWidth: '160px', margin: '0 auto 20px' }}>
                  <input 
                    className="gateway-input" 
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456" 
                    style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '2px', fontWeight: 'bold' }}
                  />
                </div>

                <button onClick={handleSimulatedSubmit} className="gateway-submit-btn">
                  Verify & Confirm Entry
                </button>
              </div>
            )}

            {simulatedStep === 3 && (
              <div className="gateway-content fade-in" style={{ textAlign: 'center', padding: '40px 24px' }}>
                <RefreshCw className="spinner" size={48} color="#2563eb" style={{ margin: '0 auto 16px' }} />
                <h4 style={{ margin: '0 0 6px', fontWeight: '700', fontSize: '1.05rem' }}>Authorizing with Issuing Bank...</h4>
                <p style={{ fontSize: '0.85rem', color: '#a0aec0', margin: 0 }}>
                  Securing transaction. Please do not close or hit back.
                </p>
              </div>
            )}

            <div className="gateway-footer">
              <Shield size={12} />
              <span>PCI-DSS Secure Portal Gateway System</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
