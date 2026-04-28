import L from "leaflet";
import "leaflet-control-geocoder";
import React, { useEffect, useState } from "react";

interface MapProps {
    location?: string;
}

const Map: React.FC<MapProps> = ({ location }) => {
    const [map, setMap] = useState<L.Map | null>(null);

    useEffect(() => {
        const newMap = L.map("map").setView([50.006, 36.23], 11);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(newMap);

        setMap(newMap);
        return () => newMap.remove();
    }, []);

    useEffect(() => {
        if (!location || !map) return;

        const fetchLocation = async () => {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`);
            const results = await response.json();

            if (results.length > 0) {
                const { lat, lon } = results[0];
                map.setView([lat, lon], 13);
                L.marker([lat, lon]).addTo(map).bindPopup(location).openPopup();
            } else {
                console.log("Location not found");
            }
        };

        fetchLocation();
    }, [location, map]); // Следит за изменениями location и map

    return (
            <div id="map" style={{height:"100%",width:"100%",zIndex:"10",border:"2px solid black"}}></div>
    );
};

export default Map;
