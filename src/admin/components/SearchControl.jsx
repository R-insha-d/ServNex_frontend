import React from "react";
import { useEffect, useState } from "react";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";
import { useMap } from "react-leaflet";
import L from "leaflet";


function SearchControl({ setCoords, onSelect }) {
  const map = useMap();

  useEffect(() => {
    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: false,
      position: "topleft",
      placeholder: "Enter Nearest Junction Or City...",
    })
      .on("markgeocode", function (e) {
        const { center } = e.geocode;

        map.setView(center, 13);

        const selected = {
          latitude: center.lat,
          longitude: center.lng,
        };

        setCoords(selected);
        onSelect(selected);
      })
      .addTo(map);

    return () => map.removeControl(geocoder);
  }, [map, setCoords, onSelect]);

  return null;
}

export default SearchControl