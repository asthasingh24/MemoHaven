import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPhoneAlt, FaPlus, FaTimes, FaSignOutAlt, FaHome, FaMapMarkedAlt } from 'react-icons/fa';

import VoiceSearch from './components/VoiceSearch';
import UploadForm from './components/UploadForm';
import PatientManager from './components/PatientManager';
import RoutineList from './components/RoutineList';
import { AuthContext } from './context/AuthContext';

const MainDashboard = ({ user }) => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [memories, setMemories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);

  const fetchMemories = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/memories', { 
        headers: { 'x-auth-token': token } 
      });
      setMemories(res.data);
      setFiltered(res.data);
    } catch (err) { 
      console.error("Error fetching memories", err); 
    }
  };

  useEffect(() => { fetchMemories(); }, []);

  const handleSearch = (text) => {
    //const query = text?.toString().trim().toLowerCase() || '';
    const query = text?.toString().replace(/[.,!?]/g, '').trim().toLowerCase() || '';
    if (!query) {
        setFiltered(memories);
        return;
    }

    const terms = query.split(/\s+/).filter(Boolean);
    const results = memories.filter(m => {
      const title = m.title?.toLowerCase() || '';
      const tags = (m.tags || []).map(t => t.toLowerCase());
      return terms.some(term =>
        title.includes(term) || tags.some(t => t.includes(term))
      );
    });

    setFiltered(results);
  };

  return (
    <div className="container" style={{maxWidth: '1200px', margin: '0 auto', padding: '20px', paddingBottom: '100px'}}>
      
      {/* HEADER */}
      <header style={styles.header}>
        <div>
           <h1 style={{margin: 0, color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '10px'}}>
             <FaHome style={{color: '#4A90E2'}}/> MemoHaven
           </h1>
           <p style={{margin: 0, color: '#7f8c8d', fontSize: '0.9rem'}}>
             Welcome, {user.name} ({user.role === 'caregiver' ? 'Caregiver Mode' : 'Patient View'})
           </p>
        </div>
        <button onClick={logout} style={styles.logoutBtn}>
           <FaSignOutAlt /> Logout
        </button>
      </header>

      {/* MAIN GRID */}
      <div style={styles.mainGrid}>
          
          {/* LEFT COLUMN: TOOLS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <RoutineList user={user} />

              <div 
                onClick={() => navigate('/locations')} 
                style={styles.navCard}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                  <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                      <div style={styles.navIconBox}><FaMapMarkedAlt /></div>
                      <div>
                          <h3 style={{margin: 0, color: '#2c3e50', fontSize: '1.1rem'}}>Safe Locations</h3>
                          <p style={{margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '0.85rem'}}>View Map: Home, Hospital & Parks</p>
                      </div>
                  </div>
                  <div style={{fontSize: '1.5rem', color: '#ddd'}}>&gt;</div>
              </div>

              {user.role === 'caregiver' && <PatientManager />}
              
              {user.role === 'caregiver' && (
                <div style={styles.uploadSection}>
                  {showUpload ? (
                    <>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                        <h4>New Memory</h4>
                        <button onClick={() => setShowUpload(false)} style={styles.closeBtn}><FaTimes /></button>
                      </div>
                      <UploadForm onUploadSuccess={() => { fetchMemories(); setShowUpload(false); }} /> 
                    </>
                  ) : (
                    <button onClick={() => setShowUpload(true)} style={styles.bigAddBtn}>
                      <FaPlus /> Add Photo/Video
                    </button>
                  )}
                </div>
              )}
          </div>

          {/* RIGHT COLUMN: MEMORY WALL */}
          <div>
              <div style={styles.searchBar}>
                <VoiceSearch onSearch={handleSearch} />
                <p style={{margin: '10px 0 0 0', color: '#999', fontSize: '0.9rem'}}>Tap the mic and say "Wedding" or "Picnic"</p>
              </div>

              <div style={styles.memoryGrid}>
                {filtered.length === 0 ? (
                    <div style={{textAlign: 'center', padding: '40px', color: '#ccc'}}>
                        <h3>No memories found.</h3>
                    </div>
                ) : (
                    filtered.map(mem => (
                      <div key={mem._id} className="memory-card" style={styles.polaroid}>
                        <div style={styles.imageWrapper}>
                           {/* VIDEO VS IMAGE RENDER LOGIC */}
                           {mem.type === 'video' ? (
                               <video 
                                  src={mem.mediaUrl} 
                                  controls 
                                  style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                               />
                           ) : (
                               <img 
                                  src={mem.mediaUrl} 
                                  alt={mem.title} 
                                  style={{width: '100%', height: '100%', objectFit: 'cover'}} 
                                  loading="lazy" 
                               />
                           )}
                        </div>
                        <h3 style={styles.polaroidText}>{mem.title}</h3>
                        <div style={styles.tagContainer}>
                           {mem.tags.map((t, idx) => (
                             <span key={idx} style={styles.tag}>#{t.trim()}</span>
                           ))}
                        </div>
                      </div>
                    ))
                )}
              </div>
          </div>
      </div>

      {/* FOOTER */}
      <div style={styles.emergencyBar}>
         <div>
            <span style={{fontWeight: 'bold', fontSize: '1.2rem', color: '#c0392b'}}>MEDICAL ID</span> 
            <span style={{marginLeft: '15px', color: '#555'}}>Diabetes T2 • Blood: O+</span>
         </div>
         <button 
            onClick={() => setIsEmergency(!isEmergency)} 
            style={isEmergency ? styles.sosBtnActive : styles.sosBtn}
         >
            <FaPhoneAlt /> {isEmergency ? "Calling Dr. Smith..." : "Emergency Help"}
         </button>
      </div>

    </div>
  );
};

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee' },
  logoutBtn: { background: '#95a5a6', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
  mainGrid: { display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '30px', alignItems: 'start' },
  navCard: { background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', cursor: 'pointer', borderLeft: '5px solid #e67e22', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'transform 0.2s' },
  navIconBox: { background: '#fdf2e9', padding: '12px', borderRadius: '50%', color: '#e67e22', fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  uploadSection: { background: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  bigAddBtn: { width: '100%', padding: '15px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 'bold' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#7f8c8d' },
  searchBar: { textAlign: 'center', marginBottom: '30px', background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  memoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px' },
  polaroid: { background: 'white', padding: '15px', paddingBottom: '50px', borderRadius: '2px', boxShadow: '5px 5px 15px rgba(0,0,0,0.15)', transform: 'rotate(-1deg)', transition: 'transform 0.2s' },
  imageWrapper: { width: '100%', height: '220px', overflow: 'hidden', border: '1px solid #eee', marginBottom: '15px', background: '#000' },
  polaroidText: { fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif', textAlign: 'center', margin: '0', color: '#333' },
  tagContainer: { display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '10px', flexWrap: 'wrap' },
  tag: { fontSize: '0.8rem', color: '#999' },
  emergencyBar: { position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'white', borderTop: '5px solid #c0392b', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)', boxSizing: 'border-box', zIndex: 9999 },
  sosBtn: { background: '#c0392b', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' },
  sosBtnActive: { background: '#e74c3c', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '50px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', animation: 'pulse 1s infinite' }
};

export default MainDashboard;