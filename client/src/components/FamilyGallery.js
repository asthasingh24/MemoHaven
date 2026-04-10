import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserFriends, FaTrash } from 'react-icons/fa'; // Added FaTrash

// Pass user as a prop
const FamilyGallery = ({ user }) => { 
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchFamily = async () => {
      try {
        const familyCode = localStorage.getItem('familyCode');
        const res = await axios.get(`http://localhost:5000/api/familyMembers?familyCode=${familyCode}`);
        setMembers(res.data);
      } catch (err) { console.error("Failed to load family members", err); }
    };
    fetchFamily();
  }, []);

  // DELETE FUNCTION
  const deleteMember = async (id) => {
    if (!window.confirm("Remove this family member?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/familyMembers/${id}`, {
        headers: { 'x-auth-token': token }
      });
      // Remove from UI immediately without refreshing
      setMembers(members.filter(m => m._id !== id)); 
    } catch (err) { alert("Failed to delete member"); }
  };

  if (members.length === 0) return null; 

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <div style={styles.iconCircle}>
          <FaUserFriends />
        </div>
        <h2 style={styles.title}>My Family</h2>
      </div>

      <div style={styles.grid}>
        {members.map(member => (
          <div key={member._id} style={styles.card}>
            
            {/* CAREGIVER DELETE BUTTON */}
            {user?.role === 'caregiver' && (
              <button onClick={() => deleteMember(member._id)} style={styles.deleteBtn} title="Delete Member">
                <FaTrash />
              </button>
            )}

            <div style={styles.imageWrapper}>
              <img src={member.imageUrl} alt={member.name} style={styles.image} />
            </div>
            <div style={styles.info}>
              <h3 style={styles.name}>{member.name}</h3>
              <p style={styles.relation}>{member.relation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  section: { marginBottom: '50px' },
  header: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' },
  iconCircle: { background: '#e3f2fd', color: '#3498db', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' },
  title: { margin: 0, color: '#333', fontSize: '1.8rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px' },
  card: { position: 'relative', background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eee', textAlign: 'center', transition: 'transform 0.2s' },
  deleteBtn: { position: 'absolute', top: '10px', right: '10px', background: 'rgba(231, 76, 60, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  imageWrapper: { width: '100%', height: '220px', overflow: 'hidden', background: '#f8f9fa' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  info: { padding: '15px' },
  name: { margin: '0 0 5px 0', fontSize: '1.3rem', color: '#2c3e50' },
  relation: { margin: 0, fontSize: '1rem', color: '#7f8c8d', fontWeight: 'bold' }
};

export default FamilyGallery;