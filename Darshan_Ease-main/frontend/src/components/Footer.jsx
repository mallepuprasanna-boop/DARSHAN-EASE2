import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <Link to="/" className="logo" style={{ color: 'white', marginBottom: '16px' }}>
              <MapPin className="logo-icon" size={24} style={{ color: 'var(--primary)' }} />
              <span>Darshan Ease</span>
            </Link>
            <p>
              Facilitating divine and peaceful darshan experiences across the country with cutting-edge technology and devotion.
            </p>
          </div>
          
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/temples">Temples</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h4>Support</h4>
            <ul>
              <li><Link to="#">Terms of Service</Link></li>
              <li><Link to="#">Privacy Policy</Link></li>
              <li><Link to="#">Contact Us</Link></li>
              <li><Link to="#">FAQs</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Darshan Ease. All spiritual rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
