import React from 'react';
import RoutineList from '../components/RoutineList';

const RoutinesPage = ({ user }) => {
  return (
    <div style={{maxWidth: '800px', margin: '0 auto', padding: '40px 20px'}}>
      <div style={{textAlign: 'center', marginBottom: '30px'}}>
        <h1 style={{color: '#2c3e50'}}>Daily Routine</h1>
        <p style={{color: '#7f8c8d'}}>Check off your tasks as you complete them.</p>
      </div>
      <RoutineList user={user} />
    </div>
  );
};

export default RoutinesPage;