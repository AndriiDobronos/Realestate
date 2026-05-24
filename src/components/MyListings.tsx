import { useEffect, useState } from 'react';
import axios from 'axios';
import { RootState } from "../app/store";
import { useSelector } from 'react-redux';
import { useIsAdmin } from '../app/hooks';
import { Link } from 'react-router-dom';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import { useLanguage } from "../context/LanguageContext";
import noListingsImage from "../assets/images/don'tHaveAnyListingsYet.webp";

interface MyListing {
    _id: string;
    date: number | string;
    listingNumber?: number;
    listingType: string;
    propertyType: string;
    apartmentDetails: string;
    description: string;
    price: number | string;
    image: string[];
    contact: string;
    location: string;
    owner: string;
    numbersOfRooms?: number;
    totalArea?: number;
    numberOfFloor?: number;
    numberOfStoreysOfBuilding?: number;
    typeOfNovelty?: string;
}

const MyListings = () => {
    const { language } = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts;
    const c = contents.cards;
    const m = contents.myListings;

    const userId = useSelector((state: RootState) => state.registration.userId);
    const [listings, setListings] = useState<MyListing[]>([]);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
    const isAdmin = useIsAdmin();

    const deleteImagesFromCloudinary = async (images: string[]) => {
        await Promise.all(
            images.filter(Boolean).map(async (url) => {
                const publicId = url.split('/').pop()!.split('.')[0];
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
    };

    const handleDelete = async (id: string, images: string[]) => {
        if (!window.confirm(m[16].text + '?')) return;
        try {
            await deleteImagesFromCloudinary(images);
            const res = await fetch(`${API_URL}/api/listing/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
            setListings(prev => prev.filter(l => l._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const url = isAdmin
            ? `${API_URL}/listings`
            : `${API_URL}/api/listings/ownerId/${encodeURIComponent(userId)}`;

        fetch(url, { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error(`Failed to fetch listings: ${res.status}`);
                return res.json();
            })
            .then(data => setListings(data))
            .catch(err => console.error(err));
    }, [API_URL, isAdmin, userId]);

    if (listings.length === 0) {
        return (
            <div className="flex flex-col items-center min-h-screen pt-24 px-4 pb-8">
                <p className="text-2xl sm:text-3xl font-bold text-gray-700 text-center mb-6 sm:mb-8">
                    {m[12].text}
                </p>
                <img
                    src={noListingsImage}
                    alt="No listings found"
                    className="w-4/5 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl object-contain flex-1"
                />
            </div>
        );
    }

    return (
        <div>
            <div className="h-[64px]" />
            <section className="pb-8 pt-2 px-8">
                <div className="mx-auto">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                        {m[0].text}
                    </h1>
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((listing, index) => {
                            const coverImage = listing.image?.find(img => img !== null) ?? null;
                            const isRent = listing.listingType === 'rent';
                            const isFlat = listing.propertyType === 'flat';
                            const isPrivateHouse = listing.propertyType === 'private house';
                            const showRooms = (isFlat || isPrivateHouse) && listing.numbersOfRooms;
                            const showFloor = listing.numberOfFloor && listing.numberOfStoreysOfBuilding;
                            const propertyLabel = isFlat ? c[12].text : isPrivateHouse ? c[13].text : c[14].text;
                            const displayNumber = listing.listingNumber ?? index + 1;
                            const formattedDate = new Date(+listing.date).toLocaleDateString(
                                language === 'en' ? 'en-GB' : 'uk-UA',
                                { day: '2-digit', month: 'short', year: 'numeric' }
                            );

                            return (
                                <li
                                    key={listing._id}
                                    className="group flex flex-col bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                                >
                                    {/* Image */}
                                    <Link
                                        to={`/listings/edit/${listing._id}`}
                                        className="relative block h-80 flex-shrink-0 overflow-hidden bg-gray-100"
                                    >
                                        {coverImage ? (
                                            <img
                                                src={coverImage}
                                                alt="Property"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="currentColor">
                                                    <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-800v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Z"/>
                                                </svg>
                                                <span className="text-sm">{c[22].text}</span>
                                            </div>
                                        )}

                                        {/* Rent / Sale badge */}
                                        <span className={`absolute top-3 left-3 text-white text-xs font-bold px-3 py-1 rounded-full shadow ${isRent ? 'bg-blue-500' : 'bg-green-500'}`}>
                                            {isRent ? c[10].text : c[11].text}
                                        </span>

                                        {/* New building badge */}
                                        {listing.typeOfNovelty === 'newBuilding' && (
                                            <span className="absolute top-3 right-3 bg-orange-400 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                                                {c[18].text}
                                            </span>
                                        )}

                                        {/* Listing number badge */}
                                        <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                            #{displayNumber}
                                        </span>
                                    </Link>

                                    {/* Content */}
                                    <div className="flex flex-col flex-1 p-4 gap-3">

                                        {/* Listing number + owner row */}
                                        <div className="flex items-center justify-between text-xs text-gray-400">
                                            <span className="font-semibold">{m[13].text}{displayNumber}</span>
                                            <span>{m[14].text}<span className="font-semibold text-gray-600">{listing.owner}</span></span>
                                        </div>

                                        {/* Property type */}
                                        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#6b7280">
                                                <path d="M680-600h80v-80h-80v80Zm0 160h80v-80h-80v80Zm0 160h80v-80h-80v80Zm0 160v-80h160v-560H480v56l-80-58v-78h520v720H680Zm-640 0v-400l280-200 280 200v400H360v-200h-80v200H40Zm80-80h80v-200h240v200h80v-280L320-622 120-480v280Zm560-360ZM440-200v-200H200v200-200h240v200Z"/>
                                            </svg>
                                            <span className="font-medium">{propertyLabel}</span>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-baseline gap-1.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="#1C935D" className="flex-shrink-0 mb-[-2px]">
                                                <path d="M856-390 570-104q-12 12-27 18t-30 6q-15 0-30-6t-27-18L103-457q-11-11-17-25.5T80-513v-287q0-33 23.5-56.5T160-880h287q16 0 31 6.5t26 17.5l352 353q12 12 17.5 27t5.5 30q0 15-5.5 29.5T856-390ZM513-160l286-286-353-354H160v286l353 354ZM260-640q25 0 42.5-17.5T320-700q0-25-17.5-42.5T260-760q-25 0-42.5 17.5T200-700q0 25 17.5 42.5T260-640Zm220 160Z"/>
                                            </svg>
                                            <span className="text-2xl font-bold text-gray-800">{listing.price} &#8372;</span>
                                            {isRent && <span className="text-sm text-gray-400 font-normal">{c[17].text}</span>}
                                        </div>

                                        {/* Spec chips */}
                                        <div className="flex flex-wrap gap-2">
                                            {showRooms && (
                                                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor">
                                                        <path d="M200-280h60v-60h440v60h60v-154q0-21-8-39.5T730-506v-94q0-33-23.5-56.5T650-680H520q-11 0-21 3t-19 9q-9-6-19-9t-21-3H310q-33 0-56.5 23.5T230-600v94q-14 14-22 32.5t-8 39.5v154Zm60-120v-40q0-17 11.5-28.5T300-480h360q17 0 28.5 11.5T700-440v40H260Zm30-140v-80h160v80H290Zm220 0v-80h160v80H510ZM160-80q-33 0-56.5-23.5T80-160v-640q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-80H160Zm0-80h640v-640H160v640Zm0 0v-640 640Z"/>
                                                    </svg>
                                                    {listing.numbersOfRooms} {c[15].text}
                                                </span>
                                            )}
                                            {listing.totalArea ? (
                                                <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-xs font-medium px-2.5 py-1 rounded-full">
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor">
                                                        <path d="M344-336 200-480l144-144 56 57-87 87 87 87-56 57Zm272 0-56-57 87-87-87-87 56-57 144 144-144 144ZM200-120q-33 0-56.5-23.5T120-200v-160h80v160h160v80H200Zm400 0v-80h160v-160h80v160q0 33-23.5 56.5T760-120H600ZM120-600v-160q0-33 23.5-56.5T200-840h160v80H200v160h-80Zm640 0v-160H600v-80h160q33 0 56.5 23.5T840-760v160h-80Z"/>
                                                    </svg>
                                                    {listing.totalArea} {c[16].text}
                                                </span>
                                            ) : null}
                                            {showFloor ? (
                                                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor">
                                                        <path d="M80-120v-720h400v160h400v560H80Zm80-80h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h320v-400H480v80h80v80h-80v80h80v80h-80v80Zm160-240v-80h80v80h-80Zm0 160v-80h80v80h-80Z"/>
                                                    </svg>
                                                    {listing.numberOfFloor} {c[20].text} {listing.numberOfStoreysOfBuilding} {c[21].text}
                                                </span>
                                            ) : null}
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-start gap-1.5 text-sm text-gray-500 mt-auto">
                                            <svg className="flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#EF4444">
                                                <path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/>
                                            </svg>
                                            <span className="line-clamp-2 leading-snug">{listing.location}</span>
                                        </div>

                                        {/* Date */}
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="#9ca3af">
                                                <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"/>
                                            </svg>
                                            <span>{formattedDate}</span>
                                        </div>

                                        {/* Edit / Delete buttons */}
                                        <div className="flex gap-2 mt-1">
                                            <Link to={`/listings/edit/${listing._id}`} className="flex-1">
                                                <button
                                                    type="button"
                                                    className="!w-full py-2 rounded-xl !bg-blue-500 hover:!bg-blue-600 active:!bg-blue-700 text-white text-sm font-semibold transition-colors duration-200 !shadow-none !border-0"
                                                >
                                                    {m[15].text}
                                                </button>
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(listing._id, listing.image)}
                                                className="flex-1 py-2 rounded-xl !bg-red-500 hover:!bg-red-600 active:!bg-red-700 text-white text-sm font-semibold transition-colors duration-200 !shadow-none !border-0"
                                            >
                                                {m[16].text}
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>
        </div>
    );
};

export default MyListings;
