import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { logout } from '../services/authService';
import { 
  Home, 
  Calendar, 
  LayoutDashboard, 
  History, 
  Settings, 
  Clock, 
  User, 
  LogOut,
  MapPin,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

const Navbar = () => {
  const { userInfo, setUserInfo } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // 3-Way Theme Toggler Logic (light / dark / system)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (currentTheme) => {
      if (currentTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.setAttribute('data-theme', systemTheme);
      } else {
        root.setAttribute('data-theme', currentTheme);
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    // Sync when system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  // Click outside listener to close theme menu
  useEffect(() => {
    if (!themeMenuOpen) return;
    const handleOutsideClick = () => setThemeMenuOpen(false);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [themeMenuOpen]);

  const handleLogout = () => {
    logout();
    setUserInfo(null);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children }) => (
    <li>
      <Link 
        to={to} 
        className={`nav-link ${isActive(to) ? 'active' : ''}`}
      >
        <Icon size={18} />
        <span>{children}</span>
      </Link>
    </li>
  );

  return (
    <header className="navbar">
      <div className="container nav-container">
        <Link to="/" className="logo">
          <MapPin className="logo-icon" size={24} />
          <span>Darshan Ease</span>
        </Link>
        
        <nav>
          <ul className="nav-links">
            {/* Public / Unauthenticated Navigation */}
            {!userInfo && (
              <>
                <NavLink to="/" icon={Home}>Home</NavLink>
                <NavLink to="/temples" icon={Calendar}>Darshan Booking</NavLink>
              </>
            )}

            {/* Authenticated Navigation based on Role */}
            {userInfo && (
              <>
                {userInfo.role === 'User' && (
                  <>
                    <NavLink to="/temples" icon={LayoutDashboard}>Dashboard</NavLink>
                    <NavLink to="/history" icon={History}>My Bookings</NavLink>
                  </>
                )}
                
                {userInfo.role === 'Organizer' && (
                  <>
                    <NavLink to="/organizer" icon={LayoutDashboard}>Dashboard</NavLink>
                    <NavLink to="/organizer" icon={Clock}>Manage Slots</NavLink>
                  </>
                )}

                {userInfo.role === 'Admin' && (
                  <>
                    <NavLink to="/admin" icon={LayoutDashboard}>Dashboard</NavLink>
                    <NavLink to="/admin" icon={Settings}>Management</NavLink>
                  </>
                )}
              </>
            )}
          </ul>
        </nav>

        <ul className="nav-actions">
          {/* Theme Selector */}
          <li className="theme-selector" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setThemeMenuOpen(!themeMenuOpen)} 
              className="theme-toggle-btn" 
              title={`Theme: ${theme}`}
            >
              {theme === 'light' && <Sun size={18} />}
              {theme === 'dark' && <Moon size={18} />}
              {theme === 'system' && <Monitor size={18} />}
            </button>
            
            {themeMenuOpen && (
              <div className="theme-menu">
                <button 
                  onClick={() => { setTheme('light'); setThemeMenuOpen(false); }} 
                  className={`theme-menu-item ${theme === 'light' ? 'active' : ''}`}
                >
                  <Sun size={14} />
                  <span>Light</span>
                </button>
                <button 
                  onClick={() => { setTheme('dark'); setThemeMenuOpen(false); }} 
                  className={`theme-menu-item ${theme === 'dark' ? 'active' : ''}`}
                >
                  <Moon size={14} />
                  <span>Dark</span>
                </button>
                <button 
                  onClick={() => { setTheme('system'); setThemeMenuOpen(false); }} 
                  className={`theme-menu-item ${theme === 'system' ? 'active' : ''}`}
                >
                  <Monitor size={14} />
                  <span>System</span>
                </button>
              </div>
            )}
          </li>

          {userInfo ? (
            <>
              <li className="user-profile">
                <div className="avatar">
                  <User size={18} />
                </div>
                <span className="user-name">{userInfo.name.split(' ')[0]}</span>
              </li>
              <li>
                <button onClick={handleLogout} className="btn btn-logout" title="Logout">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="login-link">Login</Link></li>
              <li><Link to="/register" className="btn btn-primary">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
