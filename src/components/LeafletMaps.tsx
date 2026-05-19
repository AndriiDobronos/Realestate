import { useEffect, useRef, useState, useMemo, memo } from "react";
import { motion, AnimatePresence } from "motion/react";
import L from "leaflet";
import "leaflet-control-geocoder";
import { IFilterMapState } from "../features/filterMap/filterMapSlice";

interface ListingMarker {
    _id: string;
    listingType: string;
    propertyType: string;
    price: number | string;
    location: string;
}

const COORDS_CACHE_KEY = "coordsCache";
const GEOCODE_DELAY_MS = 1200; // Nominatim usage policy: max 1 req/sec

function readCoordsCache(): Record<string, { lat: number; lon: number }> {
    try { return JSON.parse(localStorage.getItem(COORDS_CACHE_KEY) || "{}"); }
    catch { return {}; }
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const sleep = (ms: number): Promise<void> => new Promise(r => setTimeout(r, ms));

function formatPrice(price: number | string, isSale: boolean): string {
    if (!isSale) return String(price);
    const n = Number(price);
    if (!isNaN(n) && n >= 1000) return `${+(n / 1000).toFixed(1)}k`;
    return String(price);
}

function buildMarker(listing: ListingMarker, lat: number, lon: number): L.Marker {
    const isSale = listing.listingType !== "rent";
    const bgColor = isSale ? "#F59E0B" : "#2563EB";
    const displayPrice = formatPrice(listing.price, isSale);
    return L.marker([lat, lon], {
        icon: L.divIcon({
            className: "relative",
            html: `<div style="color:white;padding:2px 6px;border-radius:4px;font-weight:bold;font-size:12px;white-space:nowrap;position:absolute;z-index:1000;background:${bgColor}">₴${displayPrice}</div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
        }),
    }).bindPopup(`
        <div>
            <strong>${listing.propertyType}</strong><br/>
            ₴${displayPrice}<br/>
            <a href="/details/${listing._id}" style="font-weight:bold"
               onmouseover="this.style.textDecoration='underline';this.style.color='blue'"
               onmouseout="this.style.textDecoration='none';this.style.color=''">View details</a>
        </div>
    `);
}

const defaultFilter: IFilterMapState = { listingType: '', rangeValue: 20, destination: '', propertyType: '' };

const LeafletMaps = ({
    listings,
    formMapFilter = defaultFilter,
    isVisible = false,
}: {
    listings: ListingMarker[];
    formMapFilter?: IFilterMapState;
    isVisible?: boolean;
}) => {
    const containerRef    = useRef<HTMLDivElement>(null);
    const mapRef          = useRef<L.Map | null>(null);
    const markerGroupRef  = useRef<L.FeatureGroup | null>(null);
    const circleRef       = useRef<L.Circle | null>(null);
    const centerMarkerRef = useRef<L.Marker | null>(null);
    const [mapReady, setMapReady] = useState(false);

    const listingsReady = listings.length > 0;

    // Prevents geocoding re-run when the parent passes a new formMapFilter object
    // reference but with identical values (e.g. unrelated Redux dispatch).
    const filterKey = useMemo(() => JSON.stringify(formMapFilter), [formMapFilter]);

    // ── Map initialization ────────────────────────────────────────────────────
    // Uses a ref for the container div so there is no shared id="map" that could
    // conflict with the Map component on the Details page during navigation.
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
            setMapReady(false);
        };
    }, []);

    // ── Recalculate tile layout after CSS transition ──────────────────────────
    useEffect(() => {
        if (!isVisible || !mapRef.current) return;
        const t = setTimeout(() => mapRef.current?.invalidateSize(), 300);
        return () => clearTimeout(t);
    }, [isVisible]);

    // ── Geocode & render markers ──────────────────────────────────────────────
    useEffect(() => {
        const map = mapRef.current;
        if (!mapReady || !map || !listings.length) return;

        let cancelled = false;

        const render = async () => {
            const filter: typeof formMapFilter = JSON.parse(filterKey);
            const isFilterEmpty =
                !filter.destination && !filter.listingType && !filter.propertyType;
            const effectiveRange: number = isFilterEmpty ? Infinity : filter.rangeValue;

            // ── Resolve map center ──────────────────────────────────────────
            let centerLat = 50.006; // default: Kharkiv
            let centerLon = 36.23;

            if (!isFilterEmpty && filter.destination) {
                try {
                    const r = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(filter.destination)}`
                    );
                    const hits = await r.json();
                    if (hits.length > 0) {
                        centerLat = parseFloat(hits[0].lat);
                        centerLon = parseFloat(hits[0].lon);
                    }
                } catch { /* stay at Kharkiv default */ }
            }

            if (cancelled) return;

            // ── Clear previous overlay ──────────────────────────────────────
            if (markerGroupRef.current)  { map.removeLayer(markerGroupRef.current);  markerGroupRef.current  = null; }
            if (circleRef.current)       { map.removeLayer(circleRef.current);        circleRef.current       = null; }
            if (centerMarkerRef.current) { map.removeLayer(centerMarkerRef.current);  centerMarkerRef.current = null; }

            map.setView([centerLat, centerLon], isFilterEmpty ? 11 : 12);

            if (!isFilterEmpty) {
                circleRef.current = L.circle([centerLat, centerLon], {
                    radius: effectiveRange * 1000,
                    color: "#3b82f6",
                    fillColor: "#93c5fd",
                    fillOpacity: 0.16,
                }).addTo(map);

                centerMarkerRef.current = L.marker([centerLat, centerLon], {
                    icon: L.divIcon({
                        className: "center-marker",
                        html: `<div style="background:#3b82f6;width:12px;height:12px;border-radius:50%;border:2px solid white"></div>`,
                        iconSize: [16, 16],
                        iconAnchor: [8, 8],
                    }),
                }).addTo(map);
            }

            // ── Filter predicate ────────────────────────────────────────────
            const passes = (listing: ListingMarker, lat: number, lon: number): boolean =>
                haversineKm(centerLat, centerLon, lat, lon) <= effectiveRange &&
                (!filter.listingType  || listing.listingType  === filter.listingType) &&
                (!filter.propertyType || listing.propertyType === filter.propertyType);

            // ── Phase 1: render all cached addresses immediately ────────────
            const cache = readCoordsCache();
            const toGeocode: typeof listings = [];
            const immediateMarkers: L.Marker[] = [];

            for (const listing of listings) {
                if (!listing.location) continue;
                const hit = cache[listing.location];
                if (hit) {
                    if (passes(listing, hit.lat, hit.lon)) {
                        immediateMarkers.push(buildMarker(listing, hit.lat, hit.lon));
                    }
                } else {
                    toGeocode.push(listing);
                }
            }

            if (immediateMarkers.length > 0) {
                markerGroupRef.current = L.featureGroup(immediateMarkers).addTo(map);
            }

            if (cancelled || !toGeocode.length) return;

            // ── Phase 2: geocode missing addresses, rate-limited ─────────────
            let cacheUpdated = false;

            for (const listing of toGeocode) {
                if (cancelled) break;
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(listing.location)}`
                    );
                    if (res.ok) {
                        const hits = await res.json();
                        if (hits.length > 0) {
                            const lat = parseFloat(hits[0].lat);
                            const lon = parseFloat(hits[0].lon);
                            cache[listing.location] = { lat, lon };
                            cacheUpdated = true;

                            if (!cancelled && passes(listing, lat, lon)) {
                                const marker = buildMarker(listing, lat, lon);
                                if (!markerGroupRef.current) {
                                    markerGroupRef.current = L.featureGroup([marker]).addTo(map);
                                } else {
                                    markerGroupRef.current.addLayer(marker);
                                }
                            }
                        }
                    }
                } catch { /* skip address */ }

                // Respect Nominatim rate limit between requests
                await sleep(GEOCODE_DELAY_MS);
            }

            if (cacheUpdated) {
                localStorage.setItem(COORDS_CACHE_KEY, JSON.stringify(cache));
            }
        };

        render();
        return () => { cancelled = true; };
    }, [mapReady, listings, filterKey]);

    return (
        <div className="text-left">
            <div className="relative">
                <div
                    ref={containerRef}
                    style={{
                        height: "600px",
                        minWidth: "258px",
                        border: "2px solid black",
                        borderRadius: "10px",
                        zIndex: "20",
                    }}
                />

                {/* Loading overlay — visible until listings arrive from server */}
                <AnimatePresence>
                {!listingsReady && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7 }}
                        className="absolute inset-0 flex flex-col items-center justify-end pb-[18%]"
                        style={{ borderRadius: "10px", zIndex: 2000 }}
                    >
                        {/* House drop + ripple rings */}
                        <div className="relative flex flex-col items-center gap-4">
                            <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
                                {/* Ripple rings */}
                                {[0, 0.6].map((delay, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute rounded-full"
                                        style={{ width: 208, height: 208, border: "2px solid rgba(37, 99, 235, 0.65)" }}
                                        animate={{ scale: [0, 2.8], opacity: [0.7, 0] }}
                                        transition={{ repeat: Infinity, duration: 1.6, delay, ease: "easeOut" }}
                                    />
                                ))}
                                {/* Falling house */}
                                <motion.div
                                    animate={{
                                        y: [-560, 0, 0, -20],
                                        scaleY: [1, 1, 0.70, 1],
                                        scaleX: [1, 1, 1.30, 1],
                                        opacity: [0, 1, 1, 0],
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 2.6,
                                        times: [0, 0.34, 0.48, 1],
                                        ease: ["easeIn", "linear", "easeOut"],
                                        repeatDelay: 0.2,
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" height="216px" viewBox="0 0 24 24" width="216px" fill="#2563EB">
                                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                                    </svg>
                                </motion.div>
                            </div>

                            {/* Pulsing dots */}
                            <div className="flex items-center gap-5">
                                {[0, 0.25, 0.5].map((delay, i) => (
                                    <motion.span
                                        key={i}
                                        className="w-8 h-8 rounded-full inline-block"
                                        style={{ background: "#2563EB" }}
                                        animate={{ opacity: [0.15, 1, 0.15] }}
                                        transition={{ repeat: Infinity, duration: 1.2, delay, ease: "easeInOut" }}
                                    />
                                ))}
                            </div>
                        </div>

                    </motion.div>
                )}
                </AnimatePresence>
            </div>

            {/* Progress bar below map */}
            <AnimatePresence>
            {!listingsReady ? (
                <motion.div
                    className="mt-2 h-4 bg-slate-200 rounded-full overflow-hidden"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className="h-full bg-blue-500 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "80%" }}
                        transition={{ duration: 28, ease: "easeOut" }}
                    />
                </motion.div>
            ) : (
                <div className="h-6" />
            )}
            </AnimatePresence>
        </div>
    );
};

export default memo(LeafletMaps);
