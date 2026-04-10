import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaVideo, FaImage, FaHeart, FaQuoteLeft, FaSearch, FaStar, FaTrash, FaMicrophone } from 'react-icons/fa';
import VoiceSearch from '../components/VoiceSearch';
import PatientManager from '../components/PatientManager';
import FamilyGallery from '../components/FamilyGallery';
import EmergencySetup from '../components/EmergencySetup';

const Home = ({ user }) => {
  const [memories, setMemories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [quote, setQuote] = useState('');

  const quotes = [
    "Memories are the timeless treasures of the heart.",
    "The best thing about memories is making them.",
    "Love is the only memory that never fades.",
    "Every moment matters.",
    "Happiness is a collection of happy memories."
  ];

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    const fetchMemories = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5000/api/memories', { headers: { 'x-auth-token': token } });
        setMemories(res.data);
        setFiltered(res.data);
      } catch (err) { console.error("Error", err); }
    };
    fetchMemories();
  }, []);

  const handleSearch = (text) => {
    //const query = text?.toString().trim().toLowerCase() || '';
    const query = text?.toString().replace(/[.,!?]/g, '').trim().toLowerCase() || '';
    if (!query) return setFiltered(memories);

    const terms = query.split(/\s+/).filter(Boolean);
    setFiltered(memories.filter(m => {
      const title = m.title?.toLowerCase() || '';
      const tags = (m.tags || []).map(t => t.toLowerCase());
      return terms.some(term =>
        title.includes(term) || tags.some(t => t.includes(term))
      );
    }));
  };

  const deleteMemory = async (id) => {
  if (!window.confirm("Are you sure you want to delete this memory?")) return;
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5000/api/memories/${id}`, {
      headers: { 'x-auth-token': token }
    });
    setMemories(memories.filter(m => m._id !== id));
    setFiltered(filtered.filter(m => m._id !== id));
  } catch (err) { alert("Failed to delete memory"); }
};

  const videos = filtered.filter(m => m.type === 'video');
  const audios = filtered.filter(m => m.type === 'audio');
  const photos = filtered.filter(m => {
    if (!m.type) return true;
    const type = m.type.toLowerCase();
    return type === 'image' || type === 'photo' || type.startsWith('image');
  });

  const isCaregiver = user.role === 'caregiver';

  return (
    <div style={styles.pageBackground}>
      <div style={styles.container}>
        
        {/* --- HERO SECTION --- */}
        <div style={styles.hero}>
          <div style={styles.heroContent}>
            
            {/* GREETING */}
            <div style={styles.greeting}>
                <span style={{fontSize: '3rem'}}>☀️</span>
                <div>
                    <h1 style={styles.heroTitle}>Good Morning, {user.name.split(' ')[0]}!</h1>
                    <p style={styles.heroSubtitle}>Welcome back to your safe space.</p>
                </div>
            </div>
            
            {/* QUOTE */}
            <div style={styles.quoteBox}>
                <FaQuoteLeft style={styles.quoteIcon} />
                <p style={styles.quoteText}>{quote}</p>
            </div>
          </div>

          {/* SEARCH BAR (Now positioned below the content, not floating) */}
          <div style={styles.searchContainer}>
            <VoiceSearch onSearch={handleSearch} />
            <div style={styles.searchHint}>
                <FaSearch style={{fontSize: '0.8rem'}} /> Tap the microphone and say "Family" or "Wedding"
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div style={isCaregiver ? styles.splitLayout : styles.singleLayout}>
            
            {/* LEFT COLUMN: MEMORIES */}
            <div style={styles.memoryColumn}>

                {/* 🌟 NEW: FAMILY GALLERY INSERTED HERE */}
                <FamilyGallery user={user} />

                {/* 🌟 NEW: VOICE NOTES SECTION */}
            {audios.length > 0 && (
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <div style={styles.iconCircleBlue}><FaMicrophone /></div>
                        <h2 style={styles.sectionTitle}>Voice Notes</h2>
                    </div>
                    <div style={styles.audioGrid}>
                        {audios.map(mem => (
                            <div key={mem._id} style={styles.audioCard}>

                                {isCaregiver && (
                                  <button onClick={() => deleteMemory(mem._id)} style={styles.deleteMemoryBtn}>
                                    <FaTrash />
                                  </button>
                                )}

                                <div style={styles.audioInfo}>
                                    <h3 style={styles.audioTitle}>{mem.title}</h3>
                                    <div style={styles.tags}>{mem.tags.map(t => <span key={t}>#{t.trim()} </span>)}</div>
                                </div>
                                <audio src={mem.mediaUrl} controls style={styles.audioPlayer} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
                
                {/* VIDEOS */}
                {videos.length > 0 && (
                    <div style={styles.section}>
                        <div style={styles.sectionHeader}>
                            <div style={styles.iconCirclePurple}><FaVideo /></div>
                            <h2 style={styles.sectionTitle}>Moving Memories</h2>
                        </div>
                        <div style={styles.videoGrid}>
                            {videos.map(mem => (
                                <div key={mem._id} style={styles.videoCard}>
                                    {isCaregiver && (
  <button onClick={() => deleteMemory(mem._id)} style={styles.deleteMemoryBtn}>
    <FaTrash />
  </button>
)}
                                    <div style={styles.videoFrame}>
                                        <video src={mem.mediaUrl} controls style={styles.media} />
                                    </div>
                                    <div style={styles.videoFooter}>
                                        <h3 style={styles.videoTitle}>{mem.title}</h3>
                                        <div style={styles.tags}>{mem.tags.map(t => <span key={t}>#{t.trim()} </span>)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* PHOTOS */}
                <div style={styles.section}>
                    <div style={styles.sectionHeader}>
                        <div style={styles.iconCircleGreen}><FaImage /></div>
                        <h2 style={styles.sectionTitle}>Photo Album</h2>
                    </div>
                    
                    {photos.length === 0 ? (
                        <div style={styles.emptyState}>
                            <FaImage style={{fontSize: '3rem', color: '#ccc', marginBottom: '10px'}} />
                            <p>No photos yet. {isCaregiver ? 'Click "Upload" to add some!' : 'Check back later!'}</p>
                        </div>
                    ) : (
                        <div style={styles.photoGrid}>
                            {photos.map(mem => (
                                <div key={mem._id} style={styles.polaroid}>
                                    {isCaregiver && (
  <button onClick={() => deleteMemory(mem._id)} style={styles.deleteMemoryBtn}>
    <FaTrash />
  </button>
)}
                                    <div style={styles.tape}></div>
                                    <div style={styles.imageBox}>
                                        <img src={mem.mediaUrl} alt={mem.title} style={styles.photo} loading="lazy" />
                                    </div>
                                    <div style={styles.captionArea}>
                                        <h3 style={styles.handwritten}>{mem.title}</h3>
                                        <div style={styles.dateBadge}>
                                            <FaHeart style={{color: '#e74c3c', fontSize: '0.8rem'}} /> {new Date(mem.date).getFullYear()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN: SIDEBAR */}
            {isCaregiver && (
                <div style={styles.sidebar}>
                  {/* 🌟 NEW: The Setup Box */}
                    <EmergencySetup />
                    <div style={styles.sidebarCard}>
                        <div style={styles.sidebarHeader}>
                             <FaStar style={{color: '#f1c40f'}} /> My Patients
                        </div>
                        <PatientManager />
                    </div>
                    <div style={styles.tipCard}>
                        <strong>💡 Caregiver Tip:</strong>
                        <p style={{margin: '5px 0 0 0', fontSize: '0.9rem', color: '#555'}}>
                            Upload videos of family members saying "Hello" to help with facial recognition.
                        </p>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

// --- UPDATED STYLES ---
const styles = {
  pageBackground: { background: '#f4f7f6', minHeight: '100vh' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },

  // Hero Section
  hero: { 
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
    borderRadius: '20px', 
    padding: '40px', 
    color: 'white', 
    marginBottom: '40px',
    boxShadow: '0 10px 20px rgba(118, 75, 162, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center' // Centers the search bar
  },

  deleteMemoryBtn: { position: 'absolute', top: '10px', right: '10px', background: 'rgba(231, 76, 60, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '35px', height: '35px', cursor: 'pointer', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  heroContent: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    flexWrap: 'wrap', 
    gap: '20px', 
    marginBottom: '30px', 
    width: '100%' 
  },
  greeting: { display: 'flex', alignItems: 'center', gap: '15px' },
  heroTitle: { fontSize: '2.5rem', margin: 0, fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.2)' },
  heroSubtitle: { fontSize: '1.2rem', opacity: 0.9, marginTop: '5px' },
  
  quoteBox: { background: 'rgba(255,255,255,0.2)', padding: '15px 25px', borderRadius: '15px', maxWidth: '400px', backdropFilter: 'blur(5px)' },
  quoteIcon: { fontSize: '1.5rem', opacity: 0.8, marginBottom: '5px' },
  quoteText: { fontStyle: 'italic', fontSize: '1.1rem', margin: 0, lineHeight: '1.4' },

  // *** UPDATED SEARCH CONTAINER STYLES ***
  // Removed absolute positioning to stop it from floating over text
  searchContainer: { 
    background: 'white', 
    padding: '15px 30px', 
    borderRadius: '50px', 
    boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
    textAlign: 'center',
    width: '80%',
    maxWidth: '500px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '0px' // Sits nicely inside the hero padding
  },
  searchHint: { color: '#888', fontSize: '0.85rem', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px' },

  // Layouts
  splitLayout: { display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '30px' },
  singleLayout: {},
  
  // Section Headers
  section: { marginBottom: '50px' },
  sectionHeader: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' },
  iconCirclePurple: { background: '#ede7f6', color: '#673ab7', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' },
  iconCircleGreen: { background: '#e8f5e9', color: '#2e7d32', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' },
  sectionTitle: { margin: 0, color: '#333', fontSize: '1.8rem' },

  iconCircleBlue: { background: '#e3f2fd', color: '#2980b9', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' },
audioGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
audioCard: { background: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: '5px solid #2980b9', position: 'relative', display: 'flex', flexDirection: 'column', gap: '15px' },
audioInfo: { paddingRight: '30px' }, // Leaves room for the delete button
audioTitle: { fontSize: '1.2rem', margin: '0 0 5px 0', color: '#2c3e50' },
audioPlayer: { width: '100%', outline: 'none' },

  // Video Cards
  videoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' },
  videoCard: { background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee' ,position: 'relative'},
  videoFrame: { background: 'black', height: '180px' },
  media: { width: '100%', height: '100%', objectFit: 'contain' },
  videoFooter: { padding: '15px' },
  videoTitle: { fontSize: '1.1rem', margin: '0 0 5px 0', color: '#2c3e50' },
  tags: { color: '#4A90E2', fontSize: '0.85rem' },

  // Photo Polaroids
  photoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '30px' },
  polaroid: { 
    background: 'white', 
    padding: '12px 12px 25px 12px', 
    boxShadow: '5px 5px 15px rgba(0,0,0,0.15)', 
    transform: 'rotate(-2deg)', 
    transition: 'transform 0.3s',
    position: 'relative'
  },
  tape: { 
    position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', 
    width: '40px', height: '100px', background: 'rgba(255,255,255,0.4)', 
    border: '1px solid rgba(0,0,0,0.05)', zIndex: 2 
  },
  imageBox: { width: '100%', height: '220px', background: '#333', overflow: 'hidden', border: '1px solid #eee' },
  photo: { width: '100%', height: '100%', objectFit: 'cover' },
  captionArea: { marginTop: '15px', textAlign: 'center' },
  handwritten: { fontFamily: '"Comic Sans MS", "Chalkboard SE", sans-serif', margin: '0 0 5px 0', color: '#333', fontSize: '1.1rem' },
  dateBadge: { display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fff0f0', color: '#c0392b', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem' },

  // Sidebar
  sidebar: { position: 'sticky', top: '100px' },
  sidebarCard: { background: 'white', borderRadius: '15px', padding: '5px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderTop: '5px solid #667eea', marginBottom: '20px' },
  sidebarHeader: { padding: '15px', borderBottom: '1px solid #eee', fontWeight: 'bold', fontSize: '1.1rem', color: '#444', display: 'flex', alignItems: 'center', gap: '8px' },
  tipCard: { background: '#fff8e1', padding: '15px', borderRadius: '10px', borderLeft: '4px solid #f1c40f', color: '#5d4037' },
  emptyState: { textAlign: 'center', padding: '40px', background: 'white', borderRadius: '15px', border: '2px dashed #ddd', color: '#999' }


};

export default Home;