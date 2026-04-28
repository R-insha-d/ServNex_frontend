import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import SearchControl from "./SearchControl";

function LocationMarker({ setCoords, onSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);

      const selected = {
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      };

      setCoords(selected);
      onSelect(selected);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function LocationPicker({ onSelect }) {
  const [coords, setCoords] = useState(null);

  const handleUseCurrent = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const current = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      setCoords(current);
      onSelect(current);
    });
  };

  return (
    <div>
      <style>{`
  .custom-btn {
    background: linear-gradient(135deg, #007bff, #00c6ff);
    color: white;
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }

  .custom-btn:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.25);
    background: linear-gradient(135deg, #0056b3, #0096c7);
  }

  .custom-btn:active {
    transform: scale(0.97);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  }
`}</style>

      <button className="custom-btn mb-2" onClick={handleUseCurrent}>
        📍 Use Current Location
      </button>

      {/* <MapContainer
        center={[11.2588, 75.7804]} // Kozhikode default
        zoom={13}
        style={{ height: "300px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker setCoords={(c) => {
          setCoords(c);
          onSelect(c);
        }} />
      </MapContainer> */}
      <MapContainer
        center={[11.2588, 75.7804]}
        zoom={13}
        style={{ height: "300px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <SearchControl 
          setCoords={setCoords}
          onSelect={onSelect}
        />

        <LocationMarker
          setCoords={setCoords}
          onSelect={onSelect}
        />
      </MapContainer>

      {coords && (
        <p className="mt-2">
          Selected: {coords.latitude}, {coords.longitude}
        </p>
      )}
    </div>
  );
}