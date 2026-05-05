import React, {useEffect, useState} from 'react';
import houseImage from "../assets/house_img.webp";
import { Link, useLocation } from 'react-router-dom';
import {RootState} from "../app/store";
import { useSelector, useDispatch } from 'react-redux';
import {setIsRegistration, setUserName, resetRegistration, setUserId} from "../features/registration/registrationSlice";
import {setImages} from "../features/upLoadImages/upLoadImagesSlice";
import { setFilterCriteria, resetFilter } from "../features/filter/filterSlice";
import { setFilterFeatures, resetMapFilter} from "../features/filterMap/filterMapSlice";
import {fetchListings} from "../services/ListingService";
import LoadingSkeleton from "../../src/components/LoadingSkeleton";
import Footer from "../components/Footer";
import LeafletMaps from "../components/LeafletMaps";
import { setScrollY } from '../features/scroll/scrollSlice';
import { useLanguage } from '../context/LanguageContext';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import { useAuth } from '../services/useAuth';

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
    const { handleResetUserData } = useAuth();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isLogin);
    const authChecking = useSelector((state: RootState) => state.auth.isChecking);
    const [openFilter, setOpenFilter] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [renderFilter, setRenderFilter] = useState(false);
    const [openInfo, setOpenInfo] = useState(false);
    const [animate, setAnimate] = useState(false);
    const [listings, setListings] = useState<any[]>([]);
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

    const [message, setMessage] = useState('*');
    const [errorNotification, setErrorNotification] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState('');
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
        dispatch(setScrollY(window.scrollY)); // сохраняем scroll перед переходом
        localStorage.setItem('scrollPosition', window.scrollY.toString());
    };
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    useEffect(() => {
        // Обновляем ширину экрана при первом рендере и при ресайзе
        const updateWidth = () => setScreenWidth(window.innerWidth || 600);
        updateWidth();

        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    useEffect(() => {
        // Оцениваем примерную длину строки в пикселях (грубая оценка)
        const estimatedTextWidth = featuredAd.adsString.length * 10 || 150; // 10px на символ (зависит от шрифта)

        // Минимум 2 повторения для непрерывности
        const count = Math.ceil(screenWidth / estimatedTextWidth) + 2;
        setRepeatCount(count);
    }, [screenWidth, featuredAd.adsString]);

    useEffect(() => {
        const fetchFeaturedAd = async () => {
            const response = await fetch(`${API_URL}/api/video`, {
                method: "GET",
                credentials: "include",
            });
            if (!response.ok) {
                const errorText = await response.text();
                setErrorNotification(errorText);
            }
            const data = await response.json();
            setFeaturedAd(data);
        };

        fetchFeaturedAd();
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
        if (!loading && scrollY > 0) {  // Ждем завершения загрузки данных и рендера контента
            const timer = setTimeout(() => {
                window.scrollTo({
                    top: scrollY,
                    behavior: 'auto'   //'smooth'
                });
            }, 300); // Небольшая задержка для гарантии рендера контента

            return () => clearTimeout(timer);
        }
    }, [loading, scrollY]); // Добавляем loading в зависимости

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
        const savedPosition = localStorage.getItem('scrollPosition');
        if (savedPosition) {
            dispatch(setScrollY(Number(savedPosition)));
            localStorage.removeItem('scrollPosition');
        }
    }, [dispatch]);

    useEffect(() => {
        if (openFilter) {
            setRenderFilter(true); // монтируем блок
            setTimeout(() => setAnimate(true), 10); // чуть позже активируем анимацию появления
        } else {
            setAnimate(false); // запускаем анимацию исчезновения
            const timeout = setTimeout(() => setRenderFilter(false), 700); // размонтируем после анимации
            return () => clearTimeout(timeout);
        }
    }, [openFilter]);

    useEffect(() => {
        setFormData({
            listingType: filterState.listingType,
            minPrice: filterState.minPrice === "0" ? "" : filterState.minPrice, // Показываем пустоту вместо "0"
            maxPrice: filterState.maxPrice === "100000000" ? "" : filterState.maxPrice, // Показываем пустоту вместо "100000000"
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
        // Восстановление из localStorage при загрузке
        const savedState = localStorage.getItem('registrationState');
        if (savedState) {
            const { isRegistered, userName, userId } = JSON.parse(savedState);
            dispatch(setIsRegistration(isRegistered));
            dispatch(setUserName(userName));
            dispatch(setUserId(userId));
        }
    }, [dispatch]);

    // const checkAuth = async () => {
    //     try {
    //         const response = await fetch(`${API_URL}/check-auth`, {
    //             credentials: "include"
    //         });
    //         const data = await response.json();
    //         if (data.isAuthenticated) {
    //             // Синхронизация с localStorage
    //             localStorage.setItem('registrationState', JSON.stringify({
    //                 isRegistered: true,
    //                 userName: data.user.name,
    //                 userId: data.user.id,
    //             }));
    //         }
    //     } catch (err) {
    //         console.error('Auth check error:', err);
    //     }
    // };

    Home.handleLogOut = async () => {
        if (!confirm("Confirm continue deleting data!")) return;

        try {
            // 1. Получаем объявления пользователя ДО выхода
            const listingsResponse = await fetch(
                `${API_URL}/api/listings/ownerId/${encodeURIComponent(userId)}`,
                { credentials: 'include' }
            );

            if (!listingsResponse.ok) {
                const errorText = await listingsResponse.text();
                throw new Error(`Failed to fetch listings: ${errorText}`);
            }

            const userListings = await listingsResponse.json();
            const allImages = userListings.flatMap((l: any) => l.image);

            // 2. Удаляем объявления и пользователя
            if (userListings.length > 0) {
                await handleDeleteListingByUserId();
                await handleImageDelete(allImages);
            }

            // 3. Удаляем комментарии пользователя
            await handleDeleteCommentByAuthorId(userId);

            // 4. Удаляем только пользователя
            await handleDeleteUserDataByUserId();

            // 5. Теперь разрываем сессию и удаляем куки
            const logoutResponse = await fetch(`${API_URL}/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (!logoutResponse.ok) {
                const errorText = await logoutResponse.text();
                throw new Error(`Logout failed: ${errorText}`);
            }

            // 6. Очистка клиентского состояния
            dispatch(resetRegistration());
            localStorage.removeItem('user');
            localStorage.removeItem('registrationState');
            localStorage.removeItem('userImages');

            // 7. Обновляем список объявлений
            const freshData = await fetchListings();
            setListings(freshData);

        } catch (error:any) {
            setMessage(`Logout error: ${error.message}`);
        }
    };

    const handleDeleteCommentByAuthorId = async(authorId:string) => {
        try {
            const response = await fetch(`${API_URL}/api/comments/author/${authorId}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Delete failed');
            setMessage(`Successful delete`)

        } catch (error) {
            setMessage(`Error delete comment: ${error}`);
        }
    }

    const handleDeleteListingByUserId = async () => {
        try {
            const response = await fetch(
                `${API_URL}/listings/ownerId/${encodeURIComponent(userId)}`,
                {
                    method: 'DELETE',
                    credentials: 'include' // Важно для авторизации
                }
            );
            if (!response.ok) {
                const errorText = await response.text();
                setErrorMessage(`Delete listings failed: ${errorText}`);
                return;
            }
            const data = await response.json();
            setMessage(`Success: ${data.message}  DeletedCount: ${data.deletedCount}`);
            //setListings(prev => prev.filter((l: any) => l.owner !== userName));
            setListings(prev => prev.filter((l: any) => l.ownerId !== userId));
        } catch (error:any) {
            setMessage(`Failed to delete User data: ${error.message}`)
        }
    };

    const handleDeleteUserDataByUserId = async () => {
        try {
            const response = await fetch(`${API_URL}/api/users/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!response.ok) {
                setErrorMessage(`Error: ${response.statusText}`)
                throw new Error(`Error: ${response.statusText}`);
            }
            const data = await response.json();
            setMessage(`Success: ${data.message}`);

        } catch (error: any) {
            setMessage(`Failed to delete User data: ${error.message}`);
        }
    };

    const handleImageDelete = async (imageUrls: string[]) => {
        try {
            await Promise.all(
                imageUrls.map(async (url) => {
                    if (!url) return;

                    const urlParts = url.split('/');
                    const publicId = urlParts[urlParts.length - 1].split('.')[0];

                    const signatureResponse = await fetch(`${API_URL}/generate-signature`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ public_id: publicId, timestamp: Math.floor(Date.now() / 1000) })
                    });

                    const data = await signatureResponse.json();

                    await fetch(`https://api.cloudinary.com/v1_1/dndnmla09/image/destroy`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            public_id: publicId,
                            api_key: data.api_key,
                            timestamp: data.timestamp,
                            signature: data.signature
                        })
                    });
                })
            );
        } catch (error) {
            console.error('Error deleting images:', error);
            throw error;
        }
    };

    useEffect(() => {
        const getData = async () => {
            const data = await fetchListings();
            setListings(data);
            setLoading(false);
        };
        getData();
    }, [message]);

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
    }, [isRegistration, userName]); // Зависимости от состояния

    const scrollToListings = () => {
        document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
    };

    const handleResetFilters = () => {
        dispatch(resetFilter());
        // Явный сброс локального состояния формы
        setFormData({
            listingType: "",
            minPrice: "",
            maxPrice: "",
            novelty: "newToOld",
            propertyType: "",
        });
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
                        {/*{container}*/}
                        <h2 className="text-2xl sm:text-4xl font-bold mb-4">{contents.offers[0].text}</h2>
                        {/*{Find Your Dream Home}*/}
                        <p className=" mb-6 xl:text-lg">{contents.offers[1].text}</p>
                        {/*{Explore the best properties for sale and rent.}*/}
                        <div className="flex flex-wrap gap-2 sm:gap-4 justify-center">
                            <button onClick={scrollToListings} className="z-10">{contents.offers[2].text}</button>
                            {/*Show all lists*/}
                            <button type="button" onClick={() => {setOpenFilter((prev) => !prev); setShowFilter(false)}}
                                    className="inline-flex items-center z-10">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
                                    <path d="M440-120v-240h80v80h320v80H520v80h-80Zm-320-80v-80h240v80H120Zm160-160v-80H120v-80h160v-80h80v240h-80Zm160-80v-80h400v80H440Zm160-160v-240h80v80h160v80H680v80h-80Zm-480-80v-80h400v80H120Z"/>
                                </svg>
                                {'\u00A0'}{'\u00A0'}{contents.offers[3].text} {/*Filters*/}
                            </button>
                        </div>

                        <div id="sizeAddition" className={`w-full lg:h-[75%] h-[380px]`}></div>

                        {openFilter && <div style={{zIndex:"12"}}
                             className={`absolute top-[201px] left-[60%] -translate-x-1/2 -translate-y-full
                                         w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-200`}
                        ></div>}
                        {renderFilter && (
                            <div className={`absolute z-10 left-1/2  mt-2 w-2/3 top-48
                             bg-gray-200 p-4 text-sm text-gray-700 rounded-lg shadow-md  text-left
                             transform -translate-x-1/2 transition-all duration-700 ease-in-out overflow-hidden
                             before:top-0 before:left-1/2 before:-translate-x-1/2 before:-translate-y-full
                             before:border-8 before:border-transparent before:border-b-gray-200 before:absolute
                             ${animate ? "opacity-100 -translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}
                             >
                            <form onSubmit={handleSubmit}>
                                <p>{contents.offers[4].text}</p>
                                {/*{Please select a type of property}*/}
                                <input type="radio" id="rent" name="listingType" value="rent"  onChange={handleChange}
                                       checked={formData.listingType === "rent"} />
                                    <label htmlFor="rent" className="ml-2">{contents.offers[5].text}</label><br></br>
                                {/*{For rent}*/}
                                <input type="radio" id="sale" name="listingType" value="sale"  onChange={handleChange}
                                       checked={formData.listingType === "sale"} />
                                    <label htmlFor="sale" className="ml-2">{contents.offers[6].text}</label>
                                {/*{For sale}*/}
                                <p className="mt-3" style={{borderTop:"1px solid darkgray"}}>{contents.offers[7].text}</p>
                                {/*{Please select a features of real estate}*/}
                                <input type="radio" id="flat" name="propertyType" value="flat"  onChange={handleChange}
                                       checked={formData.propertyType === "flat"} />
                                <label htmlFor="flat" className="ml-2">{contents.offers[8].text}</label><br></br>
                                {/*{Apartment}*/}
                                <input type="radio" id="private" name="propertyType" value="private house"  onChange={handleChange}
                                       checked={formData.propertyType === "private house"} />
                                <label htmlFor="private" className="ml-2">{contents.offers[9].text}</label><br></br>
                                {/*{Private house}*/}
                                <input type="radio" id="commercial" name="propertyType" value="commercial real estate"  onChange={handleChange}
                                       checked={formData.propertyType === "commercial real estate"} />
                                <label htmlFor="commercial" className="ml-2">{contents.offers[10].text}</label>
                                {/*{Commercial real estate}*/}
                                <p className="mt-3" style={{borderTop:"1px solid darkgray"}}>{contents.offers[11].text}</p>
                                {/*{Please select a range of acceptable prices}*/}
                                <div className="flex flex-row gap-8 mb-3">
                                    <input type="number" id="minPrice" name="minPrice"
                                           onChange={handleChange} value={formData.minPrice}
                                           className="border p-2 w-1/3 rounded-md" placeholder="Minimum"/>
                                    <input type="number" id="maxPrice" name="maxPrice"
                                           onChange={handleChange} value={formData.maxPrice}
                                           className="border p-2 w-1/3 rounded-md" placeholder="Maximum"/>
                                </div>

                                <p style={{borderTop:"1px solid darkgray"}}>{contents.offers[12].text}</p>
                                {/*{Sort lists by posting date}*/}
                                <input type="radio" id="newToOld" name="novelty" value="newToOld" onChange={handleChange} checked={formData.novelty === "newToOld"}/>
                                <label htmlFor="rent" className="ml-2"></label>{contents.offers[13].text}<br></br>
                                {/*{From new to old}*/}
                                <input type="radio" id="oldToNew" name="novelty" value="oldToNew" onChange={handleChange} checked={formData.novelty === "oldToNew"}/>
                                <label htmlFor="oldToNew" className="ml-2">{contents.offers[14].text}</label><br/>
                                {/*{From old to new}*/}
                                <button type="submit" onClick={scrollToListings}
                                        className="mt-4 bg-blue-500 text-white p-2 rounded-md w-1/3 mr-8">
                                    {contents.offers[15].text}
                                    {/*{Search}*/}
                                </button>
                                <button className="bg-yellow-300" onClick={handleResetFilters}>{contents.offers[16].text}</button>
                                {/*{Reset Filters}*/}
                            </form>
                        </div>)}


                        <div className={`absolute z-42 justify-center top-[28px] flex flex-row gap-[44%] w-full pt-96`}>
                        {/*${!activeRotate ? "pt-96" : "pt-96"}*/}
                            <div className=" h-[82px] w-[40px] border-white border-1 rounded-tl-lg rounded-bl-lg flex"
                                 style={  {boxShadow: 'inset 3px 3px 12px rgba(0, 0, 0, 0.6)',background:'#fff',cursor:'pointer'}}
                                 onClick={()=>{setShowFilter(prev=>!prev); setOpenInfo(false)}} >
                                <div  style={{transform: "rotateZ(90deg)",justifyItems:'center',alignContent:'center',marginLeft:'8px'}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
                                        <path d="M440-120v-240h80v80h320v80H520v80h-80Zm-320-80v-80h240v80H120Zm160-160v-80H120v-80h160v-80h80v240h-80Zm160-80v-80h400v80H440Zm160-160v-240h80v80h160v80H680v80h-80Zm-480-80v-80h400v80H120Z"/>
                                    </svg>
                                </div>
                            </div>
                            {showFilter && <div className={`absolute z-20 left-[50%]  top-44 w-[43%]
                             bg-gray-200 p-4 text-sm text-gray-700 rounded-lg shadow-md  text-left
                             transform -translate-x-1/2 transition-all duration-700 ease-in-out overflow-hidden
                             before:top-0 before:left-1/2 before:-translate-x-1/2 before:-translate-y-full
                             before:border-8 before:border-transparent before:border-b-gray-200 before:absolute`}>
                                <form onSubmit={handleSubmitMapFilter} >
                                    <p className="mb-2 text-xs md:text-sm">{contents.offers[17].text}</p>
                                    {/*{Select the location you are looking for}*/}
                                    <input type="text"
                                           name="destination"
                                           size={36}
                                           value={formMapFilter.destination}
                                           onChange={handleChangeMapFilter}
                                           placeholder={contents.offers[18].text}
                                           className="w-full mb-2" />
                                    <p className="mb-2 text-xs md:text-sm" style={{borderTop:"1px solid darkgray"}}>{contents.offers[19].text}</p>
                                    {/*{Select search range}*/}
                                    <input type="range"
                                           name="rangeValue"
                                           min="0"
                                           max="40"
                                           value={formMapFilter.rangeValue}
                                        //onChange={(e) => setRangeValue(Number(e.target.value))}
                                           onChange={handleChangeMapFilter}
                                           className="w-full"/>
                                    <div className="text-left text-gray-700 font-medium mb-2">
                                        <p className="text-xs md:text-sm">
                                            {contents.offers[20].text}{formMapFilter.rangeValue}km
                                        </p>
                                    </div>
                                    <p style={{borderTop:"1px solid darkgray"}} className="text-xs md:text-sm">{contents.offers[4].text}</p>
                                    {/*{Please select a type of property}*/}
                                    <input type="radio" id="rent" name="listingType" value="rent"  onChange={handleChangeMapFilter}
                                           checked={formMapFilter.listingType === "rent"} />
                                    <label htmlFor="rent" className="ml-2 text-xs md:text-sm">{contents.offers[5].text}</label><br></br>
                                    {/*{For rent}*/}
                                    <input type="radio" id="sale" name="listingType" value="sale"  onChange={handleChangeMapFilter}
                                           checked={formMapFilter.listingType === "sale"} className={"mb-2"} />
                                    <label htmlFor="sale" className="ml-2 text-xs md:text-sm">{contents.offers[6].text}</label><br></br>
                                    {/*{For sale}*/}
                                    <p style={{borderTop:"1px solid darkgray"}} className="text-xs md:text-sm">{contents.offers[7].text}</p>
                                    {/*{Please select a features of real estate}*/}
                                    <input type="radio" id="flat" name="propertyType" value="flat"  onChange={handleChangeMapFilter}
                                           checked={formMapFilter.propertyType === "flat"} />
                                    <label htmlFor="flat" className="ml-2 text-xs md:text-sm">{contents.offers[8].text}</label><br></br>
                                    {/*{Apartment}*/}
                                    <input type="radio" id="private" name="propertyType" value="private house"  onChange={handleChangeMapFilter}
                                           checked={formMapFilter.propertyType === "private house"} />
                                    <label htmlFor="private" className="ml-2 text-xs md:text-sm">{contents.offers[9].text}</label><br></br>
                                    {/*{Private house}*/}
                                    <input type="radio" id="commercial" name="propertyType" value="commercial real estate"  onChange={handleChangeMapFilter}
                                           checked={formMapFilter.propertyType === "commercial real estate"} />
                                    <label htmlFor="commercial" className="ml-2 text-xs md:text-sm">{contents.offers[10].text}</label><br/>
                                    {/*{Commercial real estate}*/}
                                    <button type="submit" className="mt-8 bg-blue-500 text-white px-2 md:px-4 rounded-md mr-2 md:mr-4">
                                        <p className="text-xs md:text-sm">
                                            {contents.offers[15].text} {/*{Search}*/}
                                        </p>
                                    </button>
                                    <button
                                        type="button" onClick={handleResetMapFilter}
                                        className="bg-yellow-300 px-2 md:px-4 hover:bg-yellow-400 text-grey-500">
                                        <p className="text-xs md:text-sm">
                                            {contents.offers[16].text} {/*{Reset Filter}*/}
                                        </p>
                                    </button>
                                </form>
                            </div>}

                            {!openFilter && <div className="absolute w-[86%] mt-[-21px]"
                                             style={!activeRotate ? {transform: "rotateX(-74deg) translateY(-1740px) translateX(0px)",
                                                 transitionDuration:"700ms", scale:"0.496", zIndex:"0" } :
                                                 {transitionDuration:"700ms", marginTop:"-376px", width:"90%", zIndex:"21"}}
                                             onClick={() => setActiveRotate(true)}
                            ><div className="relative w-full duration-300 ease-in-out hover:scale-100">
                                {activeRotate && <button  onClick={(e)=>{e.stopPropagation(); setActiveRotate(false)}}
                                                          className="absolute top-3 z-[21] py-1 rounded-[4px] bg-red-100 text-gray-700">
                                    {contents.offers[31].text}
                                    {/*{Collapse map}*/}
                                </button>}
                                <div className="w-full ">
                                    <LeafletMaps listings={listings} formMapFilter={filterMapState} isVisible={activeRotate} />
                                </div>
                            </div>
                            </div>}

                            <div className="h-[82px] w-[40px] border-white border-1 rounded-tr-lg rounded-br-lg flex"
                                 //className="absolute z-1 right-[19%]  top-[428px] center"
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
                            {openInfo && <div className={`absolute z-20 top-44 w-[43%] left-[50%] text-xs sm:text-sm
                             bg-gray-200 p-2 sm:p-4 text-sm text-gray-700 rounded-lg shadow-md  text-left
                             transform -translate-x-1/2 transition-all duration-700 ease-in-out overflow-hidden
                             before:top-0 before:left-1/2 before:-translate-x-1/2 before:-translate-y-full
                             before:border-8 before:border-transparent before:border-b-gray-200 before:absolute`} id={`info`}>
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

                            </div>}

                        </div>

                    </div>


                    <div id="rightSideScreen" className="lg:w-1/2 flex justify-center flex-col">
                        {/*{container}*/}
                        <div className="container mx-auto text-center py-10">
                            {(isRegistration && isAuthenticated) ? <h2 className="text-4xl font-bold mb-4 text-yellow-300">{contents.offers[32].text}</h2> :
                                <h2 className="text-4xl font-bold mb-4">{isRegistration ? contents.offers[33].text : contents.offers[40].text}</h2>}
                            {/*{To place your Advertisement, : Register to Post an Advertisement}*/}
                            {(isRegistration && isAuthenticated) ? <p className="text-lg mb-6 text-yellow-300">{contents.offers[34].text}</p> :
                                <p className="text-lg mb-6">{contents.offers[35].text}</p>}
                            {/*{fill out the form with your property details. : Your offer will reach the right audience right away.}*/}
                            {authChecking ? <div className="flex justify-center space-x-6 opacity-0 pointer-events-none">
                                {/* скелетон на время проверки сессии — избегаем мигания кнопок */}
                                <button className="w-28 h-10 bg-gray-600 rounded animate-pulse" />
                                <button className="w-28 h-10 bg-gray-600 rounded animate-pulse" />
                            </div> : (isRegistration && isAuthenticated) ? <div className="flex justify-center space-x-6">
                                <Link to="listings/new/rent" className="text-gray-700">
                                    <button>
                                        {contents.offers[5].text} {/*{For rent}*/}
                                    </button>
                                </Link>
                                <Link to="listings/new/sale" className="text-gray-700">
                                    <button>
                                        {contents.offers[6].text} {/*{For sale}*/}
                                    </button>
                                </Link>
                            </div> : <div className="flex justify-center space-x-6">
                                {!isRegistration && <Link to="registration">
                                    <button>{contents.offers[36].text}</button>
                                    {/*{Sign Up}*/}
                                </Link>}
                                <Link to="login">
                                    <button>{contents.offers[37].text}</button>
                                    {/*{Log In}*/}
                                </Link>
                            </div>}
                            {/*<p style={failed ? {color:"red"} : {color:"green"}} >{message}</p>*/}
                            {/*{message && <p>{message}:{userName}:{userId}</p>}*/}
                            {/*{errorMessage && <p>{errorMessage}</p> }*/}
                        </div>

                        <section id={`advertisement`} className="mx-auto mt-12 mb-4 w-[78%]">
                            {/*<h2>{contents.offers[39].text}</h2>*/}
                            <div className="overflow-hidden py-2">
                                <div className="flex whitespace-nowrap animate-marquee">
                                    {[...Array(repeatCount)].map((_, i) => (
                                        <p key={i} className="mx-4 text-lg font-bold text-white">
                                            {/*{runningString}*/}{featuredAd.adsString}{errorNotification}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            <video
                                //width="600"
                                //height="400"
                                controls
                                autoPlay
                                muted
                                loop
                                src={featuredAd.videoUrl[0]}
                                //src={'https://res.cloudinary.com/dndnmla09/video/upload/v1750064751/wv1ypupvrx0osetzjmox.mp4'}
                            />

                        </section>

                    </div>
                </div>

                <div className="w-full lg:h-full h-[194%] bg-opacity-50 " style={{backgroundColor:"rgba(0, 0, 0, 0.87)"}}>
                    <img src={houseImage} alt="Modern Housing" className="absolute inset-0 w-full h-full object-cover opacity-100 z-[-1]" />
                </div>

            </section>

            {/*<b>{formMapFilter.destination}{formMapFilter.propertyType}{formMapFilter.rangeValue}{formMapFilter.listingType}</b><br/>*/}
            {/*<b>{filterMapState.destination}{filterMapState.propertyType}{filterMapState.rangeValue}{filterMapState.listingType}</b>*/}

            {/*{DELETE before deploy !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!}*/}
            <div className="container mx-auto text-center py-10">
                <button onClick={() => handleResetUserData(setListings)}>
                    **** 🔄 Reset auth ****
                </button>
            </div>
            {/*{DELETE before deploy !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!}*/}


            {/* Popular Listings Section */}
            <section id="listings" className="py-10 px-4 xl:px-8" >
                <div className="mx-auto">
                    <h3 className="text-4xl font-bold mb-6" style={{textShadow:"2px 1px 2px rgba(0,0,0,0.6)"}}>{contents.offers[38].text}</h3>
                    {/*{Popular Listings}*/}

                    {loading ? <LoadingSkeleton /> : <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                        {((filterState.novelty === "newToOld") ? [...filteredListings].reverse() : filteredListings).map((listing: any) => (
                            <li key={listing._id} className="text-left  border-gray-400 border-2 p-2 rounded-md shadow-xl flex flex-col justify-between">
                                <div>
                                    <p className="text-gray-600 font-bold">&#x25FC; {contents.cards[0].text} {listing.apartmentDetails}</p>
                                    {/*{Property : }*/}
                                    <p className="text-gray-600">&#x25FC; {contents.cards[1].text} {listing.description}.</p>
                                    {/*{Description of property : }*/}
                                    {(listing.listingType === "rent") ? <p className="text-gray-600">&#x25FC; {contents.cards[2].text} ${listing.price}.</p> :
                                        <p className="text-gray-600">&#x25FC; {contents.cards[3].text} ${listing.price}.</p>}
                                    {/*{ Monthly rental property : Selling price : }*/}
                                    <p className="text-gray-600">&#x25FC; {contents.cards[4].text} {listing.contact}.</p>
                                    {/*{Owner's contact data : }*/}
                                    <Link to={`leafletMaps`}>
                                        <p className="text-gray-600">&#x25FC; {contents.cards[5].text} {listing?.location}.</p>
                                        {/*{Location : }*/}
                                    </Link>
                                    <p className="text-gray-600">&#x25FC; {contents.cards[6].text} {listing.propertyType}.</p>
                                    {/*{Property type : }*/}
                                    <p className="text-gray-600">&#x25FC; {contents.cards[7].text} { new Date(+listing.date).toLocaleString()}.</p>
                                    {/*{Time of download : }*/}
                                </div>

                                <Link to={`/details/${listing._id}`} className="flex relative " state={{ fromHomeScroll: scrollY }}>
                                    <div style={{position: "absolute",zIndex:"10",left:"30px", top:"40px",opacity:"0.6",transform: "rotateZ(-45deg)"}}>
                                        {listing.listingType === 'sale' ? <p style={{fontSize:"40px",color:"green"}}>{contents.cards[8].text}</p> :
                                            <p style={{fontSize:"40px",color:"green"}}>{contents.cards[9].text}</p>}
                                    </div>
                                    <div onClick={handleSaveScrollPosition} className="w-full h-[300px] bg-white overflow-hidden relative">
                                        <img src={listing.image.find(item => item !== null) || null} alt={`Property`}
                                             //className="w-full h-full object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                             className="w-full h-full object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-in-out hover:scale-110"
                                        />
                                    </div>
                                </Link>
                            </li>
                        ))}

                    </ul>}
                </div>
            </section>
            <Footer color={'#205e7e'}/>
        </div>
    );
};
//export default Home;
export {Home};