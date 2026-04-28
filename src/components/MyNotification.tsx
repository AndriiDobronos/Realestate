import React, {useEffect, useState} from 'react';
import {RootState} from "../app/store";
import { useSelector} from 'react-redux';
import { Link } from 'react-router-dom';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import {useLanguage} from "../context/LanguageContext";
//import {setNotificationProperty} from "../features/notification/notificationSlice";
interface Notification {
    _id: string;
    listingType: string;
    propertyType: string;
    typeOfNovelty: string;
    minNumbersOfRoom: string;
    maxNumbersOfRoom: string;
    minTotalArea: string;
    maxTotalArea: string;
    minFloor: string;
    maxFloor: string;
    minPrice: string;
    maxPrice: string;
    locationSought: string;
    locationRange: number;
    email: string;
    userId:string;
    lat: number;
    lon: number;
    date: number;
}

const MyNotification = () => {
    const {language} = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts
    const userName = useSelector((state: RootState) => state.registration.userName);
    const userId = useSelector((state: RootState) => state.registration.userId);
    const [message,setMessage] = useState('');
    const [overLoad,setOverLoad] = useState(false);
    const [notifications, setNotifications] = useState([{_id:'',typeOfNovelty:'',propertyType:''}]);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    // const [editableNotifications, setEditableNotifications] = useState<{[key: string]: {listingType:string,
    //         propertyType: string,
    //         typeOfNovelty:string,
    //         minNumbersOfRoom:string,
    //         maxNumbersOfRoom:string,
    //         minTotalArea:string,
    //         maxTotalArea:string,
    //         minFloor:string,
    //         maxFloor:string,
    //         minPrice:string,
    //         maxPrice:string,
    //         locationSought:string,
    //         locationRange: number,
    //         email: string,}}>({});

    // const userString = localStorage.getItem('user');
    // if (userString) {
    //     const user = JSON.parse(userString);
    //     const email = user.email;
    //     console.log('Email:', email);
    // } else {
    //     console.log('No user in localStorage');
    // }

    // const [formData, setFormData] = useState({
    //     listingType:'',
    //     propertyType: '',
    //     typeOfNovelty:'',
    //     minNumbersOfRoom:'',
    //     maxNumbersOfRoom:'',
    //     minTotalArea:'',
    //     maxTotalArea:'',
    //     minFloor:'',
    //     maxFloor:'',
    //     minPrice:'',
    //     maxPrice:'',
    //     locationSought:'',
    //     locationRange:10,
    //     email: userString ? JSON.parse(userString).email : ``,
    //     userId:`${userId}`,
    //     lat: 0,
    //     lon: 0,
    // });

    // useEffect(() => {
    //     const initialEditable = notifications.reduce((acc, notification) => ({
    //         ...acc,
    //         [notification._id]: {
    //             typeOfNovelty: notification.typeOfNovelty,
    //             propertyType: notification.propertyType,
    //         }
    //     }), {});
    //     setEditableNotifications(initialEditable);
    // }, [notifications]);

    // const handleInputFormData = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    //     const { name, value } = e.target;
    //     setFormData(prev => ({
    //         ...prev,
    //         [name]: value
    //     }));
    // };

    const handleRequestNotifications = async() => {
        const notificationsResponse = (userName === 'admin') ? await fetch(`${API_URL}/notifications`,{ credentials: 'include' }) :
            await fetch(`${API_URL}/api/notifications/authorId/${userId}`, { credentials: 'include' });

        if (!notificationsResponse.ok) {
            const errorText = await notificationsResponse.text();
            setMessage(`Failed to fetch notifications: ${errorText}`)
            throw new Error(`Failed to fetch notifications: ${errorText}`);
        }
        const userNotifications = await notificationsResponse.json();
        setNotifications(userNotifications);
    };

    useEffect(() => {
        handleRequestNotifications()
    },[overLoad]);

    const handleDeleteNotificationById = async(notificationId:string) => {
        try {
            const response = await fetch(`${API_URL}/api/notifications/${notificationId}`,{
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Delete failed');
            setMessage(`Successful delete`);
            setOverLoad(true);
        } catch (error) {
            setMessage(`Error delete notification: ${error}`);
        }
    };

    if (!notifications[0]?._id ) {
        return (<div><div className="h-24"></div><p style={{textShadow:"2px 1px 2px rgba(0, 0, 0, 0.6)"}} className="text-grey-600 text-5xl">{contents.myNotification[1].text}</p></div>);
    } else {
        return (
            <div>
                <div className="h-[64px]"></div>
                <section className="py-10 xl:px-8 px-4">
                    <h3 className="text-4xl font-bold mb-6" style={{textShadow:"2px 1px 2px rgba(0,0,0,0.6)"}}>
                        {userName}, {contents.myNotification[0].text}
                    </h3>
                    <div  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 ">
                    {notifications.map((notification: Notification) => {
                        return(

                            <div key={notification._id} className="w-full p-1 border-gray-500 border-2 rounded">
                                <div className="ml-auto mr-auto border-gray-500 border-2 rounded text-left leading-tight">
                                    <p className="p-1 ml-2">&#x25FC; {contents.myNotification[2].text} : {new Date(Number(notification.date)).toLocaleString('uk-UA', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}</p>
                                    <p className="p-1 ml-2">&#x25FC; {contents.myNotification[3].text} : {notification.listingType}</p>
                                    <p className="p-1 ml-2">&#x25FC; {contents.myNotification[4].text} : {notification.propertyType}</p>
                                    <p className="p-1 ml-2">&#x25FC; {contents.myNotification[5].text} : {notification.typeOfNovelty}</p>
                                    <p className="p-1 ml-2">&#x25FC; {contents.myNotification[6].text} : {notification.minNumbersOfRoom}</p>
                                    <p className="p-1 ml-2">&#x25FC; {contents.myNotification[7].text} : {notification.maxNumbersOfRoom}</p>
                                    <p className="p-1 ml-2">&#x25FC; {contents.myNotification[8].text} : {notification.minTotalArea}</p>
                                    <p className="p-1 ml-2">&#x25FC; {contents.myNotification[9].text} : {notification.maxTotalArea}</p>
                                    <p className="p-1 ml-2">&#x25FC; {contents.myNotification[10].text} : {notification.minFloor}</p>
                                    <p className="p-1 ml-2">&#x25FC; {contents.myNotification[11].text} : {notification.maxFloor}</p>
                                    <p className="p-1 ml-2">&#x25FC; {contents.myNotification[12].text} : {notification.minPrice}</p>
                                    <p className="p-1 ml-2">&#x25FC; {contents.myNotification[13].text} : {notification.maxPrice}</p>
                                    <p className="p-1 ml-2">&#x25FC; {contents.myNotification[14].text} : {notification.locationSought}</p>
                                    <p className="p-1 ml-2">&#x25FC; {contents.myNotification[15].text} : {notification.locationRange}</p>
                                    <p className="p-1 ml-2">&#x25FC; {contents.myNotification[16].text} : {notification.email}</p>
                                </div>
                                <div className="mt-2 flex gap-2 justify-center">
                                    <Link className="link bg-blue-500 hover:bg-blue-600 text-white"
                                    to={`/notification/edit/${notification._id}`}>{contents.myNotification[17].text}</Link>
                                    <button onClick={()=>handleDeleteNotificationById(notification._id)}
                                        className="bg-red-500 hover:bg-red-600 text-white">{contents.myNotification[18].text}</button>
                                </div>
                            </div>

                        )}
                    )}
                    </div>
                </section>
            </div>
        )
    }
};
export default MyNotification;