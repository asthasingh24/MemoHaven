import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('user')) {
      setUser(JSON.parse(localStorage.getItem('user')));
    }
    setLoading(false);
  }, []);

  // Standard Login
  const login = async (email, password) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      saveSession(res.data);
    } catch(err) { alert(err.response.data.msg); }
  };

  // Register
  const register = async (name, email, password, role, familyCode) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password, role, familyCode });
      saveSession(res.data);
    } catch(err) { alert(err.response.data.msg); }
  };

  // Simple Patient Login
  const patientLogin = async (code) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/patient-login', { familyCode: code });
      saveSession(res.data);
    } catch(err) { alert("Invalid Code"); }
  };

  const saveSession = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, patientLogin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};