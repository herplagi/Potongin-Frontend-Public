// src/components/LocationPicker.js
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet'; // Import L
import 'leaflet/dist/leaflet.css';

// --- FIX UNTUK IKON MARKER ---
// Pastikan ini didefinisikan SEBELUM komponen LocationPicker
// atau di file terpisah yang diimpor dulu
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});
// --------------------------------

// Komponen untuk menangani klik peta dan menampilkan marker
function LocationMarker({ onLocationChange }) {
  const [position, setPosition] = useState(null);
  const markerRef = useRef(null); // Gunakan ref untuk marker

  // Fungsi untuk menangani klik peta
  const map = useMapEvents({
    click(e) {
      console.log('Peta diklik di:', e.latlng);
      setPosition(e.latlng);
      onLocationChange(e.latlng); // Kirim latlng ke parent
      map.flyTo(e.latlng, 18); // Fokus ke lokasi yang diklik
    },
  });

  // Jika posisi berubah, update marker
  useEffect(() => {
    if (markerRef.current && position) {
      // Misalnya, jika kamu ingin marker tetap aktif di posisi terakhir yang diklik
      // Kita hanya perlu memastikan Marker di render dengan posisi yang benar
    }
  }, [position]);

  // Render marker jika ada posisi
  return position === null ? null : (
    <Marker position={position} ref={markerRef}>
      <Popup>Ini lokasi barbershop Anda.</Popup>
    </Marker>
  );
}

// Komponen Utama Peta
const LocationPicker = ({ initialLat, initialLng, onLocationChange }) => {
  // Gunakan state untuk center peta
  const [center, setCenter] = useState([initialLat || -0.9491, initialLng || 100.3552]); // Default ke Jakarta
  const mapRef = useRef(null);

  // Jika initialLat/initialLng berubah dari luar, update center
  useEffect(() => {
    if (initialLat !== undefined && initialLng !== undefined && initialLat !== null && initialLng !== null) {
      const newCenter = [initialLat, initialLng];
      setCenter(newCenter);
      // Jika peta sudah dimuat, fokus ke lokasi baru
      if (mapRef.current) {
        mapRef.current.setView(newCenter, 15);
      }
    }
  }, [initialLat, initialLng]);

  return (
    <div style={{ height: '400px', width: '100%', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '4px' }}>
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef} // Gunakan ref untuk mengakses map instance jika perlu
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationChange={onLocationChange} />
        {/* Tampilkan marker tambahan jika ada lokasi awal yang valid */}
        {initialLat !== null && initialLng !== null && initialLat !== undefined && initialLng !== undefined && (
          <Marker position={[initialLat, initialLng]}>
            <Popup>Lokasi saat ini</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default LocationPicker;