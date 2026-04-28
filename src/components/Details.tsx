import React, {useEffect, useRef, useState} from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import Carousel from "./Carousel";
import Map from "./Map";
import {Home} from "../pages/Home";
import {RootState} from "../app/store";
import {useSelector} from "react-redux";
import {getRandomHexColor} from"../services/randomColor";
import {useLanguage} from "../context/LanguageContext";
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

const Details = () => {
    const { language } = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts
    const userName = useSelector((state: RootState) => state.registration.userName);
    const userId = useSelector((state: RootState) => state.registration.userId);
    const location = useLocation();
    const savedScroll = location.state?.fromHomeScroll || 0;
    const reviewRef = useRef(null);
    const { id } = useParams<{ id: string }>();
    const [listing, setListing] = useState<Listing | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [show, setShow] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [comments, setComments] = useState<any[]>([{comment:"loading!!!"}]);
    const [error, setError] = useState('');
    const bgColor = getRandomHexColor();
    const [formData, setFormData] = useState({
        listingId: `${id}`,
        commentsAuthor: `${userName}`,
        authorId: `${userId}`,
        timePublication: Date.now().toString(),
        comment: ``,
        rating: ``,
    });
    const filterNullListings = listing?.image.filter((item): item is string => item !== null);
    const isSelected = formData.rating !== '';
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    const scrollToReview = () => {
        if (reviewRef.current) {
            reviewRef.current.scrollIntoView({
                behavior: "smooth",
                block: "review",
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await axios.get(`${API_URL}/listing/${id}`);
                setListing(response.data);
            } catch (err) {
                setError('Failed to load listing details');
            } finally {
                setLoading(false);
            }
        };
        fetchListing();
    }, [id]);

    useEffect(() => {
        if(userName === `admin`) {
            setIsAdmin(true)
        }
    }, []);

    const fetchComments = async () => {
        const response = await fetch(`${API_URL}/api/comments/listingId/${id}`);
        return response.json();
    };

    useEffect(() => {
        const getData = async () => {
            const data = await fetchComments();
            setComments(data);
        };
        getData();
    }, [formData]);

    const timeAgoFromTimestamp = (timestamp: number): string => {
        const now = new Date().getTime();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 1000 / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        const remainingMinutes = minutes % 60;
        const parts: string[] = [];
        if (days > 0) parts.push(`${days} d.`);
        if (remainingHours > 0) parts.push(`${remainingHours} h.`);
        if (remainingMinutes > 0 || parts.length === 0) parts.push(`${remainingMinutes} m.`);
        return parts.join(' ') + ' ago';
    }

    const handleDeleteUserDataByUserId = () => {
        Home.handleLogOut()
    }

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.comment && !formData.rating) {
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setSaveMessage(data.message.concat(data.rating))
                setFormData({
                    ...formData,
                    comment: "",
                    rating: "",
                })
            } else {
                setError('Failed to save.');
            }

        } catch (error) {
            setError(`An error: ${error} occurred. Please try again later.`);
        }
    };

    const handleLeaveFeedback = () => {
        scrollToReview();
        setShow(!show);
        if(show) {
            //document.getElementById("review")?.scrollIntoView({ behavior: "smooth", block: "review" });
            window.scrollTo({top: document.body.scrollHeight, behavior: "smooth"});
        } else {
            document.getElementById("details")?.scrollIntoView({ behavior: "smooth" });
        }
    };

    if (loading) return <div className="mt-[64px]">{contents.details[0].text}</div>; // {Loading...}
    if (error) return <div className="mt-[64px]">{error}</div>;
    if (!listing) return <div className="mt-[64px]">{contents.details[1].text}</div>; // {Listing not found}

    return (
        <div className="mx-auto bg-gray-200 pt-20 xl:px-6 px-3 pb-6">
            <div className="details mx-auto bg-white rounded-lg shadow-md xl:p-6 p-3 flex flex-row">
                <div className="xl:gap-8 gap-4 grid grid-cols-1 lg:grid-cols-2 w-full">
                    <div className={`relative`} >
                        <div className={``}>
                            <Carousel images={filterNullListings}/>
                        </div>

                        <div className="pl-6 pr-6 pt-2 pb-2 text-left leading-[1.75] text-xs sm:text-base" >
                            <div className="flex flex-row ml-[-5px] justify-between">
                                <div className={`flex flex-row`} >
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#3B82F6" >
                                        <path d="M680-600h80v-80h-80v80Zm0 160h80v-80h-80v80Zm0 160h80v-80h-80v80Zm0 160v-80h160v-560H480v56l-80-58v-78h520v720H680Zm-640
                                    0v-400l280-200 280 200v400H360v-200h-80v200H40Zm80-80h80v-200h240v200h80v-280L320-622 120-480v280Zm560-360ZM440-200v-200H200v200-200h240v200Z"/>
                                    </svg>
                                    <p className="text-gray-600 font-semibold ml-[5px]">{contents.details[13].text} {listing.propertyType === "flat" ?
                                        `${contents.details[14].text}` : listing.propertyType === "private house" ?
                                            `${contents.details[15].text}` : `${contents.details[15].text}`}
                                    </p>
                                </div>
                                <p className={`text-gray-600 font-semibold bg-red-200 px-2 rounded-md`}>{contents.details[12].text} {listing.listingNumber}</p>
                            </div>
                            <div className="flex flex-row ml-[-5px]">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1C935D">
                                    <path d="M200-280h60v-60h440v60h60v-154q0-21-8-39.5T730-506v-94q0-33-23.5-56.5T650-680H520q-11 0-21 3t-19 9q-9-6-19-9t-21-3H310q-33 0-56.5 23.5T230-600v94q-14 14-22 32.5t-8 39.5v154Zm60-120v-40q0-17 11.5-28.5T300-480h360q17 0 28.5 11.5T700-440v40H260Zm30-140v-80h160v80H290Zm220 0v-80h160v80H510ZM160-80q-33 0-56.5-23.5T80-160v-640q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v640q0 33-23.5 56.5T800-80H160Zm0-80h640v-640H160v640Zm0 0v-640 640Z"/>
                                </svg>
                                <p className="text-gray-600 font-semibold ml-[5px]">
                                    {contents.details[17].text}{listing.numbersOfRooms}
                                </p>
                            </div>
                            <div className="flex flex-row ml-[-5px]">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FC931D">
                                    <path d="M344-336 200-480l144-144 56 57-87 87 87 87-56 57Zm272 0-56-57 87-87-87-87 56-57 144 144-144 144ZM200-120q-33 0-56.5-23.5T120-200v-160h80v160h160v80H200Zm400 0v-80h160v-160h80v160q0 33-23.5 56.5T760-120H600ZM120-600v-160q0-33 23.5-56.5T200-840h160v80H200v160h-80Zm640 0v-160H600v-80h160q33 0 56.5 23.5T840-760v160h-80Z"/>
                                </svg>
                                <p className="text-gray-600 font-semibold ml-[5px]">
                                    {contents.details[18].text}{listing.totalArea}{contents.details[18].measur}
                                </p>
                            </div>
                            <div className="flex flex-row ml-[-5px] justify-between">
                                <div className={`flex flex-row`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#3B82F6">
                                        <path d="M80-120v-720h400v160h400v560H80Zm80-80h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h320v-400H480v80h80v80h-80v80h80v80h-80v80Zm160-240v-80h80v80h-80Zm0 160v-80h80v80h-80Z"/>
                                    </svg>
                                    <p className="text-gray-600 font-semibold ml-[5px]">
                                        {contents.details[19].text}{listing.numberOfFloor}/{listing.numberOfStoreysOfBuilding}
                                    </p>
                                </div>
                                <div className={`flex flex-row`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
                                        <path d="M120-120v-560h160v-160h400v320h160v400H520v-160h-80v160H120Zm80-80h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 320h80v-80h-80v80Zm0-160h80v-80h-80v80Zm0-160h80v-80h-80v80Zm160 480h80v-80h-80v80Zm0-160h80v-80h-80v80Z"/>
                                    </svg>
                                    <p className="text-green-600 font-semibold ml-2">
                                        {listing.typeOfNovelty === "newBuilding" ? `${ contents.details[24].text}` : `${ contents.details[25].text}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-row ml-[-5px]">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
                                    <path d="M240-440h360v-80H240v80Zm0-120h360v-80H240v80Zm-80 400q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-480H160v480Zm0 0v-480 480Z"/>
                                </svg>
                                <p className="text-gray-600 font-semibold ml-[5px]">
                                    {contents.details[2].text}{listing.apartmentDetails}
                                </p>
                            </div>
                            <div className="flex flex-row ml-[-5px]">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FC931D">
                                    <path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240
                                    240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"/>
                                </svg>
                                <p className="text-gray-600 font-semibold ml-[5px]">
                                    {contents.details[20].text}{listing.description}
                                </p>
                            </div>
                            <div className="flex flex-row ml-[-5px]">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1C935D">
                                    <path d="M444-200h70v-50q50-9 86-39t36-89q0-42-24-77t-96-61q-60-20-83-35t-23-41q0-26 18.5-41t53.5-15q32 0 50
                                    15.5t26 38.5l64-26q-11-35-40.5-61T516-710v-50h-70v50q-50 11-78 44t-28 74q0 47 27.5 76t86.5 50q63 23 87.5 41t24.5
                                    47q0 33-23.5 48.5T486-314q-33 0-58.5-20.5T390-396l-66 26q14 48 43.5 77.5T444-252v52Zm36 120q-83
                                    0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54
                                    54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134
                                    0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
                                </svg>
                                <p className="text-gray-600 font-semibold ml-[5px]">
                                    {listing.listingType === "rent" ? `${contents.details[21].text}` : `${contents.details[22].text}`}{listing.price} &#8372;
                                </p>
                            </div>
                            <div className="flex flex-row ml-[-5px]">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#3B82F6">
                                    <path d="M160-40v-80h640v80H160Zm0-800v-80h640v80H160Zm320 400q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35
                                    85q0 50 35 85t85 35ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0
                                    33-23.5 56.5T800-160H160Zm70-80q45-56 109-88t141-32q77 0 141 32t109 88h70v-480H160v480h70Zm118 0h264q-29-20-62.5-30T480-280q-36 0-69.5
                                    10T348-240Zm132-280q-17 0-28.5-11.5T440-560q0-17 11.5-28.5T480-600q17 0 28.5 11.5T520-560q0 17-11.5 28.5T480-520Zm0 40Z"/>
                                </svg>
                                <p className="text-gray-600 font-semibold ml-[5px]">{contents.details[23].text}{listing?.contact}.</p>
                            </div>
                            <div className="flex flex-row ml-[-5px]">
                                <svg xmlns="http://www.w3.org/2000/svg" height="1.5rem" viewBox="0 -960 960 960" width="1.5rem" fill="#FC931D">
                                    <path d="M185-80q-17 0-29.5-12.5T143-122v-105q0-90 56-159t144-88q-40 28-62 70.5T259-312v190q0 11 3 22t10
                                    20h-87Zm147 0q-17 0-29.5-12.5T290-122v-190q0-70 49.5-119T459-480h189q70 0 119 49t49 119v64q0 70-49
                                    119T648-80H332Zm148-484q-66 0-112-46t-46-112q0-66 46-112t112-46q66 0 112 46t46 112q0 66-46 112t-112 46Z"/>
                                </svg>
                                <p className="text-gray-600 font-semibold ml-[5px]"> {listing?.owner}.</p>
                            </div>
                            <div className="flex flex-row ml-[-5px]">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1C935D">
                                    <path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0
                                294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0
                                106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/>
                                </svg>
                                <p className="text-gray-600 font-semibold ml-[5px]"> {listing?.location}.</p>
                            </div>
                            <div className="flex flex-row ml-[-5px]">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#3B82F6">
                                    <path d="M200-200v-560 203-3 360Zm0 80q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160
                                    160v147q-19-9-39-15t-41-9v-89L646-760H200v560h252q7 22 16.5 42t22.5 38H200Zm242-126q-1-9-1.5-17.5T440-281q0-54
                                    20-104t58-89q-9-3-18.5-4.5T480-480q-50 0-85 35t-35 85q0 39 22.5 70.5T442-246ZM720-80q-83 0-141.5-58.5T520-280q0-83
                                    58.5-141.5T720-480q83 0 141.5 58.5T920-280q0 83-58.5 141.5T720-80Zm20-208v-112h-40v128l87 87 28-28-75-75ZM240-560h360v-160H240v160Z"/>
                                </svg>
                                <p className="text-gray-600 font-semibold mb-4 ml-[5px]">{contents.details[3].text} {new Date(+listing?.date).toLocaleDateString()}.</p>
                                {/*{Date of publication : }*/}
                            </div>

                            {/*<p>{savedScroll} &#x25A1; &#x25FC; &#x25FB;</p>*/}

                            <div className="justify-around flex">
                                <Link to="/" className="link inline-block bg-blue-500 text-white py-2 rounded" state={{ savedScroll: savedScroll }}>
                                    {contents.details[4].text}{/*{Back to Listings}*/}
                                </Link>
                                {isAdmin ? <button className="bg-red-500 text-white"
                                onClick={handleDeleteUserDataByUserId}>
                                    {contents.details[5].text}{listing.owner} data
                                    {/*{Delete user: }*/}
                                </button>: <button className="bg-blue-500 text-white"
                                                   onClick={handleLeaveFeedback}>
                                    {show ? contents.details[6].text : contents.details[7].text}
                                    {/*{Hide feedback : Leave feedback}*/}
                                </button>}
                            </div>

                        </div>
                    </div>
                    <div className={`min-h-[600px] w-full`}>
                        <Map location={listing?.location} />
                    </div>
                </div>
            </div>


            {show && <div id="review" ref={reviewRef} className="mt-6 mx-auto bg-white rounded-lg shadow-md p-6 flex justify-center flex-col">
                <h1 className="text-3xl">{contents.details[8].text}</h1><br/>
                {/*{Reviews for this advertisement}*/}
                <p className="flex justify-left ml-4 mb-4"><b>{comments.length} {contents.details[9].text}</b></p>
                {/*{COMMENTS}*/}
                <div className="makeReview flex lg:flex-row flex-col mb-4">
                    <div className={`flex flex-row`}>
                        <div style={{ backgroundColor: bgColor }}
                             className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold`}>
                            {`${userName}`.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <b className="ml-3 text-xl mr-3 whitespace-nowrap text-left">@* {userName}</b>
                        </div>
                    </div>
                    <div className={`flex items-center w-[100%]`}>
                        <form onSubmit={handleSubmitReview} className="flex flex-col md:flex-row w-[100%]">
                            <div className="flex flex-col mr-4 ml-4 lg:ml-0">
                                <div className="border-gray-400 border-b-2">
                                    <textarea style={{outline: "none"}} className="md:w-[480px] w-full" name="comment"
                                           onChange={handleChange} value={formData.comment} placeholder={contents.details[26].text} />
                                </div>
                                <select name="rating" id="rating"
                                        value={formData.rating}
                                        onChange={handleChange}
                                        style={{outline:"none",fontSize:"20px",color: isSelected ? '#f59e0b' : '#9ca3af'}}  //,color:"#F59E0B"
                                >
                                    <option value="" className="text-gray-400 text-2xl">★</option>
                                    <option value="1" className="text-yellow-500 text-2xl">★</option>
                                    <option value="2" className="text-yellow-500 text-2xl">★★</option>
                                    <option value="3" className="text-yellow-500 text-2xl">★★★</option>
                                    <option value="4" className="text-yellow-500 text-2xl">★★★★</option>
                                    <option value="5" className="text-yellow-500 text-2xl">★★★★★</option>
                                </select>
                            </div>
                            <button type="submit">{contents.details[10].text}</button> {/*{Leave a comment}*/}
                        </form>
                    </div>
                </div>
                {/*<p className="text-red-500">*{saveMessage}:{error}*</p>*/}
                {comments && comments.map((comment,index) =>(
                    <div key={index} >
                        <div className="listReview flex flex-row">
                            <div style={{ backgroundColor: bgColor }}
                                 className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-bold`}
                            >
                                {`${comment.commentsAuthor}`.charAt(0).toUpperCase()}
                            </div>
                            <div className={`flex text-left xs:flex-col`}>
                                <b className="ml-3 text-xl">@ {comment.commentsAuthor} : </b>
                                <p className={`ml-3`} >{contents.details[11].text}{timeAgoFromTimestamp(+comment?.timePublication)}</p>
                                {/*review published: */}
                            </div>
                        </div>
                        <div className="flex justify-left ml-12 text-blue-500">
                            <p className=" ml-3 text-left">{comment.comment}</p>
                        </div>
                        {comment.rating && <div className="flex justify-left ml-12 text-yellow-500">
                            <p className="ml-3">{comment.rating === "1" ? "★" : comment.rating === "2" ? "★★" :
                                comment.rating === "3" ? "★★★" : comment.rating === "4" ? "★★★★" : "★★★★★"}</p>
                        </div>}
                    </div>
                ))}

            </div>}
        </div>
    );
};

export default Details;