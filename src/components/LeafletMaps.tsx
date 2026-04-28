import { useEffect, useState } from "react";
import { useRef } from "react";
//import PopupContainer from "./PopupContainer";
//import ReactDOM from "react-dom/client";
import L from "leaflet";
import "leaflet-control-geocoder";
//import { fetchListings } from "../services/ListingService";
import "./LeafletMaps.css";

const LeafletMaps = ({ listings, formMapFilter }:{listings:any,formMapFilter:any}) => {
    const markerGroupRef = useRef(null);
    const circleRef = useRef(null);
    const centerMarkerRef = useRef(null);
    const [map, setMap] = useState(null);
    //const [listings, setListings] = useState([]);
    //const [filteredListings, setFilteredListings] = useState([]);

    useEffect(() => {
        const newMap = L.map("map").setView([50.006, 36.23], 11);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(newMap);

        setMap(newMap);
        return () => newMap.remove();
    }, []);

    useEffect(() => {
        if (!map || !listings.length) return;

        const geocodeAndFilter = async () => {
            const coordsCache = JSON.parse(localStorage.getItem("coordsCache") || "{}");
            //let centerLat = 50.006, centerLon = 36.23;
            let centerLat, centerLon;
            let isDestinationValid = true;
            const isFilterEmpty =
                !formMapFilter.destination &&
                !formMapFilter.listingType &&
                !formMapFilter.propertyType;

            // Геокодируем центр по formMapFilter.destination
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${formMapFilter.destination}`);
                const results = await response.json();

                if (markerGroupRef.current) {
                    markerGroupRef.current.clearLayers();
                }
                if (circleRef.current) {
                    map.removeLayer(circleRef.current);
                }
                if (centerMarkerRef.current) {
                    map.removeLayer(centerMarkerRef.current);
                }
                if (isFilterEmpty) {
                    centerLat = 50.006;  // Центр по умолчанию — Харьков
                    centerLon = 36.23;
                    formMapFilter.rangeValue = 9999; // показываем всё в большом радиусе
                }
                if (results.length > 0) {
                    centerLat = parseFloat(results[0].lat);
                    centerLon = parseFloat(results[0].lon);
                } else {
                    isDestinationValid = false;
                    throw new Error("Invalid destination");
                }
            } catch (e) {
                console.warn("Fallback to Kharkiv due to invalid destination");
            }

            map.setView([centerLat, centerLon], 12);

            // маркировка радиуса
            const radiusCircle = L.circle([centerLat, centerLon], {
                radius: formMapFilter.rangeValue * 1000,
                color: '#3b82f6',
                fillColor: '#93c5fd',
                fillOpacity: 0.16,
            }).addTo(map);
            circleRef.current = radiusCircle;

            // маркировка центра
            const centerMarker = L.marker([centerLat, centerLon], {
                icon: L.divIcon({
                    className: 'center-marker',
                    html: `<div style="background:#3b82f6;width:12px;height:12px;border-radius:50%;border:2px solid white"></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                }),
            }).addTo(map);
            centerMarkerRef.current = centerMarker;

            // Вычисление расстояния через Haversine
            const toRadians = deg => (deg * Math.PI) / 180;
            const getDistanceKm = (lat1, lon1, lat2, lon2) => {
                const R = 6371;
                const dLat = toRadians(lat2 - lat1);
                const dLon = toRadians(lon2 - lon1);
                const a =
                    Math.sin(dLat / 2) ** 2 +
                    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
                    Math.sin(dLon / 2) ** 2;
                return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            };

            const markers = [];

            for (const listing of listings) {
                const address = listing.location;
                if (!address) continue;

                let lat, lon;

                if (coordsCache[address]) {
                    ({ lat, lon } = coordsCache[address]);
                } else {
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`);
                        const results = await response.json();
                        if (results.length > 0) {
                            lat = results[0].lat;
                            lon = results[0].lon;
                            coordsCache[address] = { lat, lon };
                        } else {
                            continue;
                        }
                    } catch {
                        continue;
                    }
                }

                const distance = getDistanceKm(centerLat, centerLon, lat, lon);
                const insideRange = distance <= formMapFilter.rangeValue;

                const matchesFilter =
                    (!formMapFilter.listingType || listing.listingType === formMapFilter.listingType) &&
                    (!formMapFilter.propertyType || listing.propertyType === formMapFilter.propertyType);

                if (insideRange && matchesFilter) {
                    const marker = L.marker([lat, lon], {
                        icon: L.divIcon({
                            className: "custom-marker",
                            html: `<div class="price-tag">$${listing.price}</div>`,
                            iconSize: [40, 40],
                            iconAnchor: [20, 40],
                        }),
                    }).addTo(map)
                        .bindPopup(`
            <div>
              <strong>${listing.propertyType}</strong><br/>
              $${listing.price}<br/>
              <a href="/details/${listing._id}" id="a">View details</a>
            </div>
          `);

                    markers.push(marker);
                }
            }

            // if (markers.length > 0) {
            //     //отображает искомые элементы за счет масштаба карты при этом остальные тоже можно увидеть изменив масштаб карты
            //     const group = L.featureGroup(markers);
            //     map.fitBounds(group.getBounds());
            // }
            if (markers.length > 0) {
                const group = L.featureGroup(markers).addTo(map);
                markerGroupRef.current = group;
            }

            localStorage.setItem("coordsCache", JSON.stringify(coordsCache));

            if (!isDestinationValid) {
                alert("⚠ The location you entered is invalid. Defaulted to Kharkiv.");
            }
        };

        geocodeAndFilter();
    }, [map, listings, formMapFilter]);

    return (
        <div className="text-left">
            <div id="map" style={{ height: "600px", minWidth: "258px", border:"2px solid black",borderRadius:"10px",zIndex:"20" }}></div>
            {/*{width: "758px"}*/}
        </div>
    );
};

export default LeafletMaps;