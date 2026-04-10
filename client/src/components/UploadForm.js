import React, { useState } from 'react';
import axios from 'axios';

const UploadForm = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append('media', file); // Field name 'media' matches backend
    formData.append('title', title);
    formData.append('tags', tags);

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/memories', formData, {
        headers: { 
            'Content-Type': 'multipart/form-data',
            'x-auth-token': token 
        }
      });
      setLoading(false);
      onUploadSuccess(); // Refresh parent
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Upload failed");
    }
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
      <input 
        type="text" 
        placeholder="Title (e.g. Birthday)" 
        value={title} 
        onChange={e => setTitle(e.target.value)} 
        required 
        style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}}
      />
      <input 
        type="text" 
        placeholder="Tags (comma separated)" 
        value={tags} 
        onChange={e => setTags(e.target.value)} 
        style={{padding: '8px', border: '1px solid #ccc', borderRadius: '4px'}}
      />
      {/* Updated Input: Accepts Images AND Videos */}
      <input 
        type="file" 
        onChange={e => setFile(e.target.files[0])}
        accept="image/*, video/*" 
        style={{padding: '5px'}}
      />
      <button 
        onClick={handleSubmit} 
        disabled={loading}
        style={{padding: '10px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}
      >
        {loading ? 'Uploading...' : 'Save Memory'}
      </button>
    </div>
  );
};

export default UploadForm;