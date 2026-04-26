import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function LocationMarker({ setCoords }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setCoords({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      });
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
      <button className="btn btn-sm btn-primary mb-2" onClick={handleUseCurrent}>
        📍 Use Current Location
      </button>

      <MapContainer
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
      </MapContainer>

      {coords && (
        <p className="mt-2">
          Selected: {coords.latitude}, {coords.longitude}
        </p>
      )}
    </div>
  );
}