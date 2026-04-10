import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserPlus, FaUsers } from 'react-icons/fa';

const PatientManager = () => {
  const [patients, setPatients] = useState([]);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');

  const fetchPatients = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/api/auth/my-patients', { headers: { 'x-auth-token': token } });
    setPatients(res.data);
  };

  useEffect(() => { fetchPatients(); }, []);

  const addPatient = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('http://localhost:5000/api/auth/add-patient', { name: newName, code: newCode }, { headers: { 'x-auth-token': token } });
      setNewName(''); setNewCode(''); fetchPatients();
    } catch (err) { alert("Code taken or error occurred"); }
  };

  return (
    <div style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h3><FaUsers /> My Patients</h3>
      <ul style={{listStyle: 'none', padding: 0}}>
        {patients.map(p => (
            <li key={p._id} style={{padding: '8px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between'}}>
                <span>{p.name}</span> <span style={{fontWeight:'bold', color: '#4A90E2'}}>{p.code}</span>
            </li>
        ))}
      </ul>
      <form onSubmit={addPatient} style={{display: 'flex', gap: '5px', marginTop: '10px'}}>
        <input placeholder="Name" value={newName} onChange={e=>setNewName(e.target.value)} style={{padding: '5px', width: '40%'}} required />
        <input placeholder="Login Code" value={newCode} onChange={e=>setNewCode(e.target.value)} style={{padding: '5px', width: '30%'}} required />
        <button style={{background: '#27ae60', color:'white', border:'none', borderRadius:'4px', cursor: 'pointer'}}><FaUserPlus /></button>
      </form>
    </div>
  );
};
export default PatientManager;