import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FaSearch } from 'react-icons/fa';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- SUB-COMPONENT: RE-CENTER MAP ---
// This handles the "Fly To" animation when a prop changes
const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 16, { animate: true, duration: 1.5 });
    }
  }, [lat, lng, map]);
  return null;
};

// We now accept 'places' and 'flyToCoords' from the parent (LocationsPage)
const PlacesMap = ({ user, places, fetchPlaces, flyToCoords }) => {
  const [newPlace, setNewPlace] = useState(null); 
  const [searchQuery, setSearchQuery] = useState('');
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // HANDLE MANUAL SEARCH (Geocoding)
  const handleSearch = async (e) => {
    e.preventDefault();
    if(!searchQuery) return;
    setIsSearching(true);
    try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
        if (res.data && res.data.length > 0) {
            const result = res.data[0];
            const lat = parseFloat(result.lat);
            const lng = parseFloat(result.lon);
            setNewPlace({ lat, lng });
            setFormName(searchQuery);
            setFormDesc(result.display_name.split(',')[0]);
        } else {
            alert("Location not found.");
        }
    } catch (err) { alert("Error searching."); } 
    finally { setIsSearching(false); }
  };

  // MAP CLICK HANDLER
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (user.role === 'caregiver') {
            setNewPlace({ lat: e.latlng.lat, lng: e.latlng.lng });
            setFormName(''); setFormDesc('');
        }
      },
    });
    return null;
  };

  // SAVE PLACE
  const savePlace = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
        await axios.post('http://localhost:5000/api/places', {
            name: formName, description: formDesc, lat: newPlace.lat, lng: newPlace.lng, type: 'general'
        }, { headers: { 'x-auth-token': token } });
        setNewPlace(null); setSearchQuery(''); fetchPlaces(); 
    } catch (err) { alert("Error saving place"); }
  };

  // DELETE PLACE
  const deletePlace = async (id) => {
      if(!window.confirm("Remove this place?")) return;
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/places/${id}`, { headers: { 'x-auth-token': token } });
      fetchPlaces();
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* SEARCH BAR (Caregiver Only) */}
      {user.role === 'caregiver' && (
        <form onSubmit={handleSearch} style={{display: 'flex', gap: '5px', marginBottom: '10px'}}>
            <input 
                type="text" 
                placeholder="Search address (e.g. City Hospital)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{flex: 1, padding: '8px', borderRadius: '5px', border: '1px solid #ccc'}}
            />
            <button type="submit" style={{background: '#4A90E2', color: 'white', border: 'none', borderRadius: '5px', padding: '0 15px', cursor: 'pointer'}}>
                {isSearching ? '...' : <FaSearch />}
            </button>
        </form>
      )}

      {/* MAP */}
      <div style={{flex: 1, borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd'}}>
        <MapContainer center={[20.5937, 78.9629]} zoom={4} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
            
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            <MapClickHandler />
            
            {/* Logic to fly to new pin OR fly to clicked list item */}
            {newPlace && <RecenterMap lat={newPlace.lat} lng={newPlace.lng} />}
            {flyToCoords && <RecenterMap lat={flyToCoords.lat} lng={flyToCoords.lng} />}

            {/* SAVED PLACES */}
            {places.map(place => (
                <Marker key={place._id} position={[place.lat, place.lng]}>
                    <Popup>
                        <strong>{place.name}</strong><br/>{place.description}<br/>
                        {user.role === 'caregiver' && (
                            <button onClick={() => deletePlace(place._id)} style={{color:'red', border:'none', background:'none', cursor:'pointer', padding:0, marginTop:'5px'}}>Remove</button>
                        )}
                    </Popup>
                </Marker>
            ))}

            {/* NEW PIN */}
            {newPlace && (
                <Marker position={[newPlace.lat, newPlace.lng]}>
                    <Popup autoPan={true}>
                        <form onSubmit={savePlace}>
                            <b>Add Location</b><br/>
                            <input placeholder="Name" value={formName} onChange={e=>setFormName(e.target.value)} required style={{width: '100%', marginBottom:'5px'}} /><br/>
                            <button type="submit" style={{width: '100%', background:'#27ae60', color:'white', border:'none', padding:'5px'}}>Save</button>
                        </form>
                    </Popup>
                </Marker>
            )}

        </MapContainer>
      </div>
    </div>
  );
};

export default PlacesMap;