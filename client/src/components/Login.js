import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaUserNurse, FaUser } from 'react-icons/fa';

const Login = () => {
  const { login, register, patientLogin } = useContext(AuthContext);
  const [view, setView] = useState('patient'); 
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'caregiver', familyCode: '', simpleCode: '' });
  const [isRegistering, setIsRegistering] = useState(false);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handlePatientLogin = (e) => {
    e.preventDefault();
    patientLogin(formData.simpleCode);
  };

  const handleCaregiverSubmit = (e) => {
    e.preventDefault();
    if (isRegistering) register(formData.name, formData.email, formData.password, 'caregiver', formData.familyCode);
    else login(formData.email, formData.password);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f4f8fb' }}>
      <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
        <button onClick={() => setView('patient')} style={{ border: 'none', background: 'none', fontSize: '1.2rem', color: view==='patient'?'#4A90E2':'#999', fontWeight: 'bold', cursor:'pointer' }}><FaUser /> I am Patient</button>
        <button onClick={() => setView('caregiver')} style={{ border: 'none', background: 'none', fontSize: '1.2rem', color: view==='caregiver'?'#4A90E2':'#999', fontWeight: 'bold', cursor:'pointer' }}><FaUserNurse /> Caregiver</button>
      </div>

      <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '350px' }}>
        {view === 'patient' ? (
          <form onSubmit={handlePatientLogin} style={{textAlign: 'center'}}>
            <h2>Welcome</h2>
            <p>Enter your code</p>
            <input name="simpleCode" onChange={onChange} placeholder="e.g. JOE" style={{width: '100%', padding: '15px', fontSize: '1.5rem', textAlign: 'center', marginBottom: '20px', textTransform: 'uppercase'}} />
            <button style={{width: '100%', padding: '15px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.2rem'}}>ENTER</button>
          </form>
        ) : (
          <form onSubmit={handleCaregiverSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            <h2>{isRegistering ? 'Register' : 'Login'}</h2>
            {isRegistering && (
              <>
                <input name="name" onChange={onChange} placeholder="Name" style={{padding: '10px'}} />
                <input name="familyCode" onChange={onChange} placeholder="Create Main Family Code" style={{padding: '10px'}} />
              </>
            )}
            <input name="email" type="email" onChange={onChange} placeholder="Email" style={{padding: '10px'}} />
            <input name="password" type="password" onChange={onChange} placeholder="Password" style={{padding: '10px'}} />
            <button style={{padding: '10px', background: '#4A90E2', color: 'white', border: 'none', borderRadius: '5px'}}>{isRegistering ? 'Register' : 'Login'}</button>
            <p onClick={() => setIsRegistering(!isRegistering)} style={{color: '#4A90E2', cursor: 'pointer', textAlign: 'center'}}>{isRegistering ? 'Login' : 'Create Account'}</p>
          </form>
        )}
      </div>
    </div>
  );
};
export default Login;