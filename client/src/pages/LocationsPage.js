import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMapMarkerAlt, FaLocationArrow, FaTrash } from 'react-icons/fa';
import PlacesMap from '../components/PlacesMap';

const LocationsPage = ({ user }) => {
  const [places, setPlaces] = useState([]);
  const [targetCoords, setTargetCoords] = useState(null);

  // We lift the fetch logic here so both the List and the Map share the data
  const fetchPlaces = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/places', { headers: { 'x-auth-token': token } });
      setPlaces(res.data);
    } catch (err) { console.error(err); }
  };

  const deletePlaceList = async (e, id) => {
    e.stopPropagation(); // Prevents map from flying to the location when you click delete
    if(!window.confirm("Remove this place?")) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/places/${id}`, { headers: { 'x-auth-token': token } });
      fetchPlaces(); // Refresh the list
    } catch (err) { alert("Error deleting place"); }
  };

  useEffect(() => { fetchPlaces(); }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={{margin: 0, color: '#2c3e50'}}>Safe Locations</h1>
        <p style={{color: '#7f8c8d'}}>
           {user.role === 'caregiver' ? "Manage safe zones for your patients." : "Click a name to find it on the map."}
        </p>
      </div>

      <div style={styles.grid}>
        
        {/* LEFT: THE MAP */}
        <div style={styles.mapSection}>
           <PlacesMap 
              user={user} 
              places={places} 
              fetchPlaces={fetchPlaces} 
              flyToCoords={targetCoords} // Pass the target coordinates down
           />
        </div>

        {/* RIGHT: THE LIST OF PLACES */}
        <div style={styles.listSection}>
           <h3 style={styles.listHeader}>Saved Places</h3>
           {places.length === 0 ? <p style={{color:'#ccc', fontStyle:'italic'}}>No places added yet.</p> : (
               <div style={styles.scrollList}>
                   {places.map(place => (
                       <div 
                          key={place._id} 
                          onClick={() => setTargetCoords({ lat: place.lat, lng: place.lng })}
                          style={styles.listItem}
                       >
                           <div style={styles.iconBox}><FaMapMarkerAlt /></div>
                           <div>
                               <div style={styles.placeName}>{place.name}</div>
                               <div style={styles.placeDesc}>{place.description}</div>
                           </div>
                           {user.role === 'caregiver' ? (
    <button onClick={(e) => deletePlaceList(e, place._id)} style={{background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', marginLeft: 'auto'}}>
        <FaTrash />
    </button>
) : (
    <div style={styles.arrow}><FaLocationArrow /></div>
)}
                       </div>
                   ))}
               </div>
           )}
        </div>

      </div>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
  header: { marginBottom: '20px', background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  grid: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', height: '600px' }, // Layout Split
  
  mapSection: { background: 'white', borderRadius: '15px', padding: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' },
  
  listSection: { background: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  listHeader: { marginTop: 0, paddingBottom: '10px', borderBottom: '1px solid #eee', color: '#2c3e50' },
  scrollList: { overflowY: 'auto', flex: 1, paddingRight: '5px' },
  
  listItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', transition: 'background 0.2s', borderRadius: '8px' },
  // listItem:hover logic is handled by CSS usually, but here inline allows simplicity
  iconBox: { color: '#e74c3c', fontSize: '1.2rem' },
  placeName: { fontWeight: 'bold', color: '#333' },
  placeDesc: { fontSize: '0.85rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' },
  arrow: { marginLeft: 'auto', color: '#ddd', fontSize: '0.9rem' }
};

export default LocationsPage;