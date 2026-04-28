import React, {useEffect, useState} from "react";
import { useLanguage } from '../context/LanguageContext';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import {setNotificationProperty} from "../features/notification/notificationSlice";
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import {RootState} from "../app/store";
import L from "leaflet";
import "leaflet-control-geocoder";
//import LiqPayButton from "../components/LiqPayButton"

const Notification  = () => {
    const {language} = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts
    //const notification = useSelector((state: RootState) => state.notification);
    const userId = useSelector((state: RootState) => state.registration.userId);
    const dispatch = useDispatch();
    const [show, setShow] = useState(false);
    const [map, setMap] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [coordinates, setCoordinates] = useState({ lat: 0, lon: 0 });
    const [saveMessage, setSaveMessage] = useState('');
    const display = !!saveMessage;
    const [width, setWidth] = useState(getWidth());
    const [errorMessage, setErrorMessage] = useState('');
    const userString = localStorage.getItem('user');

    const [formData, setFormData] = useState({
        listingType:'',
        propertyType: '',
        typeOfNovelty:'',
        minNumbersOfRoom:'',
        maxNumbersOfRoom:'',
        minTotalArea:'',
        maxTotalArea:'',
        minFloor:'',
        maxFloor:'',
        minPrice:'',
        maxPrice:'',
        locationSought:'',
        locationRange:10,
        email: userString ? JSON.parse(userString).email : ``,
        userId:`${userId}`,
        lat: 0,
        lon: 0,
    });
    const {notificationId} = useParams<{notificationId?: string;}>();
    const isEditMode = !!notificationId;
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    useEffect(() => {
        setFormData({...formData, userId:`${userId}`, lat: Number(`${coordinates.lat}`), lon: Number(`${coordinates.lon}`) })
    }, [coordinates]);

    useEffect(() => {
        if (userString) {
            const user = JSON.parse(userString);
            const email = user.email;
            console.log('Email:', email);
        } else {
            console.log('No user in localStorage');
        }
    },[]);

    function getWidth() {
        const w = window.innerWidth;
        if (w < 568) return '360px'  //'100%';
        if (w < 900) return '420px'   //'70%';
        return '420px' //'50%';
    }

    useEffect(() => {
        const handleResize = () => setWidth(getWidth());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchNotificationData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/notification/${notificationId}`);
            const data = await response.json();
            setPrompt(`Data:${data.listingType}`);
            setSaveMessage('');
            setFormData({
                ...formData,
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
                email: userString ? JSON.parse(userString).email : ``,
                userId:`${userId}`,
            });
        }catch (error) {
            console.error('Error fetching notification:', error);
        }
    };

    useEffect(() => {
        if (isEditMode) {
            fetchNotificationData();
        }
    },[isEditMode, notificationId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(setNotificationProperty(formData));

         try {
             let response
             if (isEditMode && notificationId) {
                 response = await fetch(`${API_URL}/api/notification/${notificationId}`, {
                     method: 'PUT',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify(formData),
                     credentials: 'include',
                 });
             } else {
                 response = await fetch(`${API_URL}/api/notification`, {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify(formData),
                     credentials: 'include',
                 });
             }

             if (response.ok) {
                 const data = await response.json();
                 setSaveMessage(`Message:${data.message}`)
                 setFormData({
                     ...formData,
                     listingType:'',
                     propertyType: '',
                     typeOfNovelty:'',
                     minNumbersOfRoom:'',
                     maxNumbersOfRoom:'',
                     minTotalArea:'',
                     maxTotalArea:'',
                     minFloor:'',
                     maxFloor:'',
                     minPrice:'',
                     maxPrice:'',
                     locationSought:'',
                     locationRange:10,
                     email: userString ? JSON.parse(userString).email : ``,
                     userId:`${userId}`,
                 });
                 setCoordinates({lat:0, lon:0})
                 setShow(false);
                 setErrorMessage('');
             } else {
                 setErrorMessage('Failed to save.');
             }
         } catch (error) {
             setErrorMessage(`An error: ${error} occurred. Please try again later.`);
         }
    };

    const handleInputFormData = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    useEffect(() => {
        const newMap = L.map('map').setView([50.006, 36.23], 11);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(newMap);

        setMap(newMap);
        return () => newMap.remove();
    }, []);

    const handleCheck = async () => {
        if (!formData.locationSought) return;

        setShow(true);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${formData.locationSought}`);
        const results = await response.json();

        if (results.length > 0 && map) {
            const { lat, lon } = results[0];
            map.setView([lat, lon], 13);
            L.marker([lat, lon]).addTo(map).bindPopup(formData.locationSought).openPopup();
            //setLocation(formData.locationSought);
            setPrompt("");
            setCoordinates({ lat, lon });
            setFormData({
                ...formData,
                lat: Number(`${coordinates.lat}`),
                lon: Number(`${coordinates.lon}`),
            })
        } else {
            setPrompt("Enter address correctly!");
        }
    };

    return(
        <div className="px-4 sm:px-6">
            <div className="h-16 w-full" ></div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl text-gray-600 font-bold mt-5 text-center" style={{textShadow:"2px 1px 2px rgba(0,0,0,0.6)"}}>
                {contents.notification[0].text}
            </h1>
            {/*{Fill out the form with the required property parameters.}*/}
            <div className="w-full max-w-md mt-8 mx-auto bg-red-100 p-4 sm:p-4 rounded-lg flex flex-col text-sm md:text-base">
                <p>{contents.notification[14].text}</p>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-md mt-8 mx-auto bg-gray-100 p-4 sm:p-5 rounded-lg flex flex-col text-sm md:text-base">
                <div className="flex-row text-left mb-4 bg-white rounded-lg p-2">
                    <input type="radio" id="rent" name="listingType" value="rent"
                           checked={formData.listingType === "rent"} onChange={handleInputFormData}/>
                    <label htmlFor="rent" className="ml-2">{contents.listings[24].text}</label><br/>
                    <input type="radio" id="sale" name="listingType" value="sale"
                           checked={formData.listingType === "sale"} onChange={handleInputFormData}/>
                    <label htmlFor="sale" className="ml-2">{contents.listings[25].text}</label><br/>
                </div>
                <div className="flex-row text-left mb-4 bg-white rounded-lg p-2">
                    <input type="radio" id="flat" name="propertyType" value="flat"
                           checked={formData.propertyType === "flat"} onChange={handleInputFormData}/>
                    <label htmlFor="flat" className="ml-2">{contents.listings[6].text}</label><br/>
                    {/*{Apartment}*/}
                    <input type="radio" id="private" name="propertyType" value="private house"
                           checked={formData.propertyType === "private house"} onChange={handleInputFormData}/>
                    <label htmlFor="private" className="ml-2">{contents.listings[7].text}</label><br/>
                    {/*{Private house}*/}
                    <input type="radio" id="commercial" name="propertyType" value="commercial real estate"
                           checked={formData.propertyType === "commercial real estate"} onChange={handleInputFormData}/>
                    <label htmlFor="commercial" className="ml-2">{contents.listings[8].text}</label>
                    {/*{Commercial real estate}*/}
                </div>

                <div className="">
                    <div className="flex-row text-left mb-4 bg-white rounded-lg p-2">
                        <input type="radio" id="typeOfNovelty" name="typeOfNovelty" value="newBuilding"
                               checked={formData.typeOfNovelty === "newBuilding"} onChange={handleInputFormData}/>
                        <label htmlFor="rent" className="ml-2">{contents.listings[26].text}</label><br/>
                        {/*{New building}*/}
                        <input type="radio" id="secondaryHousing" name="typeOfNovelty" value="secondaryHousing"
                               checked={formData.typeOfNovelty === "secondaryHousing"} onChange={handleInputFormData}/>
                        <label htmlFor="sale" className="ml-2">{contents.listings[27].text}</label><br/>
                        {/*{Secondary housing}*/}
                    </div>

                    <p className="mt-3 border-t border-gray-400 text-left pt-2">{contents.notification[1].text}</p>
                    {/*{Please select the required number of rooms.}*/}
                    <div className="flex flex-row gap-8 mb-3">
                        <label className="mr-[-24px] mt-[7px]" htmlFor="minNumbersOfRoom">{contents.notification[12].text}</label>
                        <input type="number" id="minNumbersOfRoom" name="minNumbersOfRoom"
                               onChange={handleInputFormData} value={formData.minNumbersOfRoom}
                               className="border p-2 w-1/2 sm:w-1/2 rounded-md"
                               placeholder="Minimum"/>
                        <label className="mr-[-24px] mt-[7px]" htmlFor="maxNumbersOfRoom">{contents.notification[13].text}</label>
                        <input type="number" id="maxNumbersOfRoom" name="maxNumbersOfRoom"
                               onChange={handleInputFormData} value={formData.maxNumbersOfRoom}
                               className="border p-2 w-1/2 sm:w-1/2 rounded-md"
                               placeholder="Maximum"/>
                    </div>

                    <p className="mt-3 border-t border-gray-400 text-left pt-2">{contents.notification[2].text}</p>
                    {/*{Please select the required total area.}*/}
                    <div className="flex flex-row gap-8 mb-3">
                        <label className="mr-[-24px] mt-[7px]" htmlFor="minTotalArea">{contents.notification[12].text}</label>
                        <input type="number" id="minTotalArea" name="minTotalArea"
                               onChange={handleInputFormData} value={formData.minTotalArea}
                               className="border p-2 w-1/2 rounded-md" placeholder="Minimum"/>
                        <label className="mr-[-24px] mt-[7px]" htmlFor="maxTotalArea">{contents.notification[13].text}</label>
                        <input type="number" id="maxTotalArea" name="maxTotalArea"
                               onChange={handleInputFormData} value={formData.maxTotalArea}
                               className="border p-2 w-1/2 rounded-md" placeholder="Maximum"/>
                    </div>

                    <p className="mt-3 border-t border-gray-400 text-left pt-2">{contents.notification[3].text}</p>
                    {/*{Please select the required floor.}*/}
                    <div className="flex flex-row gap-8 mb-3">
                        <label className="mr-[-24px] mt-[7px]" htmlFor="minFloor">{contents.notification[12].text}</label>
                        <input type="number" id="minFloor" name="minFloor"
                               onChange={handleInputFormData} value={formData.minFloor}
                               className="border p-2 w-1/2 rounded-md" placeholder="Minimum"/>
                        <label className="mr-[-24px] mt-[7px]" htmlFor="maxFloor">{contents.notification[13].text}</label>
                        <input type="number" id="maxFloor" name="maxFloor"
                               onChange={handleInputFormData} value={formData.maxFloor}
                               className="border p-2 w-1/2 rounded-md" placeholder="Maximum"/>
                    </div>

                    <p className="mt-3 border-t border-gray-400 text-left pt-2">{contents.notification[4].text}</p>
                    {/*{Please select a range of acceptable prices.}*/}
                    <div className="flex flex-row gap-8 mb-3">
                        <label className="mr-[-24px] mt-[7px]" htmlFor="minPrice">{contents.notification[12].text}</label>
                        <input type="number" id="minPrice" name="minPrice"
                               onChange={handleInputFormData} value={formData.minPrice}
                               className="border p-2 w-1/2 rounded-md" placeholder="Minimum"/>
                        <label className="mr-[-24px] mt-[7px]" htmlFor="maxPrice">{contents.notification[13].text}</label>
                        <input type="number" id="maxPrice" name="maxPrice"
                               onChange={handleInputFormData} value={formData.maxPrice}
                               className="border p-2 w-1/2 rounded-md" placeholder="Maximum"/>
                    </div>

                    <p className="mt-3 border-t border-gray-400 text-left pt-2">{contents.notification[5].text}</p>
                    {/*{Enter location and select search radius}*/}
                    <input className="rounded p-1 w-full mb-2"
                           type="text"
                           placeholder="location"
                           value={formData.locationSought}
                           name="locationSought"
                           onChange={handleInputFormData}
                           required
                    />
                    <input type="range"
                           name="locationRange"
                           min="2"
                           max="25"
                           value={formData.locationRange}
                           onChange={handleInputFormData}
                           className="w-full"
                    />
                    <div className="text-left text-gray-700 font-medium mb-2">
                        {contents.notification[6].text}{formData.locationRange}km
                        {/*{}*/}
                    </div>
                    <button onClick={handleCheck}  type="button" className="mr-2 bg-green-500 text-white">
                        {contents.notification[7].text}
                        {/*{Check address}*/}
                    </button>
                    <button type="button" onClick={()=>setShow(false)} className="sm:mr-2 mt-2 sm:mt-0 bg-yellow-500 text-white">
                        {contents.notification[8].text}
                        {/*{Collapse a map}*/}
                    </button>

                    <p className="mt-3 pt-3" style={{borderTop:"1px solid darkgray",textAlign:"left"}}>{contents.notification[9].text }</p>
                    {/*{Leave your email for notifications}*/}
                    <input className="rounded p-1 w-full mb-4 mt-2"
                           type="email"
                           placeholder="email for notification"
                           value={formData.email}
                           name="email"
                           onChange={handleInputFormData}
                           required
                    />
                </div>

                {/*{saveMessage && <p className="text-green-500">{saveMessage}</p>}*/}
                {/*{errorMessage && <p className="text-red-500">{errorMessage}</p>}*/}

                <button type="submit" className="bg-blue-500 text-white">{isEditMode ? contents.notification[11].text : contents.notification[10].text}</button>
                {display && <div className="mt-6 ">
                    <Link className="link text-gray-500 hover:text-gray-700 mr-4" to={"/myNotification"}>My Notifications</Link>
                    <Link className="link text-gray-500 hover:text-gray-700 ml-4" to={"/"}>Back to Home</Link>
                </div>}
            </form>
            <div id="map" style={show ? {opacity:"1",position:"absolute",zIndex:"10", height: "420px", width:"358px", border: "2px solid black",left:"calc(50% - 180px)",top:"336px",borderRadius:"10px" } :
                {height: "420px", width: "358px", border: "none", zIndex:"-1", opacity:"0",position:"absolute",left:"calc(50% - 180px)",top:"336px"}}
            ></div>

            {/*{!isEditMode && <LiqPayButton/>}*/}

        </div>
    )
};
export default Notification;

//: {opacity:"0",position:"absolute",zIndex:"-1", height: "436px", width: "420px", border: "2px solid black",left:"calc(50% - 210px)",top:"336px"}}