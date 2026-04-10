import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { FaPhoneAlt } from 'react-icons/fa';

// --- IMPORT PAGES & COMPONENTS ---
import Navbar from './components/Navbar.js';
import Login from './components/Login';
import Home from './pages/Home';
import UploadPage from './pages/UploadPage';
import RoutinesPage from './pages/RoutinesPage';
import LocationsPage from './pages/LocationsPage';
import EmergencyBtn from './components/EmergencyBtn';
import './App.css'; // Ensure you have basic css reset


const AppRoutes = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Loading MemoHaven...</div>;
  
  // If not logged in, show Login Screen
  if (!user) return <Login />;

  return (
    <>
      {/* 1. NAVIGATION BAR (Always Visible) */}
      <Navbar /> 
      
      {/* 2. PAGE CONTENT */}
      <div style={{minHeight: '80vh', paddingBottom: '80px'}}>
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/routines" element={<RoutinesPage user={user} />} />
          <Route path="/locations" element={<LocationsPage user={user} />} />
          
          {/* Protected Route: Only Caregivers can see Upload */}
          <Route path="/upload" element={
              user.role === 'caregiver' ? <UploadPage /> : <Navigate to="/" />
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      {/* 3. EMERGENCY FOOTER (Always Visible) */}
      {/* 🌟 Only render the Emergency Button if the logged-in user is a Patient */}
      {user.role === 'patient' && (
        <EmergencyBtn user={user} />
      )}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

const styles = {
  emergencyBar: { position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'white', borderTop: '4px solid #c0392b', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2000, boxSizing: 'border-box', boxShadow: '0 -2px 10px rgba(0,0,0,0.1)' },
  sosBtn: { background: '#c0392b', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  sosBtnActive: { background: '#e74c3c', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', animation: 'pulse 1s infinite' }
};

export default App;