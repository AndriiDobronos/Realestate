import L from "leaflet";
import "leaflet-control-geocoder";
import React, { useEffect, useRef, useState } from "react";

const COORDS_CACHE_KEY = "coordsCache";

interface MapProps {
    location?: string;
}

const Map: React.FC<MapProps> = ({ location }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const [mapReady, setMapReady] = useState(false);

    // ── Map initialization ────────────────────────────────────────────────────
    // Uses a ref for the container div — no shared id="map" that would conflict
    // with LeafletMaps on the Home page during React route transitions.
    useEffect(() => {
        if (!containerRef.current) return;
        const map = L.map(containerRef.current).setView([50.006, 36.23], 11);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        mapRef.current = map;
        setMapReady(true);
        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // ── Geocode location and add marker ──────────────────────────────────────
    useEffect(() => {
        const map = mapRef.current;
        if (!mapReady || !map || !location) return;

        let cancelled = false;

        const fetchLocation = async () => {
            let cache: Record<string, { lat: number; lon: number }> = {};
            try {
                cache = JSON.parse(localStorage.getItem(COORDS_CACHE_KEY) || "{}");
            } catch { /* use empty cache */ }

            let coords: { lat: number; lon: number } | null = null;

            if (cache[location]) {
                coords = cache[location];
            } else {
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
                    );
                    const results = await response.json();
                    if (!results.length) {
                        console.warn("Location not found:", location);
                        return;
                    }
                    coords = {
                        lat: parseFloat(results[0].lat),
                        lon: parseFloat(results[0].lon),
                    };
                    cache[location] = coords;
                    localStorage.setItem(COORDS_CACHE_KEY, JSON.stringify(cache));
                } catch {
                    console.warn("Geocoding failed for:", location);
                    return;
                }
            }

            if (!coords || cancelled) return;
            map.setView([coords.lat, coords.lon], 13);
            L.marker([coords.lat, coords.lon]).addTo(map).bindPopup(location).openPopup();
        };

        fetchLocation();
        return () => { cancelled = true; };
    }, [mapReady, location]);

    return (
        <div
            ref={containerRef}
            style={{ height: "100%", width: "100%", zIndex: "10", border: "0px solid transparent" }}
        />
    );
};

export default Map;
