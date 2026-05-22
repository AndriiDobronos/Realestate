import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../services/useAuth';
import { RootState } from '../app/store';
import { setIsRegistration, setUserName, setUserId, setRole } from '../features/registration/registrationSlice';
import { setAuthProperty } from '../features/auth/authSlice';
import { setImages, clearImages } from '../features/upLoadImages/upLoadImagesSlice';
import { setFilterCriteria, resetFilter } from '../features/filter/filterSlice';
import { setFilterFeatures, resetMapFilter } from '../features/filterMap/filterMapSlice';
import { setScrollY } from '../features/scroll/scrollSlice';
import { resetNotificationProperty } from '../features/notification/notificationSlice';
import { fetchListings } from '../services/ListingService';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Pagination from '../components/Pagination';
import Footer from '../components/Footer';
import LeafletMaps from '../components/LeafletMaps';
import ListingCard from '../components/ListingCard';
import houseImage from '../assets/house_img.webp';

interface HomeListing {
    _id: string;
    date: number | string;
    listingNumber: number;
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
}

const Home = () => {
    const { language } = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts
    const location = useLocation();
    const toNewListingScroll = location.state?.scrollToNewListing || 0;
    const scrollY = useSelector((state: RootState) => state.scroll.y);
    const isRegistration = useSelector((state: RootState) => state.registration.isRegistered);
    const userName = useSelector((state: RootState) => state.registration.userName);
    const userId = useSelector((state: RootState) => state.registration.userId);
    const filterState = useSelector((state: RootState) => state.filter);
    const filterMapState = useSelector((state: RootState) => state.filterMap);
    const dispatch = useDispatch();
    const { handleResetUserData, checkAuth } = useAuth();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isLogin);
    const authChecking = useSelector((state: RootState) => state.auth.isChecking);
    const navigate = useNavigate();
    const [openFilter, setOpenFilter] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [openInfo, setOpenInfo] = useState(false);
    const [listings, setListings] = useState<HomeListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [featuredAd, setFeaturedAd] = useState({adsString:"", videoUrl:[""]});
    const filteredListings = !openFilter ? listings : listings.filter((listing) => {
        try {
            const priceNumber = parseFloat(`${listing.price}`.replace(/[^\d.]/g, ""));
            const minPrice = filterState.minPrice || "0";
            const maxPrice = filterState.maxPrice || "100000000";
            if (isNaN(priceNumber)) return false;
            return (
                priceNumber >= +minPrice &&
                priceNumber <= +maxPrice &&
                (filterState.listingType === "" || listing.listingType === filterState.listingType) &&
                (filterState.propertyType === "" || listing.propertyType === filterState.propertyType)
            );
        } catch (error) {
            console.error("Error filtering listing:", error, listing);
            return false;
        }
    });

    const [searchParams, setSearchParams] = useSearchParams();
    const PAGE_SIZE = 18;
    const currentPage = Math.max(1, Number(searchParams.get('page') ?? '1'));
    const finalListings = filterState.novelty === "newToOld"
        ? [...filteredListings].reverse()
        : filteredListings;
    const totalPages = Math.ceil(finalListings.length / PAGE_SIZE);
    const displayedListings = finalListings.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const [errorNotification, setErrorNotification] = useState<string>('');
    const [activeRotate, setActiveRotate] = useState(false);
    const [screenWidth, setScreenWidth] = useState<number>(600);
    const [repeatCount, setRepeatCount] = useState<number>(1);
    const [formData, setFormData] = useState({
        listingType: '',
        minPrice: '0',
        maxPrice: '100000000',
        novelty: 'newToOld',
        propertyType: '',
    });
    const [formMapFilter, setFormMapFilter] = useState({
        destination:'',
        rangeValue: 20,
        listingType: '',
        propertyType: '',
    });
    const initialMapFilter = {
        destination: '',
        rangeValue: 9999,
        listingType: '',
        propertyType: '',
    };
    const handleSaveScrollPosition = () => {
        dispatch(setScrollY(window.scrollY));
        localStorage.setItem('scrollPosition', window.scrollY.toString());
    };
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    useEffect(() => {
        const updateWidth = () => setScreenWidth(window.innerWidth || 600);
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    useEffect(() => {
        // approx 10px per character; +2 repetitions to ensure seamless loop
        const estimatedTextWidth = featuredAd.adsString.length * 10 || 150;
        setRepeatCount(Math.ceil(screenWidth / estimatedTextWidth) + 2);
    }, [screenWidth, featuredAd.adsString]);

    useEffect(() => {
        const fetchFeaturedAd = async () => {
            try {
                const response = await fetch(`${API_URL}/api/video`, {
                    method: "GET",
                    credentials: "include",
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    setErrorNotification(errorText);
                    return;
                }
                const data = await response.json();
                const ad = Array.isArray(data) ? data[0] : data;
                setFeaturedAd({
                    adsString: ad?.adsString ?? "",
                    videoUrl: ad?.videoUrl ?? [""],
                });
            } catch (error) {
                console.error('Failed to fetch featured ad:', error);
            }
        };

        fetchFeaturedAd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    useEffect(() => {
        const handleScroll = () => {
            dispatch(setScrollY(window.scrollY));
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [dispatch]);

    useEffect(() => {
        const savedPosition = localStorage.getItem('scrollPosition');
        if (savedPosition) {
            dispatch(setScrollY(Number(savedPosition)));
            localStorage.removeItem('scrollPosition');
        }
    }, [dispatch]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            localStorage.setItem('scrollPosition', scrollY.toString());
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [scrollY]);

    useEffect(() => {
        if (!loading && scrollY > 0) {
            // small delay to ensure content is rendered before restoring scroll
            const timer = setTimeout(() => {
                window.scrollTo({ top: scrollY, behavior: 'auto' });
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [loading, scrollY]);

    useEffect(() => {
        if (!loading && toNewListingScroll > 0) {
            const timer = setTimeout(() => {
                window.scrollTo({
                    top: toNewListingScroll,
                    behavior: 'auto'
                });
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [loading, toNewListingScroll]);

    useEffect(() => {
        setFormData({
            listingType: filterState.listingType,
            minPrice: filterState.minPrice === "0" ? "" : filterState.minPrice,
            maxPrice: filterState.maxPrice === "100000000" ? "" : filterState.maxPrice,
            novelty: filterState.novelty,
            propertyType: filterState.propertyType,
        });
    }, [filterState]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleChangeMapFilter = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'range' ? Number(value) : value;
        setFormMapFilter(prev => ({
            ...prev,
            [name]: finalValue
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(setFilterCriteria(formData));
        setSearchParams(prev => { prev.delete('page'); return prev; });
    };

    const handleSubmitMapFilter = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formMapFilter,
            rangeValue: Number(formMapFilter.rangeValue)
        };
        dispatch(setFilterFeatures(payload));
        setTimeout(()=>setActiveRotate(true),200);
        setShowFilter(false);
    };

    useEffect(() => {
        const savedImages = localStorage.getItem('userImages');
        if (savedImages) {
            dispatch(setImages(JSON.parse(savedImages)));
        }
    }, [dispatch]);

    useEffect(() => {
        const savedState = localStorage.getItem('registrationState');
        if (savedState) {
            const { isRegistered, userName, userId } = JSON.parse(savedState);
            dispatch(setIsRegistration(isRegistered));
            dispatch(setUserName(userName));
            dispatch(setUserId(userId));
        }
    }, [dispatch]);

    useEffect(() => {
        const getData = async () => {
            const data = await fetchListings();
            setListings(data);
            setLoading(false);
        };
        getData();
    }, []);

    useEffect(() => {
        const handleBeforeUnload = () => {
            localStorage.setItem('registrationState', JSON.stringify({
                isRegistered: isRegistration,
                userName: userName,
                userId: userId,
            }));
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRegistration, userName]);

    const handleDevReset = async () => {
        // auth + registration + server logout
        await handleResetUserData((data) => setListings(data as unknown as HomeListing[]));
        // all other slices
        dispatch(resetFilter());
        dispatch(resetMapFilter());
        dispatch(resetNotificationProperty());
        dispatch(setScrollY(0));
        dispatch(clearImages());
        // remaining localStorage keys
        localStorage.removeItem('scrollPosition');
        localStorage.removeItem('coordsCache');
        // reset local UI state
        setOpenFilter(false);
        setShowFilter(false);
        setActiveRotate(false);
        setFormData({ listingType: '', minPrice: '0', maxPrice: '100000000', novelty: 'newToOld', propertyType: '' });
        setFormMapFilter({ destination: '', rangeValue: 20, listingType: '', propertyType: '' });
    };

    const handleLoginClick = async () => {
        if (isRegistration) {
            const { isAuthenticated: live, user } = await checkAuth();
            if (live && user) {
                dispatch(setAuthProperty(true));
                dispatch(setUserName(user.name));
                dispatch(setUserId(user.id));
                dispatch(setRole(user.role === 'admin' ? 'admin' : 'user'));
                return;
            }
        }
        navigate('/login');
    };

    const scrollToListings = () => {
        document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
    };

    const handleResetFilters = () => {
        dispatch(resetFilter());
        setFormData({
            listingType: "",
            minPrice: "",
            maxPrice: "",
            novelty: "newToOld",
            propertyType: "",
        });
        setSearchParams(prev => { prev.delete('page'); return prev; });
    };

    const handlePageChange = (page: number) => {
        setSearchParams({ page: String(page) });
        document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleResetMapFilter = () => {
        dispatch(resetMapFilter())
        setFormMapFilter(initialMapFilter);
    };

    return (
        <div>
            {/* Hero Section */}
            <section className="relative bg-opacity-50 w-full lg:h-full min-h-[294%] flex flex-col" style={{backgroundColor:"rgba(0, 0, 0, 0.87)"}}>
                <div className="relative w-full  flex mt-16 flex-col lg:flex-row">

                    <div id="leftSide" className="text-center py-10 relative min-h-[80%] lg:w-1/2">
                        <h2 className="text-2xl sm:text-4xl font-bold mb-4">{contents.offers[0].text}</h2>
                        <p className=" mb-6 xl:text-lg">{contents.offers[1].text}</p>
                        <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
                            <button
                                onClick={scrollToListings}
                                className="z-10 bg-[#2563EB] text-white hover:bg-blue-700 px-5 rounded-xl shadow-md min-h-[44px]"
                            >
                                {contents.offers[2].text}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setOpenFilter((prev) => !prev); setShowFilter(false); setSearchParams(prev => { prev.delete('page'); return prev; }); }}
                                className="inline-flex items-center gap-2 z-10 bg-white/10 text-white hover:bg-white/20 px-4 rounded-xl min-h-[44px]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                                    <path d="M440-120v-240h80v80h320v80H520v80h-80Zm-320-80v-80h240v80H120Zm160-160v-80H120v-80h160v-80h80v240h-80Zm160-80v-80h400v80H440Zm160-160v-240h80v80h160v80H680v80h-80Zm-480-80v-80h400v80H120Z"/>
                                </svg>
                                {contents.offers[3].text}
                            </button>
                        </div>

                        <div id="sizeAddition" className={`w-full lg:h-[75%] h-[380px]`}></div>

                        {openFilter && <div style={{zIndex:"12"}}
                             className={`absolute top-[201px] left-[60%] -translate-x-1/2 -translate-y-full
                                         w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-200`}
                        ></div>}
                        <AnimatePresence>
                        {openFilter && (
                            <motion.div
                                key="card-filter"
                                initial={{ opacity: 0, y: -10, x: "-50%" }}
                                animate={{ opacity: 1, y: 0, x: "-50%" }}
                                exit={{ opacity: 0, y: -10, x: "-50%" }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="absolute z-10 left-1/2 mt-2 w-2/3 max-w-[90vw] top-48
                             bg-gray-100 p-4 text-sm text-gray-700 rounded-xl shadow-lg text-left
                             overflow-hidden"
                            >
                            <form onSubmit={handleSubmit}>
                                <p className="font-medium mb-1">{contents.offers[4].text}</p>
                                <label className="flex items-center gap-2 py-2 cursor-pointer">
                                    <input type="radio" name="listingType" value="rent" onChange={handleChange} checked={formData.listingType === "rent"} />
                                    {contents.offers[5].text}
                                </label>
                                <label className="flex items-center gap-2 py-2 cursor-pointer">
                                    <input type="radio" name="listingType" value="sale" onChange={handleChange} checked={formData.listingType === "sale"} />
                                    {contents.offers[6].text}
                                </label>

                                <p className="font-medium mt-2 pt-2 border-t border-gray-300">{contents.offers[7].text}</p>
                                <label className="flex items-center gap-2 py-2 cursor-pointer">
                                    <input type="radio" name="propertyType" value="flat" onChange={handleChange} checked={formData.propertyType === "flat"} />
                                    {contents.offers[8].text}
                                </label>
                                <label className="flex items-center gap-2 py-2 cursor-pointer">
                                    <input type="radio" name="propertyType" value="private house" onChange={handleChange} checked={formData.propertyType === "private house"} />
                                    {contents.offers[9].text}
                                </label>
                                <label className="flex items-center gap-2 py-2 cursor-pointer">
                                    <input type="radio" name="propertyType" value="commercial real estate" onChange={handleChange} checked={formData.propertyType === "commercial real estate"} />
                                    {contents.offers[10].text}
                                </label>

                                <p className="font-medium mt-2 pt-2 border-t border-gray-300">{contents.offers[11].text}</p>
                                <div className="flex flex-row gap-4 mb-3">
                                    <input type="number" name="minPrice" onChange={handleChange} value={formData.minPrice}
                                           className="border p-2 w-1/2 rounded-xl min-h-[44px]" placeholder="Minimum"/>
                                    <input type="number" name="maxPrice" onChange={handleChange} value={formData.maxPrice}
                                           className="border p-2 w-1/2 rounded-xl min-h-[44px]" placeholder="Maximum"/>
                                </div>

                                <p className="font-medium pt-2 border-t border-gray-300">{contents.offers[12].text}</p>
                                <label className="flex items-center gap-2 py-2 cursor-pointer">
                                    <input type="radio" name="novelty" value="newToOld" onChange={handleChange} checked={formData.novelty === "newToOld"} />
                                    {contents.offers[13].text}
                                </label>
                                <label className="flex items-center gap-2 py-2 cursor-pointer">
                                    <input type="radio" name="novelty" value="oldToNew" onChange={handleChange} checked={formData.novelty === "oldToNew"} />
                                    {contents.offers[14].text}
                                </label>

                                <div className="flex gap-3 mt-3 pt-2 border-t border-gray-300">
                                    <button type="submit" onClick={scrollToListings}
                                            className="bg-[#2563EB] text-white px-4 rounded-xl flex-1 min-h-[44px]">
                                        {contents.offers[15].text}
                                    </button>
                                    <button type="button" onClick={handleResetFilters}
                                            className="bg-[#F59E0B] text-white px-4 rounded-xl min-h-[44px]">
                                        {contents.offers[16].text}
                                    </button>
                                </div>
                            </form>
                        </motion.div>)}
                        </AnimatePresence>


                        <div className={`absolute z-42 justify-center top-[28px] flex flex-row gap-[44%] w-full pt-96`}>
                            <div className=" h-[82px] w-[40px] border-white border-1 rounded-tl-lg rounded-bl-lg flex"
                                 style={  {boxShadow: 'inset 3px 3px 12px rgba(0, 0, 0, 0.6)',background:'#fff',cursor:'pointer'}}
                                 onClick={()=>{setShowFilter(prev=>!prev); setOpenInfo(false)}} >
                                <div  style={{transform: "rotateZ(90deg)",justifyItems:'center',alignContent:'center',marginLeft:'8px'}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
                                        <path d="M440-120v-240h80v80h320v80H520v80h-80Zm-320-80v-80h240v80H120Zm160-160v-80H120v-80h160v-80h80v240h-80Zm160-80v-80h400v80H440Zm160-160v-240h80v80h160v80H680v80h-80Zm-480-80v-80h400v80H120Z"/>
                                    </svg>
                                </div>
                            </div>
                            <AnimatePresence>
                            {showFilter && <motion.div
                                key="map-filter"
                                initial={{ opacity: 0, y: -10, x: "-50%" }}
                                animate={{ opacity: 1, y: 0, x: "-50%" }}
                                exit={{ opacity: 0, y: -10, x: "-50%" }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="absolute z-20 left-[50%] top-44 w-[43%] max-w-[90vw]
                             bg-gray-100 p-4 text-sm text-gray-700 rounded-xl shadow-lg text-left">
                                <form onSubmit={handleSubmitMapFilter}>
                                    <p className="font-medium mb-1">{contents.offers[17].text}</p>
                                    <input type="text"
                                           name="destination"
                                           value={formMapFilter.destination}
                                           onChange={handleChangeMapFilter}
                                           placeholder={contents.offers[18].text}
                                           className="w-full mb-2 rounded-xl border px-3 min-h-[44px]" />
                                    <p className="font-medium pt-2 border-t border-gray-300 mb-1">{contents.offers[19].text}</p>
                                    <input type="range" name="rangeValue" min="0" max="40"
                                           value={formMapFilter.rangeValue}
                                           onChange={handleChangeMapFilter}
                                           className="w-full"/>
                                    <p className="text-xs mb-2">{contents.offers[20].text}{formMapFilter.rangeValue}km</p>

                                    <p className="font-medium pt-2 border-t border-gray-300">{contents.offers[4].text}</p>
                                    <label className="flex items-center gap-2 py-2 cursor-pointer">
                                        <input type="radio" name="listingType" value="rent" onChange={handleChangeMapFilter} checked={formMapFilter.listingType === "rent"} />
                                        {contents.offers[5].text}
                                    </label>
                                    <label className="flex items-center gap-2 py-2 cursor-pointer">
                                        <input type="radio" name="listingType" value="sale" onChange={handleChangeMapFilter} checked={formMapFilter.listingType === "sale"} />
                                        {contents.offers[6].text}
                                    </label>

                                    <p className="font-medium pt-2 border-t border-gray-300">{contents.offers[7].text}</p>
                                    <label className="flex items-center gap-2 py-2 cursor-pointer">
                                        <input type="radio" name="propertyType" value="flat" onChange={handleChangeMapFilter} checked={formMapFilter.propertyType === "flat"} />
                                        {contents.offers[8].text}
                                    </label>
                                    <label className="flex items-center gap-2 py-2 cursor-pointer">
                                        <input type="radio" name="propertyType" value="private house" onChange={handleChangeMapFilter} checked={formMapFilter.propertyType === "private house"} />
                                        {contents.offers[9].text}
                                    </label>
                                    <label className="flex items-center gap-2 py-2 cursor-pointer">
                                        <input type="radio" name="propertyType" value="commercial real estate" onChange={handleChangeMapFilter} checked={formMapFilter.propertyType === "commercial real estate"} />
                                        {contents.offers[10].text}
                                    </label>

                                    <div className="flex gap-3 mt-3 pt-2 border-t border-gray-300">
                                        <button type="submit" className="bg-[#2563EB] text-white px-3 rounded-xl flex-1 min-h-[44px]">
                                            {contents.offers[15].text}
                                        </button>
                                        <button type="button" onClick={handleResetMapFilter}
                                                className="bg-[#F59E0B] text-white px-3 rounded-xl min-h-[44px]">
                                            {contents.offers[16].text}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>}
                            </AnimatePresence>

                            {!openFilter && <div className="absolute w-[86%] mt-[-21px]"
                                             style={!activeRotate ? {transform: "rotateX(-74deg) translateY(-1740px) translateX(0px)",
                                                 transitionDuration:"700ms", scale:"0.496", zIndex:"0" } :
                                                 {transitionDuration:"700ms", marginTop:"-376px", width:"90%", zIndex:"21"}}
                                             onClick={() => setActiveRotate(true)}
                            ><div className="relative w-full duration-300 ease-in-out hover:scale-100">
                                {activeRotate && <button  onClick={(e)=>{e.stopPropagation(); setActiveRotate(false)}}
                                                          className="absolute top-3 z-[2001] py-1 rounded-[4px] bg-red-100 text-gray-700">
                                    {contents.offers[31].text}
                                </button>}
                                <div className={`w-full mt-[-18px]`}>
                                    <LeafletMaps listings={listings} formMapFilter={filterMapState} isVisible={activeRotate} />
                                </div>
                            </div>
                            </div>}

                            <div className="h-[82px] w-[40px] border-white border-1 rounded-tr-lg rounded-br-lg flex"
                                 style={  {boxShadow: 'inset 3px 3px 12px rgba(0, 0, 0, 0.6)',background:'#fff',cursor:'pointer'}}
                                 onClick={()=>setOpenInfo(prev=>!prev)}>
                                <div  style={{justifyItems:'center',alignContent:'center',marginLeft:'8px'}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="#5f6368">
                                        <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17
                                     11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83
                                      0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0
                                       227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
                                    </svg>
                                </div>
                            </div>
                            <AnimatePresence>
                            {openInfo && <motion.div
                                key="info-panel"
                                initial={{ opacity: 0, y: -10, x: "-50%" }}
                                animate={{ opacity: 1, y: 0, x: "-50%" }}
                                exit={{ opacity: 0, y: -10, x: "-50%" }}
                                transition={{ duration: 0.25, ease: 'easeInOut' }}
                                className="absolute z-20 top-44 w-[43%] max-w-[90vw] left-[50%] text-xs sm:text-sm
                             bg-gray-100 p-3 sm:p-4 text-gray-700 rounded-xl shadow-lg text-left" id="info">
                                {contents.offers[21].text}<br/>
                                {contents.offers[22].text}<br/>
                                {contents.offers[23].text}<br/>
                                {contents.offers[24].text}<br/>
                                {contents.offers[25].text}<br/>
                                {contents.offers[26].text}<br/>
                                {contents.offers[27].text}<br/>
                                {contents.offers[28].text}<br/>
                                {contents.offers[29].text}<br/>
                                <p className="hidden sm:block">{contents.offers[30].text}</p>

                            </motion.div>}
                            </AnimatePresence>

                        </div>

                    </div>


                    <div id="rightSideScreen" className="lg:w-1/2 flex justify-center flex-col">
                        <div id="content" className="container mx-auto text-center py-10 min-h-[17rem] flex flex-col justify-start">
                            {(isRegistration && isAuthenticated)
                                ? <h2 className="text-4xl font-bold mb-4 text-yellow-300">{contents.offers[32].text}</h2>
                                : <h2 className="text-4xl font-bold mb-4">{isRegistration ? contents.offers[33].text : contents.offers[40].text}</h2>}
                            {(isRegistration && isAuthenticated) ? <p className="text-lg mb-6 text-yellow-300">{contents.offers[34].text}</p> :
                                <p className="text-lg mb-6">{contents.offers[35].text}</p>}
                            {(authChecking && !isAuthenticated) ? <div className="flex justify-center flex-wrap gap-4 opacity-0 pointer-events-none" aria-hidden="true">
                                {!isRegistration && <Link to="registration" tabIndex={-1}>
                                    <button className="bg-[#2563EB] text-white hover:bg-blue-700 px-6 rounded-xl shadow-md min-h-[44px]">
                                        {contents.offers[36].text}
                                    </button>
                                </Link>}
                                <Link to="login" tabIndex={-1}>
                                    <button className="bg-white/15 text-white hover:bg-white/25 border border-white/30 px-6 rounded-xl min-h-[44px]">
                                        {contents.offers[37].text}
                                    </button>
                                </Link>
                            </div> : (isRegistration && isAuthenticated) ? <div className="flex justify-center flex-wrap gap-4">
                                <Link to="listings/new/rent">
                                    <button className="bg-[#2563EB] text-white hover:bg-blue-700 px-6 rounded-xl shadow-md min-h-[44px]">
                                        {contents.offers[5].text}
                                    </button>
                                </Link>
                                <Link to="listings/new/sale">
                                    <button className="bg-[#F59E0B] text-white hover:bg-yellow-500 px-6 rounded-xl shadow-md min-h-[44px]">
                                        {contents.offers[6].text}
                                    </button>
                                </Link>
                            </div> : <div className="flex justify-center flex-wrap gap-4">
                                {!isRegistration && <Link to="registration">
                                    <button className="bg-[#2563EB] text-white hover:bg-blue-700 px-6 rounded-xl shadow-md min-h-[44px]">
                                        {contents.offers[36].text}
                                    </button>
                                </Link>}
                                <button
                                    onClick={handleLoginClick}
                                    className="bg-white/15 text-white hover:bg-white/25 border border-white/30 px-6 rounded-xl min-h-[44px]"
                                >
                                    {contents.offers[37].text}
                                </button>
                            </div>}
                        </div>

                        <section id={`advertisement`} className="mx-auto mt-2 mb-4 w-[78%]">
                            <div className="overflow-hidden py-2">
                                <div className="flex whitespace-nowrap animate-marquee">
                                    {[...Array(repeatCount)].map((_, i) => (
                                        <p key={i} className="mx-4 text-lg font-bold text-white">
                                            {featuredAd.adsString || contents.offers[41].text}{errorNotification}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            {featuredAd.videoUrl?.[0] ? (
                                <video controls autoPlay muted loop src={featuredAd.videoUrl[0]} />
                            ) : (
                                <div className="w-full rounded-lg overflow-hidden relative"
                                     style={{ aspectRatio: "16/9", background: 'linear-gradient(180deg, #0b1120 0%, #1a2744 60%, #243040 100%)' }}>
                                    {/* Moon */}
                                    <div className="absolute top-[10%] right-[8%] w-8 h-8 rounded-full"
                                         style={{ background: '#fef9c3', boxShadow: '0 0 28px 12px rgba(254,249,195,0.1)' }} />
                                    {/* Stars */}
                                    {[
                                        { s: 2, t: '8%',  l: '6%',  dur: 2.1, del: 0   },
                                        { s: 1, t: '14%', l: '19%', dur: 3.1, del: 0.6 },
                                        { s: 2, t: '7%',  l: '37%', dur: 2.6, del: 1.0 },
                                        { s: 1, t: '19%', l: '52%', dur: 2.0, del: 0.3 },
                                        { s: 2, t: '11%', l: '71%', dur: 2.4, del: 1.3 },
                                        { s: 1, t: '5%',  l: '84%', dur: 3.0, del: 0.8 },
                                        { s: 1, t: '22%', l: '29%', dur: 2.9, del: 0.4 },
                                        { s: 2, t: '13%', l: '62%', dur: 1.9, del: 1.1 },
                                    ].map((star, i) => (
                                        <motion.div key={i} className="absolute rounded-full bg-white"
                                            style={{ width: star.s, height: star.s, top: star.t, left: star.l }}
                                            animate={{ opacity: [0.2, 1, 0.2] }}
                                            transition={{ repeat: Infinity, duration: star.dur, delay: star.del, ease: 'easeInOut' }}
                                        />
                                    ))}
                                    {/* Buildings */}
                                    <div className="absolute bottom-0 left-0 right-0 h-full flex items-end justify-center gap-[1%] px-[3%]">
                                        {[
                                            { w: '7%',  h: '38%', bg: '#2d3748', wDur: 3.2, wDel: 0.5, del: 0.55 },
                                            { w: '10%', h: '57%', bg: '#1e3a5f', wDur: 2.8, wDel: 1.1, del: 0.4  },
                                            { w: '8%',  h: '70%', bg: '#1e2d45', wDur: 3.5, wDel: 0.2, del: 0.25 },
                                            { w: '13%', h: '47%', bg: '#2d3748', wDur: 2.5, wDel: 0.8, del: 0.1  },
                                            { w: '9%',  h: '80%', bg: '#162035', wDur: 3.0, wDel: 0,   del: 0    },
                                            { w: '11%', h: '52%', bg: '#1e3a5f', wDur: 2.7, wDel: 1.3, del: 0.15 },
                                            { w: '8%',  h: '63%', bg: '#1e2d45', wDur: 3.3, wDel: 0.6, del: 0.3  },
                                            { w: '10%', h: '43%', bg: '#2d3748', wDur: 2.9, wDel: 0.9, del: 0.45 },
                                            { w: '6%',  h: '34%', bg: '#2d3748', wDur: 3.1, wDel: 0.4, del: 0.6  },
                                        ].map((b, i) => (
                                            <motion.div key={i} className="relative flex-shrink-0"
                                                style={{ width: b.w, height: b.h, background: b.bg, transformOrigin: 'bottom' }}
                                                initial={{ scaleY: 0 }}
                                                animate={{ scaleY: 1 }}
                                                transition={{ duration: 0.75, delay: b.del, ease: 'backOut' }}
                                            >
                                                <motion.div className="absolute inset-[8%]"
                                                    style={{
                                                        backgroundImage: 'radial-gradient(circle, rgba(255,235,120,0.9) 1px, transparent 1px)',
                                                        backgroundSize: '6px 8px',
                                                    }}
                                                    animate={{ opacity: [0.25, 0.8, 0.25] }}
                                                    transition={{ repeat: Infinity, duration: b.wDur, delay: b.wDel, ease: 'easeInOut' }}
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                    {/* Ground line */}
                                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-600" />
                                    {/* Loading indicator */}
                                    <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center gap-1">
                                        <p className="text-slate-400 text-xs sm:text-sm mr-1">{contents.offers[42].text}</p>
                                        {[0, 0.3, 0.6].map((del, i) => (
                                            <motion.span key={i} className="w-1 h-1 rounded-full bg-slate-400 inline-block"
                                                animate={{ opacity: [0.2, 1, 0.2] }}
                                                transition={{ repeat: Infinity, duration: 1.2, delay: del, ease: 'easeInOut' }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                        </section>

                    </div>
                </div>

                <div className="w-full lg:h-full h-[194%] bg-opacity-50 " style={{backgroundColor:"rgba(0, 0, 0, 0.87)"}}>
                    <img src={houseImage} alt="Modern Housing" className="absolute inset-0 w-full h-full object-cover opacity-100 z-[-1]" />
                </div>

                {/* Scroll hint */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 z-10 cursor-pointer"
                    onClick={scrollToListings}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" height="36px" viewBox="0 -960 960 960" width="36px" fill="currentColor">
                        <path d="M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z"/>
                    </svg>
                </motion.div>

            </section>


            {/* TODO: remove before deploy */}
            <div className="container mx-auto text-center py-10">
                <button onClick={handleDevReset}>
                    **** 🔄 DEV: Reset all state ****
                </button>
            </div>


            {/* Popular Listings Section */}
            <section id="listings" className="py-10 px-4 xl:px-8" >
                <div className="mx-auto">
                    <div className="mb-10 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
                        {contents.offers[38].text}
                    </h1>
                    <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
                        {contents.offers[43].text}
                    </p>
                </div>
                    
                    {loading ? <LoadingSkeleton /> : (
                        <>
                            <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {displayedListings.map((listing) => (
                                    <ListingCard
                                        key={listing._id}
                                        listing={listing}
                                        scrollY={scrollY}
                                        onSaveScroll={handleSaveScrollPosition}
                                    />
                                ))}
                            </ul>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </>
                    )}
                </div>
            </section>
            <Footer color={'#205e7e'}/>
        </div>
    );
};
export { Home };