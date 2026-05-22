import React, { useEffect, useRef, useState } from 'react';
import axios from "axios";
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { addListingWithComparison } from '../services/ListingService';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import ImageUpLoader from "../components/ImageUpLoader";
import { addImage, removeImage, clearImages, setImages } from "../features/upLoadImages/upLoadImagesSlice";
import { increment } from '../features/counter/counterSlice';
import L from "leaflet";
import "leaflet-control-geocoder";
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import { useLanguage } from "../context/LanguageContext";

/* ── Animation variants ──────────────────────────────────────────── */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const pageVariants = {
    enter: { opacity: 0, x: 24 },
    center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE } },
    exit: { opacity: 0, x: -24, transition: { duration: 0.2, ease: EASE } },
};

/* ── SVG icons ───────────────────────────────────────────────────── */

const IconBuilding = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
        <path d="M80-120v-720h400v160h400v560H80Zm80-80h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h320v-400H480v80h80v80h-80v80h80v80h-80v80Zm160-320v-80h80v80h-80Zm0 160v-80h80v80h-80Z"/>
    </svg>
);

const IconChevronLeft = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M15 18l-6-6 6-6"/>
    </svg>
);

const IconChevronRight = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M9 6l6 6-6 6"/>
    </svg>
);

const IconSearch = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
);

/* ── Step progress bar ───────────────────────────────────────────── */

const StepBar = ({ current, total }: { current: number; total: number }) => (
    <div className="flex items-center">
        {Array.from({ length: total }, (_, i) => {
            const step = i + 1;
            const done = step < current;
            const active = step === current;
            return (
                <React.Fragment key={step}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300
                        ${done
                            ? 'bg-[#2563EB] text-white'
                            : active
                            ? 'bg-[#2563EB] text-white ring-4 ring-[#2563EB]/20'
                            : 'bg-gray-200 text-gray-400'}`}>
                        {done ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M20 6L9 17l-5-5"/>
                            </svg>
                        ) : step}
                    </div>
                    {i < total - 1 && (
                        <div className={`flex-1 h-0.5 transition-all duration-500 ${done ? 'bg-[#2563EB]' : 'bg-gray-200'}`} />
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

/* ── Main component ──────────────────────────────────────────────── */

const Listings = () => {
    const { language } = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts;
    const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
    const [uploadedImages, setUploadedImages] = useState<(string | null)[]>(Array(6).fill(null));
    const ownerName = useAppSelector((state) => state.registration.userName);
    const ownerId = useAppSelector((state) => state.registration.userId);
    const dispatch = useAppDispatch();
    const [message, setMessage] = useState<string | null>(null);
    const [storedListingType, setStoredListingType] = useState('');
    const [apartmentDetails, setApartmentDetails] = useState('');
    const [description, setDescription] = useState('');
    const [contact, setContact] = useState('');
    const [location, setLocation] = useState('');
    const [prompt, setPrompt] = useState(["", ""]);
    const [price, setPrice] = useState('');
    const [show, setShow] = useState<boolean>(false);
    const [showMap, setShowMap] = useState<boolean>(false);
    const [isFirstPageComplete, setIsFirstPageComplete] = useState<boolean>(false);
    const [isSecondPageComplete, setIsSecondPageComplete] = useState<boolean>(false);
    const [showReminder, setShowReminder] = useState<boolean>(false);
    const [currentNumberPage, setCurrentNumberPage] = useState<number>(1);
    const [activeHint, setActiveHint] = useState<string | null>(null);
    const [activeHintMobile, setActiveHintMobile] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const [mapReady, setMapReady] = useState(false);
    const [editInitView, setEditInitView] = useState<{ lat: number; lon: number } | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [coordinates, setCoordinates] = useState({ lat: 0, lon: 0 });
    const userString = localStorage.getItem('user');
    const [formData, setFormData] = useState({
        propertyType: '', typeOfNovelty: '', numbersOfRooms: '',
        totalArea: '', numberOfFloor: '', numberOfStoreysOfBuilding: '', qualityOfRenovation: '',
    });
    const { listingId, listingType } = useParams<{ listingId?: string; listingType?: string }>();

    const isEditMode = !!listingId;
    const param = isEditMode ? listingId : listingType;
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    useEffect(() => {
        if (isEditMode) {
            const fetchListingData = async () => {
                try {
                    const response = await fetch(`${API_URL}/api/listings/${listingId}`);
                    const data = await response.json();
                    setApartmentDetails(data[0].apartmentDetails);
                    setDescription(data[0].description);
                    setContact(data[0].contact);
                    setPrice(data[0].price.toString());
                    setLocation(data[0].location);
                    setStoredListingType(data[0].listingType ?? '');
                    setFormData({
                        propertyType: data[0].propertyType ?? '',
                        typeOfNovelty: data[0].typeOfNovelty ?? '',
                        numbersOfRooms: String(data[0].numbersOfRooms ?? ''),
                        totalArea: String(data[0].totalArea ?? ''),
                        numberOfFloor: String(data[0].numberOfFloor ?? ''),
                        numberOfStoreysOfBuilding: String(data[0].numberOfStoreysOfBuilding ?? ''),
                        qualityOfRenovation: data[0].qualityOfRenovation ?? '',
                    });
                    setUploadedImages(data[0].image.filter((img: string) => img !== null));
                    setSearchQuery(data[0].location);
                    const newCoords = { lat: data[0].coordinates.lat, lon: data[0].coordinates.lon };
                    setCoordinates(newCoords);
                    setEditInitView(newCoords);
                } catch (error) {
                    console.error('Error fetching listing:', error);
                }
            };
            fetchListingData();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditMode, listingId]);

    const handleImageUpload = (index: number, url: string) => {
        const newImages = [...uploadedImages];
        newImages[index] = url;
        setUploadedImages(newImages);
        localStorage.setItem('userImages', JSON.stringify(newImages));
        dispatch(addImage({ index, url }));
    };

    const handleImageDeleteUploading = async (index: number) => {
        const urlToDelete = uploadedImages[index];
        if (!urlToDelete) return;
        if (message === "Success: Listing added successfully.") return;

        try {
            const urlParts = urlToDelete.split('/');
            const publicId = urlParts[urlParts.length - 1].split('.')[0];

            const { data } = await axios.post(`${API_URL}/generate-signature`, {
                public_id: publicId,
                timestamp: Math.floor(Date.now() / 1000),
            });

            await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`, {
                public_id: publicId,
                api_key: data.api_key,
                timestamp: data.timestamp,
                signature: data.signature,
            });

            setUploadedImages(prev => {
                const newImages = [...prev];
                newImages[index] = null;
                return newImages;
            });
            dispatch(removeImage(index));
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    };

    const handleDeleteCommentsByListingId = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/api/comments/listingId/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Delete comments failed: ${errorText}`);
            }
            const successResponse = await response.json();
            setMessage(`${successResponse.message} ${successResponse.deletedCount}`);
        } catch (error) {
            console.error('Deletion error:', error);
            throw error;
        }
    };

    const handleDeleteListingById = async () => {
        try {
            const response = await fetch(`${API_URL}/api/listing/${listingId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Delete listings failed: ${errorText}`);
            }
            const successResponse = await response.json();
            setMessage(`${successResponse.message} ${successResponse.deletedCount}`);
        } catch (error) {
            console.error('Deletion error:', error);
            throw error;
        }
    };

    const handleCleanFormOrDeleteListing = async () => {
        try {
            await Promise.all(
                uploadedImages.map(async (url) => {
                    if (!url) return;
                    const urlParts = url.split('/');
                    const publicId = urlParts[urlParts.length - 1].split('.')[0];
                    const { data } = await axios.post(`${API_URL}/generate-signature`, {
                        public_id: publicId,
                        timestamp: Math.floor(Date.now() / 1000),
                    });
                    return axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`, {
                        public_id: publicId,
                        api_key: data.api_key,
                        timestamp: data.timestamp,
                        signature: data.signature,
                    });
                })
            );

            if (isEditMode) {
                handleDeleteCommentsByListingId(listingId);
                handleDeleteListingById();
            }

            setApartmentDetails("");
            setDescription("");
            setContact("");
            setLocation("");
            setSearchQuery("");
            setPrice("");
            setFormData({
                propertyType: '', typeOfNovelty: '', numbersOfRooms: '',
                totalArea: '', numberOfFloor: '', numberOfStoreysOfBuilding: '', qualityOfRenovation: '',
            });
            dispatch(clearImages());
            setMessage(null);
            setShow(false);
            setUploadedImages(Array(6).fill(null));
        } catch (error) {
            console.error('Error cleaning form:', error);
        }
    };

    useEffect(() => {
        const isFirstPageCompleted =
            formData.typeOfNovelty !== '' &&
            formData.numbersOfRooms !== '' &&
            formData.totalArea !== '' &&
            formData.numberOfFloor !== '' &&
            formData.numberOfStoreysOfBuilding !== '';
        setIsFirstPageComplete(!!isFirstPageCompleted);
    }, [formData.typeOfNovelty, formData.numbersOfRooms, formData.totalArea, formData.numberOfFloor, formData.numberOfStoreysOfBuilding]);

    const handleAddOrSaveListing = async () => {
        try {
            const commonData = {
                typeOfNovelty: `${formData.typeOfNovelty}`,
                numbersOfRooms: `${formData.numbersOfRooms}`,
                totalArea: `${formData.totalArea}`,
                numberOfFloor: `${formData.numberOfFloor}`,
                numberOfStoreysOfBuilding: `${formData.numberOfStoreysOfBuilding}`,
                apartmentDetails: `${apartmentDetails}`,
                description: `${description}`,
                contact: `${contact}`,
                email: userString ? JSON.parse(userString).email : ``,
                price: `${price}`,
                owner: `${ownerName}`,
                ownerId: `${ownerId}`,
                location: `${location}`,
                image: uploadedImages.filter(img => img !== null),
                propertyType: `${formData.propertyType}`,
                lat: `${coordinates.lat}`,
                lon: `${coordinates.lon}`,
            };

            if (isEditMode && listingId) {
                const updatedData = { ...commonData, listingType: storedListingType, qualityOfRenovation: "unknown" };
                const response = await axios.put(`${API_URL}/api/listing/${listingId}`, updatedData, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' },
                });
                if (response.status === 200) {
                    setMessage("Success: Listing updated successfully!");
                }
            } else if (listingType) {
                const newListing = { ...commonData, listingType: `${listingType}` };
                await addListingWithComparison(newListing);
                setMessage("Success: Listing added successfully.");
                setShow(false);
                dispatch(increment());
                localStorage.removeItem('userImages');
                setUploadedImages(Array(6).fill(null));
            }
        } catch (error) {
            const errorMessage = isEditMode ? "Failed to update listing:" : "Failed to add listing:";
            const e = error as { response?: { data?: { message?: string } }; message?: string };
            setMessage(`${errorMessage} ${e.response?.data?.message || e.message || String(error)}`);
        }
    };

    useEffect(() => {
        const saved = localStorage.getItem('userImages');
        if (saved) dispatch(setImages(JSON.parse(saved) as string[]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNext = () => {
        const canProceed = isEditMode
            ? true
            : (currentNumberPage === 1 && isFirstPageComplete) ||
              (currentNumberPage === 2 && isSecondPageComplete);
        if (canProceed) {
            setCurrentNumberPage(prev => prev + 1);
            setShowReminder(false);
        } else {
            setShowReminder(true);
        }
    };

    const handlePrevious = () => {
        setCurrentNumberPage(prev => prev - 1);
        setShowReminder(false);
    };

    useEffect(() => {
        const isSecondPageCompleted = apartmentDetails && description && contact && location && price;
        setIsSecondPageComplete(!!isSecondPageCompleted);
    }, [apartmentDetails, description, contact, location, price]);

    useEffect(() => {
        if (!containerRef.current) return;
        const map = L.map(containerRef.current).setView([50.006, 36.23], 11);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        mapRef.current = map;
        setMapReady(true);
        return () => { map.remove(); mapRef.current = null; setMapReady(false); };
    }, []);

    useEffect(() => {
        if (!showMap || !mapRef.current) return;
        const t = setTimeout(() => mapRef.current?.invalidateSize(), 50);
        return () => clearTimeout(t);
    }, [showMap]);

    useEffect(() => {
        if (!mapReady || !editInitView || !mapRef.current) return;
        mapRef.current.setView([editInitView.lat, editInitView.lon], 13);
    }, [mapReady, editInitView]);

    const handleSearch = async () => {
        const map = mapRef.current;
        if (!searchQuery || !map) return;
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
            );
            const results = await response.json();
            if (results.length > 0) {
                const lat = parseFloat(results[0].lat);
                const lon = parseFloat(results[0].lon);
                if (markerRef.current) map.removeLayer(markerRef.current);
                markerRef.current = L.marker([lat, lon]).addTo(map).bindPopup(searchQuery).openPopup();
                map.setView([lat, lon], 13);
                setLocation(searchQuery);
                setCoordinates({ lat, lon });
                setShowMap(true);
                setPrompt([`${contents.listings.addressExists}`, `text-green-600`]);
                try {
                    const cache = JSON.parse(localStorage.getItem("coordsCache") || "{}");
                    cache[searchQuery] = { lat, lon };
                    localStorage.setItem("coordsCache", JSON.stringify(cache));
                } catch { /* non-critical */ }
            } else {
                setPrompt([`${contents.listings.addressNotFound}`, `text-red-500`]);
            }
        } catch {
            setPrompt([`${contents.listings.addressNotFound}`, `text-red-500`]);
        }
    };

    const handleInputProperty = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        const allFieldsFilled =
            apartmentDetails && description && contact && location && price &&
            uploadedImages.filter(Boolean).length >= 2;
        if (isEditMode) {
            setShow(true);
        } else {
            setShow(!!allFieldsFilled);
        }
    }, [apartmentDetails, description, contact, location, price, uploadedImages, isEditMode]);

    const fieldMap: Record<string, {
        value: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    }> = {
        apartmentDetails: { value: apartmentDetails, onChange: (e) => setApartmentDetails(e.target.value) },
        description:      { value: description,      onChange: (e) => setDescription(e.target.value) },
        contact:          { value: contact,           onChange: (e) => setContact(e.target.value) },
        price:            { value: price,             onChange: (e) => setPrice(e.target.value) },
        location:         { value: searchQuery,       onChange: (e) => setSearchQuery(e.target.value) },
    };

    const isPageReady =
        (currentNumberPage === 1 && isFirstPageComplete) ||
        (currentNumberPage === 2 && isSecondPageComplete);

    const inputCls = "w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-[#0F172A] outline-none transition-all duration-150 placeholder:text-gray-300 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10";

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center pt-24 pb-6 px-4 relative">

            <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger}
                className="w-full max-w-xl"
            >
                {/* ── Icon + short title + Step bar ────────────────────── */}
                <motion.div variants={fadeUp} className="flex flex-col items-center gap-4 mb-3">
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg text-white"
                            style={{ background: 'linear-gradient(135deg, #2563EB 0%, #1e3a8a 100%)' }}>
                            <IconBuilding />
                        </div>
                        <span className="text-[#0F172A] font-semibold text-sm sm:text-base leading-tight">
                            {isEditMode
                                ? contents.listings.editModeTitle
                                : (param === 'sale' ? `${contents.listings.formTitleFor} ${contents.listings.typeSale}`
                                : `${contents.listings.formTitleFor} ${contents.listings.typeRent}`)}
                        </span>
                    </div>
                    <div className="flex-1 w-full px-6">
                        <StepBar current={currentNumberPage} total={3} />
                    </div>
                </motion.div>

                {/* ── Card ─────────────────────────────────────────────── */}
                <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-5">

                    <AnimatePresence mode="wait">

                        {/* PAGE 1 — Property specs */}
                        {currentNumberPage === 1 && (
                            <motion.div key="page1" variants={pageVariants} initial="enter" animate="center" exit="exit"
                                className="flex flex-col gap-3">

                                {/* Property type radios */}
                                <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                                    <div className="flex flex-col gap-0.5">
                                        {[
                                            { id: 'flat',       value: 'flat',                   label: contents.listings.propertyTypeFlat },
                                            { id: 'private',    value: 'private house',           label: contents.listings.propertyTypePrivate },
                                            { id: 'commercial', value: 'commercial real estate',  label: contents.listings.propertyTypeCommercial },
                                        ].map(opt => (
                                            <label key={opt.id} className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all duration-150 border
                                                ${formData.propertyType === opt.value
                                                    ? 'bg-[#2563EB]/5 border-[#2563EB]/25 text-[#2563EB]'
                                                    : 'border-transparent hover:bg-gray-100 text-[#0F172A]'}`}>
                                                <input type="radio" name="propertyType" value={opt.value}
                                                    checked={formData.propertyType === opt.value}
                                                    onChange={handleInputProperty}
                                                    className="accent-[#2563EB]" />
                                                <span className="text-sm font-medium">{opt.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Novelty toggle buttons */}
                                <div className="flex gap-2">
                                    {[
                                        { id: 'newBuilding',      value: 'newBuilding',      label: contents.listings.newBuilding },
                                        { id: 'secondaryHousing', value: 'secondaryHousing', label: contents.listings.secondaryHousing },
                                    ].map(opt => (
                                        <label key={opt.id} className={`flex-1 flex items-center justify-center px-3 py-1.5 rounded-lg cursor-pointer border text-sm font-semibold transition-all duration-150
                                            ${formData.typeOfNovelty === opt.value
                                                ? '!bg-[#2563EB] text-white border-[#2563EB] shadow-sm'
                                                : 'bg-white text-[#64748B] border-gray-200 hover:border-[#2563EB]/40 hover:text-[#2563EB]'}`}>
                                            <input type="radio" name="typeOfNovelty" value={opt.value}
                                                checked={formData.typeOfNovelty === opt.value}
                                                onChange={handleInputProperty}
                                                className="sr-only" />
                                            {opt.label}
                                        </label>
                                    ))}
                                </div>

                                {/* Numeric fields 2×2 grid */}
                                <div className="grid grid-cols-2 gap-2.5">
                                    {[
                                        { id: 'numbersOfRooms',            label: contents.listings.numberOfRooms },
                                        { id: 'totalArea',                 label: contents.listings.totalArea },
                                        { id: 'numberOfFloor',             label: contents.listings.floorNumber },
                                        { id: 'numberOfStoreysOfBuilding', label: contents.listings.totalFloors },
                                    ].map(field => (
                                        <div key={field.id} className="flex flex-col gap-0.5">
                                            <label htmlFor={field.id}
                                                className="text-xs font-semibold text-[#64748B] uppercase tracking-wider leading-tight">
                                                {field.label}
                                            </label>
                                            <input
                                                type="number" id={field.id} name={field.id}
                                                value={formData[field.id as keyof typeof formData]}
                                                onChange={handleInputProperty}
                                                placeholder="—"
                                                className={inputCls}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* PAGE 2 — Text details + location */}
                        {currentNumberPage === 2 && (
                            <motion.div key="page2" variants={pageVariants} initial="enter" animate="center" exit="exit"
                                className="flex flex-col gap-2.5">

                                {Object.entries(contents.hints).map(([key, hint]) => (
                                    <div key={key} className="flex flex-col gap-0.5">

                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                                                {key === 'apartmentDetails' ? contents.listings.fieldApartmentDetails
                                                    : key === 'description'     ? contents.listings.fieldDescription
                                                    : key === 'contact'         ? contents.listings.fieldContact
                                                    : key === 'price'           ? contents.listings.fieldPrice
                                                    :                             contents.listings.fieldLocation}
                                            </label>
                                            <button
                                                type="button"
                                                className="md:hidden flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 text-[#94A3B8] transition-colors"
                                                style={{ color: activeHintMobile === key ? '#2563EB' : undefined }}
                                                onClick={() => setActiveHintMobile(activeHintMobile === key ? null : key)}
                                                aria-label={contents.listings.hintToggle}
                                            >
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10"/>
                                                    <path d="M12 16v-4M12 8h.01"/>
                                                </svg>
                                            </button>
                                        </div>

                                        <div
                                            className="relative"
                                            onMouseEnter={() => setActiveHint(key)}
                                            onMouseLeave={() => setActiveHint(null)}
                                            onFocus={(e) => {
                                                setActiveHint(key);
                                                const el = e.target as HTMLElement;
                                                setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                                            }}
                                            onBlur={() => setActiveHint(null)}
                                        >
                                            {key === 'price' || key === 'contact' ? (
                                                <input
                                                    type={key === 'price' ? 'number' : 'text'}
                                                    placeholder={key === 'contact' ? contents.listings.fieldContact
                                                        : key === 'price' ? contents.listings.fieldPrice
                                                        : contents.listings.fieldLocation}
                                                    value={fieldMap[key].value}
                                                    onChange={fieldMap[key].onChange}
                                                    className={inputCls}
                                                />
                                            ) : (
                                                <textarea
                                                    rows={key === 'location' ? 1 : 2}
                                                    placeholder={key === 'apartmentDetails' ? contents.listings.fieldApartmentDetails
                                                        : key === 'description' ? contents.listings.fieldDescription
                                                        : contents.listings.fieldLocation}
                                                    value={fieldMap[key].value}
                                                    onChange={fieldMap[key].onChange}
                                                    className={`${inputCls} resize-none`}
                                                />
                                            )}

                                            <AnimatePresence>
                                                {activeHint === key && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 4 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 4 }}
                                                        transition={{ duration: 0.15 }}
                                                        className="hidden md:block absolute z-10 top-full left-0 mt-2 w-full bg-[#0F172A] text-white py-1.5 px-2.5 text-xs rounded-xl shadow-xl leading-relaxed
                                                            before:absolute before:top-0 before:left-4 before:-translate-y-full before:border-8 before:border-transparent before:border-b-[#0F172A]"
                                                    >
                                                        {hint}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        <AnimatePresence>
                                            {activeHintMobile === key && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="md:hidden overflow-hidden bg-[#EFF6FF] text-[#3B82F6] py-2 px-3 text-xs rounded-lg leading-relaxed border border-[#BFDBFE]"
                                                >
                                                    {hint}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                    </div>
                                ))}

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleSearch}
                                    className="!bg-[#2563EB] !shadow-none !border-0 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 w-full mt-0.5"
                                >
                                    <IconSearch />
                                    {contents.listings.checkAddress}
                                </motion.button>

                                {prompt[0] && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`text-xs font-medium ${prompt[1]}`}
                                    >
                                        {prompt[0]}
                                    </motion.p>
                                )}
                            </motion.div>
                        )}

                        {/* PAGE 3 — Photos + submit */}
                        {currentNumberPage === 3 && (
                            <motion.div key="page3" variants={pageVariants} initial="enter" animate="center" exit="exit"
                                className="flex flex-col gap-3">

                                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                                    {contents.listings.photoInstruction}
                                </p>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {[...Array(6)].map((_, index) => (
                                        <ImageUpLoader
                                            key={index}
                                            index={index}
                                            onUploadComplete={handleImageUpload}
                                            onDelete={handleImageDeleteUploading}
                                            initialUrl={uploadedImages[index] ?? undefined}
                                        />
                                    ))}
                                </div>

                                {/* Action area */}
                                <AnimatePresence mode="wait">
                                    {message?.startsWith('Success') ? (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex items-center gap-3 py-2 px-3 bg-green-50 border border-green-100 rounded-xl"
                                        >
                                            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <path d="M20 6L9 17l-5-5"/>
                                                </svg>
                                            </div>
                                            <Link
                                                to="/"
                                                state={{ scrollToNewListing: 700 }}
                                                className="text-[#2563EB] font-semibold text-sm hover:underline"
                                            >
                                                {contents.listings.goToPublished}
                                            </Link>
                                        </motion.div>
                                    ) : (
                                        <motion.div key="actions" className="flex flex-col gap-2">
                                            {show && (
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={handleAddOrSaveListing}
                                                    className={`w-full py-2.5 rounded-xl text-white font-bold text-sm tracking-wide !shadow-none !border-0
                                                        ${isEditMode ? '!bg-amber-500' : '!bg-[#2563EB]'}`}
                                                >
                                                    {isEditMode ? contents.listings.saveChanges : contents.listings.publish}
                                                </motion.button>
                                            )}

                                            {message && !message.startsWith('Success') && (
                                                <motion.p
                                                    initial={{ opacity: 0, y: -4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="text-red-500 text-xs font-medium text-center"
                                                >
                                                    {message}
                                                </motion.p>
                                            )}

                                            {show && (
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.97 }}
                                                    onClick={handleCleanFormOrDeleteListing}
                                                    className={`w-full py-2 rounded-xl font-semibold text-sm !shadow-none
                                                        ${isEditMode
                                                            ? '!bg-red-50 text-red-600 border border-red-200'
                                                            : '!bg-gray-100 text-[#64748B] border border-gray-200'}`}
                                                >
                                                    {isEditMode ? contents.listings.deleteListing : contents.listings.clearForm}
                                                </motion.button>
                                            )}

                                            {isEditMode && (
                                                <Link to="/myListings"
                                                    className="block text-center text-[#64748B] text-xs font-medium hover:text-[#2563EB] transition-colors py-0.5">
                                                    {contents.listings.backToListings}
                                                </Link>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Navigation — всегда видна на всех страницах ───── */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <motion.button
                            whileHover={currentNumberPage > 1 ? { scale: 1.03 } : {}}
                            whileTap={currentNumberPage > 1 ? { scale: 0.97 } : {}}
                            onClick={handlePrevious}
                            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg font-semibold text-sm !shadow-none transition-all
                                ${currentNumberPage === 1
                                    ? 'invisible'
                                    : '!bg-gray-100 text-[#64748B] border border-gray-200 hover:!bg-gray-200'}`}
                        >
                            <IconChevronLeft />
                            {contents.listings.previousStep}
                        </motion.button>

                        {currentNumberPage !== 3 && (
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleNext}
                                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-white font-semibold text-sm !shadow-none transition-all
                                    ${isPageReady || isEditMode ? '!bg-[#2563EB]' : '!bg-gray-300 cursor-not-allowed'}`}
                            >
                                {contents.listings.next} {currentNumberPage}
                                <IconChevronRight />
                            </motion.button>
                        )}
                    </div>

                    {showReminder && currentNumberPage !== 3 && (
                        <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-xs font-medium mt-2 text-center"
                        >
                            {contents.listings.fillAllFields}
                        </motion.p>
                    )}
                </motion.div>
            </motion.div>

            {/* ── Leaflet map wrapper (always in DOM for Leaflet init) ──
                The inner containerRef div is always present so Leaflet can
                initialize; the wrapper moves off-screen when map is hidden. */}
            <div style={showMap && currentNumberPage === 2 ? styles.mapWrapper : styles.mapWrapperHidden}>
                <div ref={containerRef} style={{ width: '100%', height: '240px', borderRadius: '12px', overflow: 'hidden' }} />
                {showMap && currentNumberPage === 2 && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setShowMap(false)}
                        className="w-full mt-2 py-1.5 rounded-lg !bg-white border border-gray-200 text-[#64748B] text-sm font-semibold !shadow-none hover:!bg-gray-50"
                    >
                        {contents.listings.collapseMap}
                    </motion.button>
                )}
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    mapWrapper: {
        position: 'fixed',
        top: '72px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(92vw, 580px)',
        zIndex: 20,
        padding: '4px',
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    },
    mapWrapperHidden: {
        position: 'fixed',
        top: '-9999px',
        left: '-9999px',
        width: '580px',
        zIndex: -1,
        opacity: 0,
    },
};

export default Listings;
