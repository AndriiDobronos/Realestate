import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';

interface Listing {
    _id: string;
    date: number;
    listingNumber: number;
    propertyType: string;
    apartmentDetails: string;
    description: string;
    price: number;
    image: string[];
    owner: string;
    ownerId: string;
    contact: string;
    location: string;
    listingType: string;
    typeOfNovelty: string;
    numbersOfRooms: number;
    totalArea: number;
    numberOfFloor: number;
    numberOfStoreysOfBuilding: number;
}

interface Props {
    listing: Listing;
    filterNullListings: string[];
    isAdmin: boolean;
    show: boolean;
    savedScroll: number;
    handleLeaveFeedback: () => void;
    handleDeleteUserDataByUserId: () => void;
}

const DescriptionOfDetails = ({
    listing,
    filterNullListings,
    isAdmin,
    show,
    savedScroll,
    handleLeaveFeedback,
    handleDeleteUserDataByUserId,
}: Props) => {
    const { language } = useLanguage();
    const c = language === 'en' ? allEnTexts : allUaTexts;
    const d = c.details;
    const cards = c.cards;

    const [imgIndex, setImgIndex] = useState(0);

    const goPrev = () =>
        setImgIndex(i => (i === 0 ? filterNullListings.length - 1 : i - 1));
    const goNext = () =>
        setImgIndex(i => (i === filterNullListings.length - 1 ? 0 : i + 1));

    const isRent = listing.listingType === 'rent';
    const isFlat = listing.propertyType === 'flat';
    const isPrivateHouse = listing.propertyType === 'private house';
    const propertyLabel = isFlat ? d[14].text : isPrivateHouse ? d[15].text : d[16].text;

    const formattedDate = new Date(+listing.date).toLocaleDateString(
        language === 'en' ? 'en-GB' : 'uk-UA',
        { day: '2-digit', month: 'short', year: 'numeric' }
    );

    return (
        <div className="description-of-details relative flex flex-col">

            {/* ── Carousel ──────────────────────────────────────── */}
            <div className="relative h-80 sm:h-96 w-full overflow-hidden rounded-xl bg-gray-100 group">
                {filterNullListings.length > 0 ? (
                    <>
                        {/* blurred fill behind the main image */}
                        <div className="absolute inset-0">
                            <img
                                src={filterNullListings[imgIndex]}
                                alt=""
                                aria-hidden
                                className="w-full h-full object-cover scale-110 blur-2xl brightness-75"
                            />
                        </div>
                        {/* main image — full, unclipped */}
                        <img
                            src={filterNullListings[imgIndex]}
                            alt={`Photo ${imgIndex + 1}`}
                            className="relative w-full h-full object-contain"
                        />

                        <span className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2.5 py-0.5 rounded-full select-none">
                            {imgIndex + 1} / {filterNullListings.length}
                        </span>

                        {filterNullListings.length > 1 && (
                            <>
                                <button
                                    onClick={goPrev}
                                    aria-label="Previous photo"
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65 text-white rounded-full p-1.5 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                                        <path d="M600-240 360-480l240-240 56 56-184 184 184 184-56 56Z"/>
                                    </svg>
                                </button>
                                <button
                                    onClick={goNext}
                                    aria-label="Next photo"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65 text-white rounded-full p-1.5 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                                        <path d="M360-240l-56-56 184-184-184-184 56-56 240 240-240 240Z"/>
                                    </svg>
                                </button>
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {filterNullListings.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setImgIndex(i)}
                                            aria-label={`Photo ${i + 1}`}
                                            className={`w-2 h-2 rounded-full transition-colors ${i === imgIndex ? 'bg-white' : 'bg-white/45'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="currentColor">
                            <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-800v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Z"/>
                        </svg>
                        <span className="text-sm text-gray-400">{cards[22].text}</span>
                    </div>
                )}
            </div>

            {/* ── Badges ────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${isRent ? 'bg-blue-500' : 'bg-green-500'}`}>
                    {isRent ? cards[10].text : cards[11].text}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                    {propertyLabel}
                </span>
                <span className="ml-auto text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700">
                    {d[12].text}{listing.listingNumber}
                </span>
            </div>

            {/* ── Spec chips ────────────────────────────────────── */}
            <div className="flex flex-wrap gap-2 mt-3">
                {!!listing.numbersOfRooms && (
                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor">
                            <path d="M200-280h60v-60h440v60h60v-154q0-21-8-39.5T730-506v-94q0-33-23.5-56.5T650-680H520q-11 0-21 3t-19 9q-9-6-19-9t-21-3H310q-33 0-56.5 23.5T230-600v94q-14 14-22 32.5t-8 39.5v154Zm60-120v-40q0-17 11.5-28.5T300-480h360q17 0 28.5 11.5T700-440v40H260Zm30-140v-80h160v80H290Zm220 0v-80h160v80H510ZM160-80q-33 0-56.5-23.5T80-160v-640q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v640q0 33-23.5 56.5T800-80H160Zm0-80h640v-640H160v640Zm0 0v-640 640Z"/>
                        </svg>
                        {listing.numbersOfRooms} {cards[15].text}
                    </span>
                )}
                {!!listing.totalArea && (
                    <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-xs font-medium px-2.5 py-1 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor">
                            <path d="M344-336 200-480l144-144 56 57-87 87 87 87-56 57Zm272 0-56-57 87-87-87-87 56-57 144 144-144 144ZM200-120q-33 0-56.5-23.5T120-200v-160h80v160h160v80H200Zm400 0v-80h160v-160h80v160q0 33-23.5 56.5T760-120H600ZM120-600v-160q0-33 23.5-56.5T200-840h160v80H200v160h-80Zm640 0v-160H600v-80h160q33 0 56.5 23.5T840-760v160h-80Z"/>
                        </svg>
                        {listing.totalArea} {cards[16].text}
                    </span>
                )}
                {!!listing.numberOfFloor && !!listing.numberOfStoreysOfBuilding && (
                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor">
                            <path d="M80-120v-720h400v160h400v560H80Zm80-80h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h320v-400H480v80h80v80h-80v80h80v80h-80v80Zm160-240v-80h80v80h-80Zm0 160v-80h80v80h-80Z"/>
                        </svg>
                        {listing.numberOfFloor} {cards[20].text} {listing.numberOfStoreysOfBuilding} {cards[21].text}
                    </span>
                )}
                {listing.typeOfNovelty && (
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${listing.typeOfNovelty === 'newBuilding' ? 'bg-orange-50 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="currentColor">
                            <path d="M120-120v-560h160v-160h400v320h160v400H520v-160h-80v160H120Zm80-80h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 320h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h80v-80h-80v80Zm0-160h80v-80h-80v80Z"/>
                        </svg>
                        {listing.typeOfNovelty === 'newBuilding' ? d[24].text : d[25].text}
                    </span>
                )}
            </div>

            {/* ── Features & preferences ────────────────────────── */}
            {listing.apartmentDetails && (
                <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
                    <p className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-semibold text-gray-500">{d[2].text}</span>
                        {listing.apartmentDetails}
                    </p>
                </div>
            )}
            {listing.description && (
                <div className="mt-3 rounded-xl bg-gray-50 px-4 py-3">
                    <p className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-semibold text-gray-500">{d[20].text}</span>
                        {listing.description}
                    </p>
                </div>
            )}

            {/* ── Price ─────────────────────────────────────────── */}
            <div className="mt-4 flex items-baseline gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" height="26px" viewBox="0 -960 960 960" width="26px" fill="#1C935D" className="flex-shrink-0 mb-[-3px]">
                    <path d="M444-200h70v-50q50-9 86-39t36-89q0-42-24-77t-96-61q-60-20-83-35t-23-41q0-26 18.5-41t53.5-15q32 0 50
                    15.5t26 38.5l64-26q-11-35-40.5-61T516-710v-50h-70v50q-50 11-78 44t-28 74q0 47 27.5 76t86.5 50q63 23 87.5 41t24.5
                    47q0 33-23.5 48.5T486-314q-33 0-58.5-20.5T390-396l-66 26q14 48 43.5 77.5T444-252v52Zm36 120q-83
                    0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54
                    54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134
                    0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
                </svg>
                <span className="text-3xl font-bold text-gray-800">{listing.price} &#8372;</span>
                {isRent && <span className="text-sm text-gray-400 font-normal">{cards[17].text}</span>}
            </div>

            {/* ── Info rows ─────────────────────────────────────── */}
            <div className="mt-4 space-y-2.5">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#3B82F6">
                        <path d="M160-40v-80h640v80H160Zm0-800v-80h640v80H160Zm320 400q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35
                        85q0 50 35 85t85 35ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0
                        33-23.5 56.5T800-160H160Zm70-80q45-56 109-88t141-32q77 0 141 32t109 88h70v-480H160v480h70Zm118 0h264q-29-20-62.5-30T480-280q-36 0-69.5
                        10T348-240Zm132-280q-17 0-28.5-11.5T440-560q0-17 11.5-28.5T480-600q17 0 28.5 11.5T520-560q0 17-11.5 28.5T480-520Zm0 40Z"/>
                    </svg>
                    <span><span className="font-medium text-gray-500">{d[23].text}</span>{listing.contact}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#FC931D">
                        <path d="M185-80q-17 0-29.5-12.5T143-122v-105q0-90 56-159t144-88q-40 28-62 70.5T259-312v190q0 11 3 22t10
                        20h-87Zm147 0q-17 0-29.5-12.5T290-122v-190q0-70 49.5-119T459-480h189q70 0 119 49t49 119v64q0 70-49
                        119T648-80H332Zm148-484q-66 0-112-46t-46-112q0-66 46-112t112-46q66 0 112 46t46 112q0 66-46 112t-112 46Z"/>
                    </svg>
                    <span><span className="font-medium text-gray-500">{d[27].text}</span>{listing.owner}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#EF4444">
                        <path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0
                        294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0
                        106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/>
                    </svg>
                    <span>{listing.location}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" height="15px" viewBox="0 -960 960 960" width="15px" fill="#9ca3af">
                        <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"/>
                    </svg>
                    <span>{d[3].text} {formattedDate}</span>
                </div>
            </div>

            {/* ── Action buttons ────────────────────────────────── */}
            <div className="flex gap-3 mt-6">
                <Link
                    to="/"
                    state={{ savedScroll }}
                    className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 text-sm font-semibold text-center transition-colors duration-200"
                >
                    {d[4].text}
                </Link>
                {isAdmin ? (
                    <button
                        onClick={handleDeleteUserDataByUserId}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-semibold transition-colors duration-200"
                    >
                        {d[5].text}{listing.owner}
                    </button>
                ) : (
                    <button
                        onClick={handleLeaveFeedback}
                        className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-semibold transition-colors duration-200"
                    >
                        {show ? d[6].text : d[7].text}
                    </button>
                )}
            </div>
        </div>
    );
};

export default DescriptionOfDetails;
