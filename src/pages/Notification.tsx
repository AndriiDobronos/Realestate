import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import { setNotificationProperty } from "../features/notification/notificationSlice";
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { RootState } from "../app/store";
import L from "leaflet";
import "leaflet-control-geocoder";

/* ── Sub-components ──────────────────────────────────────────────── */

type ChipProps = {
    name: string;
    value: string;
    label: string;
    selected: boolean;
    onSelect: (name: string, value: string) => void;
};

const RadioChip: React.FC<ChipProps> = ({ name, value, label, selected, onSelect }) => (
    <button
        type="button"
        onClick={() => onSelect(name, value)}
        className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 cursor-pointer !shadow-none ${
            selected
                ? 'text-white border-[#2563EB]'
                : 'text-gray-600 border-gray-200 hover:border-[#2563EB] hover:text-[#2563EB]'
        }`}
        style={{ background: selected ? '#2563EB' : 'white' }}
    >
        {label}
    </button>
);

type RangeFieldProps = {
    label: string;
    nameMin: string;
    nameMax: string;
    valMin: string;
    valMax: string;
    placeholderMin: string;
    placeholderMax: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const inputCls = "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#0F172A] placeholder-[#94a3b8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition-all duration-200";

const RangeField: React.FC<RangeFieldProps> = ({ label, nameMin, nameMax, valMin, valMax, placeholderMin, placeholderMax, onChange }) => (
    <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <div className="flex gap-3">
            <input type="number" id={nameMin} name={nameMin} value={valMin} onChange={onChange} placeholder={placeholderMin} className={inputCls} />
            <input type="number" id={nameMax} name={nameMax} value={valMax} onChange={onChange} placeholder={placeholderMax} className={inputCls} />
        </div>
    </div>
);

/* ── Icons ───────────────────────────────────────────────────────── */

const IconBell = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="#2563EB">
        <path d="M160-200v-80h80v-280q0-83 50-147.5T420-792v-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820v28q80 20 130 84.5T720-560v280h80v80H160Zm320-300Zm0 420q-33 0-56.5-23.5T400-160h160q0 33-23.5 56.5T480-80ZM320-280h320v-280q0-66-47-113t-113-47q-66 0-113 47t-47 113v280Z"/>
    </svg>
);

const IconInfo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#d97706">
        <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
    </svg>
);

const IconCheck = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
        <path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/>
    </svg>
);

const IconLocation = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#2563EB">
        <path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/>
    </svg>
);

/* ── Main component ──────────────────────────────────────────────── */

const Notification = () => {
    const { language } = useLanguage();
    const contents = language === 'en' ? allEnTexts : allUaTexts;
    const n = contents.notification;

    const userId = useSelector((state: RootState) => state.registration.userId);
    const dispatch = useDispatch();

    const [show, setShow] = useState(false);
    const [map, setMap] = useState<L.Map | null>(null);
    const [coordinates, setCoordinates] = useState({ lat: 0, lon: 0 });
    const [saveMessage, setSaveMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const userString = localStorage.getItem('user');

    const [formData, setFormData] = useState({
        listingType: '',
        propertyType: '',
        typeOfNovelty: '',
        minNumbersOfRoom: '',
        maxNumbersOfRoom: '',
        minTotalArea: '',
        maxTotalArea: '',
        minFloor: '',
        maxFloor: '',
        minPrice: '',
        maxPrice: '',
        locationSought: '',
        locationRange: 10,
        email: userString ? JSON.parse(userString).email : '',
        userId: `${userId}`,
        lat: 0,
        lon: 0,
    });

    const { notificationId } = useParams<{ notificationId?: string }>();
    const isEditMode = !!notificationId;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Sync coordinates into formData
    useEffect(() => {
        setFormData(prev => ({ ...prev, userId: `${userId}`, lat: coordinates.lat, lon: coordinates.lon }));
    }, [coordinates]);

    // Load existing notification in edit mode
    const fetchNotificationData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/notification/${notificationId}`);
            const data = await response.json();
            setSaveMessage('');
            setFormData(prev => ({
                ...prev,
                listingType: data.listingType,
                propertyType: data.propertyType,
                typeOfNovelty: data.typeOfNovelty,
                minNumbersOfRoom: data.minNumbersOfRoom,
                maxNumbersOfRoom: data.maxNumbersOfRoom,
                minTotalArea: data.minTotalArea,
                maxTotalArea: data.maxTotalArea,
                minFloor: data.minFloor,
                maxFloor: data.maxFloor,
                minPrice: data.minPrice,
                maxPrice: data.maxPrice,
                locationSought: data.locationSought,
                locationRange: data.locationRange,
                lat: data.lat,
                lon: data.lon,
                email: userString ? JSON.parse(userString).email : '',
                userId: `${userId}`,
            }));
        } catch (error) {
            console.error('Error fetching notification:', error);
        }
    };

    useEffect(() => {
        if (isEditMode) fetchNotificationData();
    }, [isEditMode, notificationId]);

    // Invalidate map size when panel opens
    useEffect(() => {
        if (show && map) {
            setTimeout(() => map.invalidateSize(), 320);
        }
    }, [show, map]);

    // Init Leaflet map
    useEffect(() => {
        const newMap = L.map('notif-map').setView([50.006, 36.23], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(newMap);
        setMap(newMap);
        return () => { newMap.remove(); };
    }, []);

    /* ── Handlers ──────────────────────────────────────────────────── */

    const handleInputFormData = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleChipSelect = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheck = async () => {
        if (!formData.locationSought) return;
        setErrorMessage('');
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.locationSought)}`);
            const results = await res.json();
            if (results.length > 0 && map) {
                const lat = Number(results[0].lat);
                const lon = Number(results[0].lon);
                map.setView([lat, lon], 13);
                L.marker([lat, lon]).addTo(map).bindPopup(formData.locationSought).openPopup();
                setCoordinates({ lat, lon });
                setShow(true);
            } else {
                setErrorMessage(n[19].text);
            }
        } catch {
            setErrorMessage(n[21].text);
        }
    };

    const emptyFormFields = {
        listingType: '', propertyType: '', typeOfNovelty: '',
        minNumbersOfRoom: '', maxNumbersOfRoom: '',
        minTotalArea: '', maxTotalArea: '',
        minFloor: '', maxFloor: '',
        minPrice: '', maxPrice: '',
        locationSought: '', locationRange: 10,
        email: userString ? JSON.parse(userString).email : '',
        userId: `${userId}`,
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(setNotificationProperty({
            listingType:    formData.listingType,
            propertyType:   formData.propertyType,
            typeOfNovelty:  formData.typeOfNovelty,
            minNumbersOfRoom: Number(formData.minNumbersOfRoom),
            maxNumbersOfRoom: Number(formData.maxNumbersOfRoom),
            minTotalArea:   Number(formData.minTotalArea),
            maxTotalArea:   Number(formData.maxTotalArea),
            minFloor:       Number(formData.minFloor),
            maxFloor:       Number(formData.maxFloor),
            minPrice:       Number(formData.minPrice),
            maxPrice:       Number(formData.maxPrice),
            location:       formData.locationSought,
            locationRange:  formData.locationRange,
            email:          formData.email,
        }));
        try {
            const url = isEditMode && notificationId
                ? `${API_URL}/api/notification/${notificationId}`
                : `${API_URL}/api/notification`;
            const response = await fetch(url, {
                method: isEditMode ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include',
            });
            if (response.ok) {
                setSaveMessage(n[27].text);
                setFormData(prev => ({ ...prev, ...emptyFormFields }));
                setCoordinates({ lat: 0, lon: 0 });
                setShow(false);
                setErrorMessage('');
            } else {
                setErrorMessage(n[20].text);
            }
        } catch {
            setErrorMessage(n[21].text);
        }
    };

    /* ── Render ────────────────────────────────────────────────────── */

    const labelCls = 'text-xs font-semibold text-gray-500 uppercase tracking-wide';

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="h-16" />

            {/* ── Hero ─────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center px-4 pt-8 pb-6"
            >
                <div className="w-14 h-14 rounded-2xl bg-[#2563EB]/10 flex items-center justify-center mx-auto mb-4">
                    <IconBell />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-2">{n[15].text}</h1>
                <p className="text-[#64748B] max-w-md mx-auto text-sm leading-relaxed">{n[0].text}</p>
            </motion.div>

            {/* ── Info banner ───────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="max-w-lg mx-auto px-4 mb-6"
            >
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
                    <span className="shrink-0 mt-0.5"><IconInfo /></span>
                    <p className="text-sm text-amber-800 leading-relaxed">{n[14].text}</p>
                </div>
            </motion.div>

            {/* ── Form card ─────────────────────────────────────────── */}
            <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="max-w-lg mx-auto px-4 pb-16"
            >
                <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-6">

                    {/* Listing type */}
                    <div className="flex flex-col gap-3">
                        <p className={labelCls}>{n[24].text}</p>
                        <div className="flex gap-2 flex-wrap">
                            <RadioChip name="listingType" value="rent"  label={contents.listings.forRent} selected={formData.listingType === 'rent'}  onSelect={handleChipSelect} />
                            <RadioChip name="listingType" value="sale"  label={contents.listings.forSale} selected={formData.listingType === 'sale'}  onSelect={handleChipSelect} />
                        </div>
                    </div>

                    {/* Property type */}
                    <div className="flex flex-col gap-3">
                        <p className={labelCls}>{n[25].text}</p>
                        <div className="flex gap-2 flex-wrap">
                            <RadioChip name="propertyType" value="flat"                   label={contents.listings.propertyTypeFlat}       selected={formData.propertyType === 'flat'}                   onSelect={handleChipSelect} />
                            <RadioChip name="propertyType" value="private house"          label={contents.listings.propertyTypePrivate}    selected={formData.propertyType === 'private house'}          onSelect={handleChipSelect} />
                            <RadioChip name="propertyType" value="commercial real estate" label={contents.listings.propertyTypeCommercial} selected={formData.propertyType === 'commercial real estate'} onSelect={handleChipSelect} />
                        </div>
                    </div>

                    {/* Building type */}
                    <div className="flex flex-col gap-3">
                        <p className={labelCls}>{n[26].text}</p>
                        <div className="flex gap-2 flex-wrap">
                            <RadioChip name="typeOfNovelty" value="newBuilding"      label={contents.listings.newBuilding}      selected={formData.typeOfNovelty === 'newBuilding'}      onSelect={handleChipSelect} />
                            <RadioChip name="typeOfNovelty" value="secondaryHousing" label={contents.listings.secondaryHousing} selected={formData.typeOfNovelty === 'secondaryHousing'} onSelect={handleChipSelect} />
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Range fields */}
                    <RangeField label={n[1].text} nameMin="minNumbersOfRoom" nameMax="maxNumbersOfRoom" valMin={formData.minNumbersOfRoom} valMax={formData.maxNumbersOfRoom} placeholderMin={n[16].text} placeholderMax={n[17].text} onChange={handleInputFormData} />
                    <RangeField label={n[2].text} nameMin="minTotalArea"     nameMax="maxTotalArea"     valMin={formData.minTotalArea}     valMax={formData.maxTotalArea}     placeholderMin={n[16].text} placeholderMax={n[17].text} onChange={handleInputFormData} />
                    <RangeField label={n[3].text} nameMin="minFloor"         nameMax="maxFloor"         valMin={formData.minFloor}         valMax={formData.maxFloor}         placeholderMin={n[16].text} placeholderMax={n[17].text} onChange={handleInputFormData} />
                    <RangeField label={n[4].text} nameMin="minPrice"         nameMax="maxPrice"         valMin={formData.minPrice}         valMax={formData.maxPrice}         placeholderMin={n[16].text} placeholderMax={n[17].text} onChange={handleInputFormData} />

                    <hr className="border-gray-100" />

                    {/* Location */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-1.5">
                            <IconLocation />
                            <p className={labelCls}>{n[5].text}</p>
                        </div>

                        <input
                            type="text"
                            name="locationSought"
                            value={formData.locationSought}
                            onChange={handleInputFormData}
                            placeholder={n[18].text}
                            required
                            className={inputCls}
                        />

                        {/* Range slider */}
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{n[6].text}</span>
                                <span className="font-semibold text-[#2563EB]">{formData.locationRange} km</span>
                            </div>
                            <input
                                type="range"
                                name="locationRange"
                                min="2"
                                max="25"
                                value={formData.locationRange}
                                onChange={handleInputFormData}
                                className="w-full accent-[#2563EB]"
                            />
                        </div>

                        {/* Map controls */}
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleCheck}
                                className="flex-1 py-2 px-4 rounded-xl text-white text-sm font-semibold transition-colors duration-200 cursor-pointer !shadow-none !border-0"
                                style={{ background: '#2563EB' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#2563EB'; }}
                            >
                                {n[7].text}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShow(false)}
                                className="flex-1 py-2 px-4 rounded-xl text-gray-600 text-sm font-semibold border border-gray-200 hover:border-[#2563EB] hover:text-[#2563EB] transition-all duration-200 cursor-pointer !shadow-none"
                                style={{ background: 'white' }}
                            >
                                {n[8].text}
                            </button>
                        </div>

                        {/* Map (inline, animated reveal) */}
                        <div
                            style={{
                                maxHeight: show ? '280px' : 0,
                                overflow: 'hidden',
                                transition: 'max-height 0.35s ease',
                                borderRadius: '12px',
                            }}
                        >
                            <div id="notif-map" style={{ height: '280px', width: '100%', borderRadius: '12px' }} />
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Email */}
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className={labelCls}>{n[9].text}</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputFormData}
                            placeholder="name@example.com"
                            required
                            className={inputCls}
                        />
                    </div>

                    {/* Error message */}
                    <AnimatePresence>
                        {errorMessage && (
                            <motion.p
                                key="error"
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-sm font-semibold text-red-500"
                            >
                                {errorMessage}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-colors duration-200 cursor-pointer !shadow-none !border-0"
                        style={{ background: '#2563EB' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1d4ed8'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#2563EB'; }}
                    >
                        {isEditMode ? n[11].text : n[10].text}
                    </button>

                    {/* Success state */}
                    <AnimatePresence>
                        {saveMessage && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col gap-3"
                            >
                                <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                                    <IconCheck />
                                    {saveMessage}
                                </div>
                                <div className="flex gap-4 text-sm">
                                    <Link to="/myNotification" className="text-[#2563EB] hover:underline font-medium">
                                        {n[22].text}
                                    </Link>
                                    <Link to="/" className="text-gray-500 hover:text-gray-700 hover:underline">
                                        {n[23].text}
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </motion.form>
        </div>
    );
};

export default Notification;
