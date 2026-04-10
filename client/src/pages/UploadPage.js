import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaCloudUploadAlt, FaTags, FaPen, FaUserFriends, FaIdBadge, FaHeart, FaMicrophone } from 'react-icons/fa';

const UploadPage = () => {
  const navigate = useNavigate();
  
  // --- STATE FOR GENERAL MEMORIES ---
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  // --- STATE FOR FAMILY VAULT ---
  const [famName, setFamName] = useState('');
  const [famRelation, setFamRelation] = useState('');
  const [famFile, setFamFile] = useState(null);
  const [famPreview, setFamPreview] = useState(null);
  const [famLoading, setFamLoading] = useState(false);

  // Handle Memory File Change
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 50 * 1024 * 1024) {
        alert("File is too big! Max 50MB.");
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  // Handle Family Photo Change
  const handleFamFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFamFile(selected);
      setFamPreview(URL.createObjectURL(selected));
    }
  };

  // Submit General Memory
  const handleMemorySubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");
    setLoading(true);
    
    const formData = new FormData();
    formData.append('media', file);
    formData.append('title', title);
    formData.append('tags', tags);

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/memories', formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token }
      });
      setLoading(false);
      navigate('/'); 
    } catch (err) {
      setLoading(false);
      alert(err.response?.data?.msg || "Upload failed.");
    }
  };

  // Submit Family Member
  const handleFamilySubmit = async (e) => {
    e.preventDefault();
    if (!famFile || !famName || !famRelation) return alert("Fill all family fields");
    setFamLoading(true);

    const formData = new FormData();
    formData.append('media', famFile); // Reusing media upload logic
    formData.append('name', famName);
    formData.append('relation', famRelation);

    try {
      const token = localStorage.getItem('token');
      // Sending to your new familyMembers route
      await axios.post('http://localhost:5000/api/familyMembers', formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token }
      });
      setFamLoading(false);
      alert(`${famName} added to Family Vault!`);
      setFamName(''); setFamRelation(''); setFamFile(null); setFamPreview(null);
    } catch (err) {
      setFamLoading(false);
      alert("Family upload failed.");
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.splitLayout}>
        
        {/* LEFT COLUMN: GENERAL MEMORY */}
        <div style={styles.card}>
          <div style={styles.header}>
            <FaCloudUploadAlt style={styles.mainIcon} />
            <h2>New General Memory</h2>
            <p>Upload scenery, events, or trips.</p>
          </div>

          <form onSubmit={handleMemorySubmit} style={styles.form}>
            <div style={styles.dropzone}>
              {preview ? (
                file.type.startsWith('video') ? 
                <video src={preview} style={styles.previewMedia} controls /> : 
                file.type.startsWith('audio') ? 
              <audio src={preview} style={{ width: '90%' }} controls /> :
                <img src={preview} alt="Preview" style={styles.previewMedia} />
              ) : (
                <div style={styles.placeholder}>
                  <FaCloudUploadAlt size={40} />
                  <p>Select Photo, Video, or Audio</p>
                </div>
              )}
              <input type="file" onChange={handleFileChange} accept="image/*, video/*, audio/*" style={styles.fileInput} />
            </div>

            <div style={styles.inputGroup}>
              <label>Memory Title</label>
              <div style={styles.inputWrapper}><FaPen style={styles.icon}/><input type="text" value={title} onChange={e=>setTitle(e.target.value)} required style={styles.input} /></div>
            </div>

            <div style={styles.inputGroup}>
              <label>Tags</label>
              <div style={styles.inputWrapper}><FaTags style={styles.icon}/><input type="text" value={tags} onChange={e=>setTags(e.target.value)} style={styles.input} /></div>
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Uploading...' : 'Save Memory'}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: FAMILY VAULT */}
        <div style={{...styles.card, borderTop: '6px solid #3498db'}}>
          <div style={styles.header}>
            <FaUserFriends style={{...styles.mainIcon, color: '#3498db'}} />
            <h2>Family Vault</h2>
            <p>Register specific relatives for recognition.</p>
          </div>

          <form onSubmit={handleFamilySubmit} style={styles.form}>
            <div style={{...styles.dropzone, height: '150px', minHeight: '150px'}}>
              {famPreview ? (
                <img src={famPreview} alt="Relative" style={styles.previewMedia} />
              ) : (
                <div style={styles.placeholder}>
                  <FaIdBadge size={30} />
                  <p>Relative's Photo</p>
                </div>
              )}
              <input type="file" onChange={handleFamFileChange} accept="image/*" style={styles.fileInput} />
            </div>

            <div style={styles.inputGroup}>
              <label>Full Name</label>
              <div style={styles.inputWrapper}><FaPen style={styles.icon}/><input type="text" value={famName} onChange={e=>setFamName(e.target.value)} required style={styles.input} /></div>
            </div>

            <div style={styles.inputGroup}>
              <label>Relation (e.g. Son, Daughter)</label>
              <div style={styles.inputWrapper}><FaHeart style={styles.icon}/><input type="text" value={famRelation} onChange={e=>setFamRelation(e.target.value)} required style={styles.input} /></div>
            </div>

            <button type="submit" disabled={famLoading} style={{...styles.submitBtn, background: '#3498db'}}>
              {famLoading ? 'Saving...' : 'Add to Family'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

const styles = {
  pageWrapper: { padding: '40px 20px', background: '#f0f2f5', minHeight: '90vh' },
  splitLayout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', maxWidth: '1200px', margin: '0 auto' },
  card: { background: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' },
  header: { textAlign: 'center', marginBottom: '25px' },
  mainIcon: { fontSize: '2.5rem', color: '#27ae60', marginBottom: '10px' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  dropzone: { border: '2px dashed #ddd', borderRadius: '12px', position: 'relative', minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdfdfd', overflow: 'hidden' },
  placeholder: { textAlign: 'center', color: '#bbb' },
  fileInput: { position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer' },
  previewMedia: { width: '100%', height: '100%', objectFit: 'cover' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  inputWrapper: { display: 'flex', alignItems: 'center', border: '1px solid #eee', borderRadius: '8px', padding: '10px', background: '#f9f9f9' },
  icon: { color: '#aaa', marginRight: '10px' },
  input: { border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.95rem' },
  submitBtn: { padding: '14px', borderRadius: '8px', border: 'none', color: 'white', background: '#27ae60', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: '0.3s' }
};

export default UploadPage;
