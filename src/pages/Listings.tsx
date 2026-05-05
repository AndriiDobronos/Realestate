import React, { useEffect, useRef, useState } from 'react';
import axios from "axios";
import { useParams, Link } from 'react-router-dom';
import { addListingWithComparison} from '../services/listingService';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../app/store';
import ImageUpLoader from "../components/ImageUpLoader";
import {addImage, removeImage, clearImages} from "../features/upLoadImages/upLoadImagesSlice";
import {setImages} from "../features/upLoadImages/upLoadImagesSlice";
import { increment } from '../features/counter/counterSlice';
import L from "leaflet";
import "leaflet-control-geocoder";
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import {useLanguage} from "../context/LanguageContext";

const Listings = () => {
    const { language } = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts
    const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
    const [uploadedImages, setUploadedImages] = useState<(string | null)[]>(Array(6).fill(null));
    const ownerName = useSelector((state: RootState) => state.registration.userName);
    const ownerId = useSelector((state: RootState) => state.registration.userId);
    const dispatch = useDispatch();
    const [message, setMessage] = useState<string | null>(null);
    const [nextColumn, setNextColumn] = useState<boolean>(false);
    const [apartmentDetails, setApartmentDetails] = useState('');
    const [description, setDescription] = useState( '');
    const [contact, setContact] = useState('');
    const [location, setLocation] = useState('');
    const [prompt, setPrompt] = useState(["",""]);
    const [price, setPrice] =  useState('');
    const [show, setShow] = useState<boolean>(false);
    const [showMap, setShowMap] = useState<boolean>(false);
    const [isFirstPageComplete, setIsFirstPageComplete] = useState<boolean>(false);
    const [isSecondPageComplete, setIsSecondPageComplete] = useState<boolean>(false);
    const [showReminder, setShowReminder] = useState<boolean>(false);
    const [currentNumberPage, setCurrentNumberPage] = useState<number>(1)
    const [activeHint, setActiveHint] = useState<string | null>(null)
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef       = useRef<L.Map | null>(null);
    const markerRef    = useRef<L.Marker | null>(null);
    const [mapReady, setMapReady] = useState(false);
    // Stores edit-mode coords so the map can pan after it initializes
    const [editInitView, setEditInitView] = useState<{ lat: number; lon: number } | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [next, setNext] = useState(false);
    const [coordinates, setCoordinates] = useState({ lat: 0, lon: 0 });
    const userString = localStorage.getItem('user');
    if (userString) {
        const user = JSON.parse(userString);
        const email = user.email;
        console.log('Email:', email);
    } else {
        console.log('No user in localStorage');
    }
    const handlers = [
        (e) => handleInputApartmentDetails(e.target.value),
        (e) => handleInputDescription(e.target.value),
        (e) => handleInputContact(e.target.value),
        (e) => handleInputPrice(e.target.value),
        (e) => setSearchQuery(e.target.value),
    ];

    const [formData, setFormData] = useState({propertyType: '', typeOfNovelty: '', numbersOfRooms: '',
        totalArea:'', numberOfFloor:'', numberOfStoreysOfBuilding:'', lat:'', lon:''});
    const {listingId, listingType} = useParams<{listingId?: string; listingType?: string;}>();

// Определяем режим работы
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
                    setFormData({propertyType: data[0].propertyType ?? '', typeOfNovelty: data[0].typeOfNovelty ?? '',
                        numbersOfRooms: String(data[0].numbersOfRooms ?? ''), totalArea: String(data[0].totalArea ?? ''),
                        numberOfFloor: String(data[0].numberOfFloor ?? ''), numberOfStoreysOfBuilding: String(data[0].numberOfStoreysOfBuilding ?? ''),
                        lat: String(data[0].lat ?? ''), lon: String(data[0].lon ?? ''),
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
    }, [isEditMode, listingId]);

    const handleImageUpload = (index: number, url: string) => {
        // Обновляем локальное состояние
        setUploadedImages(prev => {
            const newImages = [...prev];
            newImages[index] = url;
            return newImages;
        });
        // Сохраняем в LocalStorage
        localStorage.setItem('userImages', JSON.stringify(uploadedImages));  //newImages
        dispatch(addImage({ index, url }));
    };

    // При добавлении/удалении изображений
    const handleImageChange = (newImages: string[]) => {
        dispatch(setImages(newImages));
        localStorage.setItem('userImages', JSON.stringify(newImages));
    }

    // Функция для удаления одного изображения
    const handleImageDeleteUploading = async (index: number) => {
        const urlToDelete = uploadedImages[index];
        if (!urlToDelete) return;
        if (message === "Success: Listing added successfully.") return;

        try {
            // Удаляем из Cloudinary
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

            // Обновляем состояние ???????????????????????????????????
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

    const handleDeleteCommentsByListingId = async (listingId:string) => {
        try {
            const response = await fetch(
                `${API_URL}/api/comments/listingId/${listingId}`,
                {
                    method: 'DELETE',
                    credentials: 'include'
                }
            );
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Delete comments failed: ${errorText}`);
            }
            const successResponse = await response.json()
            setMessage(`${successResponse.message} ${successResponse.deletedCount}`)

        } catch (error) {
            console.error('Deletion error:', error);
            throw error;
        }
    };

    const handleDeleteListingById = async () => {
        try {
            const response = await fetch(
                `${API_URL}/api/listing/${listingId}`,
                {
                    method: 'DELETE',
                    credentials: 'include'
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Delete listings failed: ${errorText}`);
            }

            const successResponse = await response.json()
            setMessage(`${successResponse.message} ${successResponse.deletedCount}`)

            //setListings(prev => prev.filter((l: any) => l.id !== listingId));
        } catch (error) {
            console.error('Deletion error:', error);
            throw error;
        }
    };

    const handleCleanFormOrDeleteListing = async () => {
        try {
            // Удаляем все изображения из Cloudinary
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

            //В режиме редактирования отправляем запрос на удаление из MongoDB
            if(isEditMode) {
                handleDeleteCommentsByListingId(listingId)
                handleDeleteListingById()
            }

            // Сбрасываем все состояния
            setApartmentDetails("");
            setDescription("");
            setContact("");
            setLocation("");
            setSearchQuery("")
            setPrice("");
            setFormData({propertyType: '', typeOfNovelty:'', numbersOfRooms: '', totalArea:'',
                numberOfFloor:'', numberOfStoreysOfBuilding:'', lat:'', lon:'',
            });
            dispatch(clearImages());
            setMessage(null);
            setShow(false);
            setNext(false);
            // Принудительное обновление компонентов ImageUploader
            setUploadedImages(Array(6).fill(null)); // Добавляем null для каждого слота

        } catch (error) {
            console.error('Error cleaning form:', error);
        }
    };

    useEffect(() => {
        const isFirstPageCompleted = formData.typeOfNovelty !== '' && formData.numbersOfRooms !== '' && formData.totalArea !== '' && formData.numberOfFloor !== '' && formData.numberOfStoreysOfBuilding !== '';
        setIsFirstPageComplete(!!isFirstPageCompleted)
    },[formData.typeOfNovelty, formData.numbersOfRooms, formData.totalArea, formData.numberOfFloor, formData.numberOfStoreysOfBuilding]);


    const handleAddOrSaveListing = async () => {
        try {
            // Общие данные для обоих режимов
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
                //date: Date.now().toString()
            };

            if (isEditMode && listingId) {
                // Режим редактирования - PUT запрос
                const updatedData = {
                    ...commonData,
                    listingType: `${listingType}` // Сохраняем исходный тип объявления
                };

                await axios.put(`${API_URL}/api/listings/${listingId}`, updatedData,{
                    withCredentials: true, // Передаем куки
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                setMessage("Success: Listing updated successfully!");

                // Опционально: перенаправление после успешного обновления
                // navigate('/myListings');

            } else if (listingType) {
                // Режим создания нового - POST запрос
                const newListing = {
                    ...commonData,
                    listingType: `${listingType}`
                };

                //await addListing(newListing);
                await addListingWithComparison(newListing); //*****************************************


                setMessage("Success: Listing added successfully.");
                setShow(false);
                dispatch(increment()); // Why ?????????????

                // Clearing the form after successful creation
                localStorage.removeItem('userImages');
                setUploadedImages(Array(6).fill(null));
            }

        } catch (error: any) {
            const errorMessage = isEditMode
                ? "Failed to update listing:"
                : "Failed to add listing:";

            setMessage(`${errorMessage} ${error.response?.data?.message || error.message}`);
        }
    };

    useEffect(() => {
        const saved = localStorage.getItem('userImages');
        if (saved) dispatch(setImages(JSON.parse(saved)));
    }, []);

    const handleInputApartmentDetails = (value: string) => {
        setApartmentDetails(value)
    };

    const handleInputDescription = (value: string) => {
        setDescription(value)
    };

    const handleInputContact = (value: string) => {
        setContact(value)
    };

    const handleInputPrice = (value: string) => {
        setPrice(value)
    };

    const handleNext = () => {
        const canProceed = isEditMode
            ? true
            : (currentNumberPage === 1 && isFirstPageComplete) ||
            (currentNumberPage === 2 && isSecondPageComplete);
        if (canProceed) {
            setNext(true);
            setCurrentNumberPage(prev => prev + 1);
            setShowReminder(false);
        } else {
            setShowReminder(true);
        }
    };

    const handlePrevious = () => {
        setNextColumn(false);
        setCurrentNumberPage((prevState)=> prevState - 1);
        setShowReminder(false);
    }

    useEffect(() => {
        const isSecondPageCompleted = apartmentDetails && description && contact && location && price
        setIsSecondPageComplete(!!isSecondPageCompleted);
    }, [apartmentDetails, description, contact, location, price]);

    // useEffect(() => {
    //     const allFieldsFilled = apartmentDetails && description && contact && location && price &&
    //         uploadedImages.filter(Boolean).length >= 2; // Минимум 2 изображения
    //     setShow(!!allFieldsFilled);
    // }, [apartmentDetails, description, contact, location, price, uploadedImages]);

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

    // Recalculate layout when the map panel slides into view
    useEffect(() => {
        if (!showMap || !mapRef.current) return;
        const t = setTimeout(() => mapRef.current?.invalidateSize(), 50);
        return () => clearTimeout(t);
    }, [showMap]);

    // Center map on listing location once map is ready (edit mode)
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

                // Remove previous validation marker before adding a new one
                if (markerRef.current) map.removeLayer(markerRef.current);
                markerRef.current = L.marker([lat, lon]).addTo(map).bindPopup(searchQuery).openPopup();

                map.setView([lat, lon], 13);
                setLocation(searchQuery);
                setCoordinates({ lat, lon });
                setShowMap(true);
                setPrompt([`${contents.listings[35].text}`, `text-green-700`]);

                // Persist to coordsCache so LeafletMaps on Home reuses these coords
                try {
                    const cache = JSON.parse(localStorage.getItem("coordsCache") || "{}");
                    cache[searchQuery] = { lat, lon };
                    localStorage.setItem("coordsCache", JSON.stringify(cache));
                } catch { /* non-critical */ }
            } else {
                setPrompt([`${contents.listings[36].text}`, `text-red-700`]);
            }
        } catch {
            setPrompt([`${contents.listings[36].text}`, `text-red-700`]);
        }
    };

    const handleInputProperty = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        const allFieldsFilled = apartmentDetails &&
            description &&
            contact &&
            location &&
            price &&
            uploadedImages.filter(Boolean).length >= 2;

        // Разрешаем сохранение даже если данные не менялись
        if (isEditMode) {
            setShow(true);
        } else {
            setShow(!!allFieldsFilled);
        }
    }, [apartmentDetails, description, contact, location, price, uploadedImages, isEditMode]);

    return (
        <div style={styles.container}>
            <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md" style={styles.glassCard}>
                <div className="titleContainer w-full">
                    {isEditMode ? <h1 className="text-gray-800 font-bold text-xl sm:text-3xl">{contents.listings[0].text}{contents.listings[1].text}{ownerName}{contents.listings[2].text}
                    </h1> : <h1 className="text-gray-800 font-bold text-xl sm:text-3xl">
                            {contents.listings[1].text}{ownerName}{contents.listings[3].text}{param === 'sale' ? contents.listings[4].text : contents.listings[5].text}.
                        </h1>}
                    {/*{Listing editing mode:}*/}
                    {/*{ Dear {ownerName}, please edit the information about your property if necessary.}*/}
                    {/*{Dear {ownerName}, please fill out the form with information about your property for {param}.}*/}
                </div>
                <div className="flex flex-col items-center" >
                    <ol className="flex flex-col my-2" >
                        {!nextColumn && currentNumberPage === 1 ? <li className="flex flex-col mb-2">
                            <div className="flex-row text-left mb-3 bg-white rounded-md p-2">
                                <input type="radio" id="flat" name="propertyType" value="flat"
                                       checked={formData.propertyType === "flat"} onChange={handleInputProperty}/>
                                <label htmlFor="flat" className="ml-2">{contents.listings[6].text}</label><br/>
                                {/*{Apartment}*/}
                                <input type="radio" id="private" name="propertyType" value="private house"
                                       checked={formData.propertyType === "private house"} onChange={handleInputProperty}/>
                                <label htmlFor="private" className="ml-2">{contents.listings[7].text}</label><br/>
                                {/*{Private house}*/}
                                <input type="radio" id="commercial" name="propertyType" value="commercial real estate"
                                       checked={formData.propertyType === "commercial real estate"} onChange={handleInputProperty}/>
                                <label htmlFor="commercial" className="ml-2">{contents.listings[8].text}</label>
                                {/*{Commercial real estate}*/}
                            </div>
                            <div className="flex-row text-left mb-2 bg-white rounded-md p-2">
                                <input type="radio" id="newBuilding" name="typeOfNovelty" value="newBuilding"
                                       checked={formData.typeOfNovelty === "newBuilding"} onChange={handleInputProperty}/>
                                <label htmlFor="flat" className="ml-2">{contents.listings[26].text}</label><br/>
                                {/*{New building}*/}
                                <input type="radio" id="secondaryHousing" name="typeOfNovelty" value="secondaryHousing"
                                       checked={formData.typeOfNovelty === "secondaryHousing"} onChange={handleInputProperty}/>
                                <label htmlFor="private" className="ml-2">{contents.listings[27].text}</label><br/>
                                {/*{Secondary housing}*/}
                            </div>

                            <p className="text-left text-gray-500 border-gray-500" style={{borderTop:"1px solid"}}>{contents.listings[28].text}</p>
                                <input type="number" id="numbersOfRooms" name="numbersOfRooms"
                                       onChange={handleInputProperty} value={formData.numbersOfRooms}
                                       className="p-2  rounded-md mb-2" placeholder={contents.listings[28].text} />
                            <p className="text-left text-gray-500 border-gray-500" style={{borderTop:"1px solid"}}>{contents.listings[29].text}</p>
                            <input type="number" id="totalArea" name="totalArea"
                                   onChange={handleInputProperty} value={formData.totalArea}
                                   className="p-2  rounded-md mb-2" placeholder={contents.listings[29].text} />
                            <p className="text-left text-gray-500 border-gray-500" style={{borderTop:"1px solid"}}>{contents.listings[30].text}</p>
                            <input type="number" id="numberOfFloor" name="numberOfFloor"
                                   onChange={handleInputProperty} value={formData.numberOfFloor}
                                   className="p-2  rounded-md mb-2" placeholder={contents.listings[30].text} />
                            <p className="text-left text-gray-500 border-gray-500" style={{borderTop:"1px solid"}}>{contents.listings[31].text}</p>
                            <input type="number" id="numberOfStoreysOfBuilding" name="numberOfStoreysOfBuilding"
                                   onChange={handleInputProperty} value={formData.numberOfStoreysOfBuilding}
                                   className="p-2  rounded-md mb-2" placeholder={contents.listings[31].text} />

                            {/*<input type="text" placeholder={contents.listings[28].text} value={formData.numbersOfRooms}*/}
                            {/*       onChange={handleInputProperty} name="numbersOfRooms"*/}
                            {/*       className="w-full text-left mb-4 bg-white rounded-md p-2"*/}
                            {/*/>*/}
                            {/*<input type="text" placeholder={contents.listings[29].text} value={formData.totalArea}*/}
                            {/*   onChange={handleInputProperty} name="totalArea"*/}
                            {/*   className="w-full text-left mb-4 bg-white rounded-md p-2"*/}
                            {/*/>*/}
                            {/*<input type="text" placeholder={contents.listings[30].text} value={formData.numberOfFloor}*/}
                            {/*   onChange={handleInputProperty} name="numberOfFloor"*/}
                            {/*   className="w-full text-left mb-4 bg-white rounded-md p-2"*/}
                            {/*/>*/}
                            {/*<input type="text" placeholder={contents.listings[31].text} value={formData.numberOfStoreysOfBuilding}*/}
                            {/*   onChange={handleInputProperty} name="numberOfStoreysOfBuilding"*/}
                            {/*   className="w-full text-left mb-4 bg-white rounded-md p-2"*/}
                            {/*/>*/}

                        </li> : currentNumberPage === 2 ? <li className="flex flex-col pt-4">
                            {Object.entries(contents.hints).map(([key, hint],index) => (
                                <li
                                    key={key}
                                    className={`${currentNumberPage !== 2 ? "invisible" : "mb-4 relative flex flex-row"}`}
                                    onMouseEnter={() => setActiveHint(key)}
                                >
                                    <div className="w-full">

                                        {key ==='price' || key==='contact' ?
                                            <input
                                                type={key ==='price' ? "number" : "text"}
                                                placeholder={key === 'contact' ? contents.listings[11].text :
                                                    key === 'price' ? contents.listings[12].text :
                                                        contents.listings[13].text
                                                }
                                                value={index === 2 ? contact :
                                                        index === 3 ? price :
                                                            searchQuery
                                                }
                                                onChange={handlers[index]}
                                                className="w-full border border-r-2 px-2 py-2 bg-white rounded-md"
                                                onMouseLeave={() => setActiveHint(null)}
                                            /> :
                                            <textarea
                                            placeholder={
                                                key === 'apartmentDetails' ? contents.listings[9].text :
                                                    key === 'description' ? contents.listings[10].text :
                                                        key === 'contact' ? contents.listings[11].text :
                                                            key === 'price' ? contents.listings[12].text :
                                                                contents.listings[13].text
                                            }
                                            value={
                                                index === 0 ? apartmentDetails :
                                                    index === 1 ? description :
                                                        index === 2 ? contact :
                                                            index === 3 ? price :
                                                                searchQuery
                                            }
                                            onChange={handlers[index]}
                                            className="w-full border border-r-2 px-2 py-2 bg-white rounded-md"
                                            onMouseLeave={() => setActiveHint(null)}
                                        />}

                                        {activeHint === key && (<div id="hint"
                                                 className="absolute z-10 top-full left-1/2 transform -translate-x-1/2
                                              mt-2 w-full bg-gray-200 p-2 text-sm text-gray-700 rounded shadow-md
                                before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:-translate-y-full
                                before:border-8 before:border-transparent before:border-b-gray-200"
                                            >
                                                {hint}
                                            </div>
                                        )}
                                    </div>

                                </li>
                            ))}
                        </li> : <li className={`mb-4`}>
                            <h2 className="mb-4 text-2xl text-green-500">{contents.listings[17].text}</h2>
                            {/*{Fill the slots with 2 to 6 photos of your property}*/}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {[...Array(6)].map((_, index) => (
                                    <ImageUpLoader
                                        key={index}
                                        index={index}
                                        onUploadComplete={handleImageUpload}
                                        onDelete={handleImageDeleteUploading}
                                        initialUrl={uploadedImages[index]}
                                    />
                                ))}
                            </div>
                        </li>}

                        {(currentNumberPage === 2) && <button className="bg-blue-500 text-white mb-4" onClick={handleSearch}>
                            {contents.listings[14].text}
                            {/*{Check address existence}*/}
                        </button>}

                        <div className="gap-4 flex justify-center">
                            <button aria-label="Повернутися до попереднього кроку" title="Назад"
                                className={`bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 ${currentNumberPage === 1 ? "invisible" : ""}`}
                                onClick={handlePrevious}>
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M15 18l-6-6 6-6"/>
                                </svg>
                                <span>{contents.listings[33].text}{/*{Go back to previous step}*/}</span>
                            </button>
                            {currentNumberPage !== 3 && <button className={`text-white flex items-center gap-2
                             ${(isFirstPageComplete && currentNumberPage === 1) || (isSecondPageComplete && currentNumberPage === 2) ?
                                "bg-green-500" : "bg-gray-400"}`}
                                    onClick={handleNext} aria-label="Далі" title="Next">
                                <span>{contents.listings[16].text} {currentNumberPage}</span>
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M9 6 l6 6-6 6"/>
                                </svg>
                            </button>}
                        </div>

                        {currentNumberPage !== 3 && <div className={`bg-gray-300 rounded-md mt-2 px-2 py-0`}>
                            <p className={`text-left ${prompt[1]}`}>
                                {`${currentNumberPage === 2 ? prompt[0] : ""}`}
                            </p>
                            <p className={`text-red-600 text-left 
                                ${(isFirstPageComplete && currentNumberPage === 1) || (isSecondPageComplete && currentNumberPage === 2) ?
                                "invisible" : ""}`}>
                                {`${showReminder ? contents.listings[34].text : ""}`}
                            </p>
                        </div>}
                    </ol>

                    <div ref={containerRef} style={(showMap && currentNumberPage === 2) ?
                        {opacity:"1", zIndex:"10",position:"absolute", height: "406px", width: "60%", border: "2px solid black",left:"20%",top:"116px",borderRadius:"10px" } :
                        {opacity:"0", zIndex:"-1",position:"absolute", height: "406px", width: "60%", border: "2px solid black",left:"20%",top:"116px"}
                    }></div>
                    {showMap && <button className={`absolute top-32 left-[46%] z-20 bg-yellow-200`} onClick={()=>setShowMap(false)}>
                        {contents.listings[37].text}
                    </button>}


                </div>
                {currentNumberPage === 3 && <div style={{marginTop: "2px"}} >
                    {/*{"Save Changes" : "Add Listing"}*/}
                    {(show && !message) ? (<button onClick={handleAddOrSaveListing}
                                                   className={isEditMode ? "ml-8 mr-6 text-white bg-yellow-600" : "ml-8 mr-6"}
                    >{isEditMode ? contents.listings[18].text : contents.listings[19].text}</button>) :
                        <button style={isEditMode ? {opacity:"1",marginLeft:"150px"} : {opacity:"0",marginLeft:"150px"}} className="mr-8"><Link to="/myListings">{contents.listings[20].text}</Link></button>}
                    {/*{Back to my Listings}*/}
                    {(show && !message) && <button onClick={handleCleanFormOrDeleteListing}
                                                   className={isEditMode ? "bg-red-500 text-white" : "initial"}
                    >{isEditMode ? contents.listings[21].text : contents.listings[22].text}</button>}
                    {/*{"Delete Listing" : "Clean Form"}*/}
                    {(message?.startsWith('Success')) && <button>
                        <Link to="/"  state={{ scrollToNewListing: 700 }}>{contents.listings[23].text}</Link>
                        {/*{Go to published listings}*/}
                    </button>}
                    {message && <p className={`mt-4 text-xs ${message.startsWith('Success') ? 'text-green-500' : 'text-red-500'}`}>{message}</p>}
                </div>}

            </div>

        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        position: "relative",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundImage: 'url(https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingBottom:'16px',
        paddingTop:'64px',
    },
    glassCard: {
        padding: '12px 32px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        maxWidth: '1000px',
        textAlign: 'center',
    },
};
export default Listings;