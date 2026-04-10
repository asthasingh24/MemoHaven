import React, { useState } from 'react';
import axios from 'axios';
import { FaPhoneAlt, FaSave } from 'react-icons/fa';

const EmergencySetup = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const savePhone = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/auth/update-phone', 
        { phone }, 
        { headers: { 'x-auth-token': token } }
      );
      alert("Emergency number saved successfully!");
      setPhone('');
    } catch (err) {
      alert("Failed to save number.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#c0392b', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FaPhoneAlt /> SOS Alert Setup
      </h3>
      <p style={{ fontSize: '0.85rem', color: '#7f8c8d', margin: '0 0 10px 0' }}>
        Enter your verified Twilio cell number (e.g., +1234567890) to receive SMS alerts when the patient presses SOS.
      </p>
      
      <form onSubmit={savePhone} style={{ display: 'flex', gap: '5px' }}>
        <input 
          type="text" 
          placeholder="+1..." 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
          style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} 
          required 
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ background: '#c0392b', color: 'white', border: 'none', borderRadius: '4px', padding: '0 15px', cursor: 'pointer' }}
        >
          {loading ? "..." : <FaSave />}
        </button>
      </form>
    </div>
  );
};

export default EmergencySetup;