import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const EmergencyBtn = ({ user }) => {
  const [showInfo, setShowInfo] = useState(false);
  const [sending, setSending] = useState(false);

  const triggerSOS = async () => {
    // Confirmation prevents accidental taps
    if (!window.confirm("Alert your caregiver immediately?")) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/emergency/alert', {
        patientName: user?.name || "A patient"
      }, {
        headers: { 'x-auth-token': token }
      });

      toast.error("🚨 Emergency Alert Sent to Caregiver!", { position: "top-center" });
      setShowInfo(false); // Close the menu after sending
    } catch (err) {
      console.error(err);
      toast.error("Failed to send alert. Please call directly.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      
      {showInfo && (
        <div style={{ background: '#e74c3c', color: 'white', padding: '20px', borderRadius: '15px', marginBottom: '15px', boxShadow: '0 10px 25px rgba(231,76,60,0.4)', minWidth: '220px', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '10px' }}>
            🚑 EMERGENCY
          </h3>
          
          <p style={{ margin: '10px 0', fontSize: '1rem', opacity: 0.9 }}>
            Need help? Tap below to notify them.
          </p>
          
          <button 
            onClick={triggerSOS}
            disabled={sending}
            style={{ marginTop: '10px', width: '100%', padding: '15px', background: 'white', color: '#e74c3c', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          >
            {/* 🌟 THIS CHANGES THE TEXT WHEN CLICKED */}
            {sending ? "Calling Caregiver..." : "🚨 Alert Caregiver"}
          </button>
        </div>
      )}

      <button 
        onClick={() => setShowInfo(!showInfo)}
        style={{ background: '#e74c3c', color: 'white', fontSize: '28px', width: '70px', height: '70px', borderRadius: '50%', border: 'none', boxShadow: '0 6px 15px rgba(231,76,60,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
      >
        🆘
      </button>
    </div>
  );
};

export default EmergencyBtn;