import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Temples from '../pages/Temples';
import SlotSelection from '../pages/SlotSelection';
import Booking from '../pages/Booking';
import PaymentPage from '../pages/PaymentPage';
import TicketPage from '../pages/TicketPage';
import BookingHistory from '../pages/BookingHistory';
import AdminDashboard from '../pages/AdminDashboard';
import OrganizerDashboard from '../pages/OrganizerDashboard';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/temples" element={<Temples />} />
            
            {/* Public details but slot selection requires sign-in to view and pick slots? 
                Actually, let's keep details public, slot picking can navigate to booking which is guarded. */}
            <Route path="/temples/:id" element={<SlotSelection />} />
            
            {/* Authenticated User Routes */}
            <Route 
              path="/booking/:slotId" 
              element={
                <ProtectedRoute allowedRoles={['User', 'Organizer', 'Admin']}>
                  <Booking />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/payment/:slotId" 
              element={
                <ProtectedRoute allowedRoles={['User', 'Organizer', 'Admin']}>
                  <PaymentPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ticket/:bookingId" 
              element={
                <ProtectedRoute allowedRoles={['User', 'Organizer', 'Admin']}>
                  <TicketPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/history" 
              element={
                <ProtectedRoute allowedRoles={['User', 'Organizer', 'Admin']}>
                  <BookingHistory />
                </ProtectedRoute>
              } 
            />
            
            {/* Role-Specific Protected Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/organizer" 
              element={
                <ProtectedRoute allowedRoles={['Organizer', 'Admin']}>
                  <OrganizerDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default AppRoutes;

