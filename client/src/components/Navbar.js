import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaClipboardList, FaMapMarkedAlt, FaCloudUploadAlt, FaSignOutAlt } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* LOGO */}
        <div style={styles.logoSection} onClick={() => navigate('/')}>
            <span style={{fontSize: '1.8rem', marginRight: '5px'}}>🧠</span>
            <h1 style={styles.logoText}>MemoHaven</h1>
        </div>

        {/* LINKS */}
        <div style={styles.links}>
            <Link to="/" style={isActive('/') ? styles.linkActive : styles.link}>
                <FaHome /> Home
            </Link>
            
            <Link to="/routines" style={isActive('/routines') ? styles.linkActive : styles.link}>
                <FaClipboardList /> Routine
            </Link>
            
            <Link to="/locations" style={isActive('/locations') ? styles.linkActive : styles.link}>
                <FaMapMarkedAlt /> Safe Spots
            </Link>

            {user.role === 'caregiver' && (
                <Link to="/upload" style={isActive('/upload') ? styles.linkActive : styles.link}>
                    <FaCloudUploadAlt /> Upload
                </Link>
            )}
        </div>

        {/* USER */}
        <div style={styles.userSection}>
            <span style={styles.welcome}>Hi, {user.name}</span>
            <button onClick={logout} style={styles.logoutBtn} title="Logout">
                <FaSignOutAlt />
            </button>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: { background: 'white', borderBottom: '1px solid #eee', padding: '10px 0', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  container: { maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' },
  logoSection: { display: 'flex', alignItems: 'center', cursor: 'pointer' },
  logoText: { margin: 0, color: '#2c3e50', fontSize: '1.5rem', fontWeight: 'bold' },
  links: { display: 'flex', gap: '20px' },
  link: { textDecoration: 'none', color: '#7f8c8d', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '20px', transition: '0.2s' },
  linkActive: { textDecoration: 'none', color: '#4A90E2', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', background: '#eaf2f8', padding: '8px 12px', borderRadius: '20px' },
  userSection: { display: 'flex', alignItems: 'center', gap: '15px' },
  welcome: { color: '#555', fontSize: '0.9rem', fontWeight: '600', display: 'none' }, // hidden on mobile
  logoutBtn: { background: '#ffebee', color: '#c62828', border: 'none', width: '35px', height: '35px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }
};

export default Navbar;