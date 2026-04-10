import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaCheckCircle, FaRegCircle, FaClock, FaPlus } from 'react-icons/fa';

const RoutineList = ({ user }) => {
  const [routines, setRoutines] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');

  // Fetch Routines
  const fetchRoutines = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/routines', {
        headers: { 'x-auth-token': token }
      });
      // Sort tasks: Incomplete first, then Completed
      const sorted = res.data.sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted));
      setRoutines(sorted);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchRoutines(); }, []);

  // Add Task (Caregiver Only)
  const addTask = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to add a task');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/routines', 
        { title: newTitle, time: newTime }, 
        { headers: { 'x-auth-token': token } }
      );
      setNewTitle(''); setNewTime(''); fetchRoutines();
    } catch (err) {
      console.error('Error adding task:', err);
      alert(err.response?.data?.msg || 'Error adding task');
    }
  };

  // Toggle Complete (Both can do this)
  const toggleTask = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`http://localhost:5000/api/routines/${id}`, {}, { headers: { 'x-auth-token': token } });
      fetchRoutines();
    } catch (err) {
      console.error('Error toggling task:', err);
      alert(err.response?.data?.msg || 'Error toggling task');
    }
  };

  // Delete Task (Caregiver Only)
  const deleteTask = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/routines/${id}`, { headers: { 'x-auth-token': token } });
      fetchRoutines();
    } catch (err) {
      console.error('Error deleting task:', err);
      alert(err.response?.data?.msg || 'Error deleting task');
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.header}>📝 Today's Routine</h3>

      {/* 1. CAREGIVER INPUT FORM */}
      {user.role === 'caregiver' && (
        <form onSubmit={addTask} style={styles.form}>
          <input 
            type="time" 
            value={newTime} 
            onChange={e => setNewTime(e.target.value)} 
            style={styles.timeInput} 
            required
          />
          <input 
            type="text" 
            placeholder="Task (e.g. Take Meds)" 
            value={newTitle} 
            onChange={e => setNewTitle(e.target.value)} 
            style={styles.textInput} 
            required
          />
          <button type="submit" style={styles.addBtn}><FaPlus /></button>
        </form>
      )}

      {/* 2. TASK LIST */}
      <div style={styles.list}>
        {routines.length === 0 && <p style={{color: '#aaa', fontStyle: 'italic'}}>No tasks for today.</p>}
        
        {routines.map(task => (
          <div key={task._id} style={task.isCompleted ? styles.cardDone : styles.card}>
            
            {/* CLICK TO TOGGLE */}
            <div onClick={() => toggleTask(task._id)} style={styles.contentArea}>
               <div style={{fontSize: '1.5rem', color: task.isCompleted ? '#27ae60' : '#ccc'}}>
                  {task.isCompleted ? <FaCheckCircle /> : <FaRegCircle />}
               </div>
               <div>
                  <div style={styles.timeBadge}><FaClock /> {task.time}</div>
                  <div style={task.isCompleted ? styles.titleDone : styles.title}>{task.title}</div>
               </div>
            </div>

            {/* DELETE BUTTON (Caregiver Only) */}
            {user.role === 'caregiver' && (
              <button onClick={() => deleteTask(task._id)} style={styles.deleteBtn}>
                <FaTrash />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Styles for the Clipboard Look
const styles = {
  container: { background: '#fff9c4', padding: '20px', borderRadius: '5px', boxShadow: '3px 3px 10px rgba(0,0,0,0.1)', borderTop: '8px solid #f1c40f' },
  header: { marginTop: 0, color: '#d35400', fontSize: '1.5rem' },
  form: { display: 'flex', gap: '5px', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px dashed #d35400' },
  timeInput: { padding: '8px', border: '1px solid #d35400', borderRadius: '4px', background: 'white' },
  textInput: { flex: 1, padding: '8px', border: '1px solid #d35400', borderRadius: '4px' },
  addBtn: { background: '#d35400', color: 'white', border: 'none', borderRadius: '4px', width: '40px', cursor: 'pointer' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  
  // Task Card Styles
  card: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '10px', borderRadius: '5px', borderLeft: '5px solid #3498db', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  cardDone: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ecf0f1', padding: '10px', borderRadius: '5px', borderLeft: '5px solid #bdc3c7', opacity: 0.7 },
  
  contentArea: { display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer', flex: 1 },
  timeBadge: { fontSize: '0.85rem', color: '#7f8c8d', display: 'flex', alignItems: 'center', gap: '4px' },
  title: { fontSize: '1.2rem', fontWeight: 'bold', color: '#2c3e50' },
  titleDone: { fontSize: '1.2rem', textDecoration: 'line-through', color: '#95a5a6' },
  deleteBtn: { background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '1rem', padding: '5px' }
};

export default RoutineList;