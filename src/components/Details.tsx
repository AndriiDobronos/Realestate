import React, {useEffect, useRef, useState} from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import DescriptionOfDetails from "./DescriptionOfDetails";
import Map from "./Map";
import {RootState} from "../app/store";
import {useSelector} from "react-redux";
import { useAuth } from '../services/useAuth';
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
    const [comments, setComments] = useState<any[]>([{comment:"loading!!!"}]);
    const [error, setError] = useState('');
    const { handleFullLogout } = useAuth();
    const bgColor = getRandomHexColor();
    const [formData, setFormData] = useState({
        listingId: `${id}`,
        commentsAuthor: `${userName}`,
        authorId: `${userId}`,
        timePublication: Date.now().toString(),
        comment: ``,
        rating: ``,
    });
    const filterNullListings = listing?.image.filter((item): item is string => item !== null) ?? [];
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
        handleFullLogout(() => {}, () => {});
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

    if (loading) return (
        <div className="mx-auto bg-gray-200 pt-20 xl:px-6 px-3 pb-6 min-h-screen">
            <div className="mx-auto bg-white rounded-lg shadow-md xl:p-6 p-3">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:gap-8 gap-4 w-full animate-pulse">
                    {/* left: carousel placeholder + info lines */}
                    <div>
                        <div className="bg-gray-300 rounded-lg h-64 sm:h-80 w-full mb-4" />
                        <div className="pl-6 pr-6 pt-2 pb-2 space-y-3">
                            <div className="h-4 bg-gray-300 rounded w-3/4" />
                            <div className="h-4 bg-gray-300 rounded w-1/2" />
                            <div className="h-4 bg-gray-300 rounded w-2/3" />
                            <div className="h-4 bg-gray-300 rounded w-3/4" />
                            <div className="h-4 bg-gray-300 rounded w-1/2" />
                            <div className="h-4 bg-gray-300 rounded w-2/3" />
                            <div className="h-4 bg-gray-300 rounded w-1/3" />
                            <div className="h-4 bg-gray-300 rounded w-3/5" />
                            <div className="flex justify-around mt-4 gap-4">
                                <div className="h-10 bg-gray-300 rounded w-32" />
                                <div className="h-10 bg-gray-300 rounded w-32" />
                            </div>
                        </div>
                    </div>
                    {/* right: map placeholder */}
                    <div className="bg-gray-300 rounded min-h-[600px] w-full" />
                </div>
            </div>
        </div>
    );
    if (error) return <div className="mt-[64px]">{error}</div>;
    if (!listing) return <div className="mt-[64px]">{contents.details[1].text}</div>; // {Listing not found}

    return (
        <div className="mx-auto bg-gray-200 pt-20 xl:px-6 px-3 pb-6">
            <div className="details mx-auto bg-white rounded-lg shadow-md xl:p-6 p-3 flex flex-row">
                <div className="xl:gap-8 gap-4 grid grid-cols-1 lg:grid-cols-2 w-full">
                    <DescriptionOfDetails
                        listing={listing}
                        filterNullListings={filterNullListings}
                        isAdmin={isAdmin}
                        show={show}
                        savedScroll={savedScroll}
                        handleLeaveFeedback={handleLeaveFeedback}
                        handleDeleteUserDataByUserId={handleDeleteUserDataByUserId}
                    />
                    <div className="min-h-[600px] w-full rounded-xl overflow-hidden border-2 border-gray-400">    
                        <Map location={listing?.location} />
                    </div>
                </div>
            </div>


            {show && (
                <div id="review" ref={reviewRef} className="mt-6 mx-auto bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">

                    {/* ── Header ──────────────────────────────────── */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800">{contents.details[8].text}</h2>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                            {comments.length} {contents.details[9].text}
                        </span>
                    </div>
                    <hr className="border-gray-100" />

                    {/* ── Write review ────────────────────────────── */}
                    <div className="flex flex-col lg:flex-row gap-3">
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <div
                                style={{ backgroundColor: bgColor }}
                                className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm flex-shrink-0"
                            >
                                {`${userName}`.charAt(0).toUpperCase()}
                            </div>
                            <b className="text-sm text-gray-700 whitespace-nowrap">@{userName}</b>
                        </div>
                        <form onSubmit={handleSubmitReview} className="flex flex-col sm:flex-row gap-2 flex-1">
                            <div className="flex flex-col flex-1 gap-1.5">
                                <textarea
                                    style={{ outline: 'none' }}
                                    className="w-full rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-700 resize-none focus:border-blue-400 transition-colors"
                                    rows={2}
                                    name="comment"
                                    onChange={handleChange}
                                    value={formData.comment}
                                    placeholder={contents.details[26].text}
                                />
                                <select
                                    name="rating"
                                    id="rating"
                                    value={formData.rating}
                                    onChange={handleChange}
                                    className="rounded-xl bg-gray-50 border border-gray-200 px-3 py-1.5 text-sm w-32"
                                    style={{ outline: 'none', color: isSelected ? '#f59e0b' : '#9ca3af' }}
                                >
                                    <option value="">★</option>
                                    <option value="1">★</option>
                                    <option value="2">★★</option>
                                    <option value="3">★★★</option>
                                    <option value="4">★★★★</option>
                                    <option value="5">★★★★★</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="self-start sm:self-center px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-semibold transition-colors duration-200 whitespace-nowrap"
                            >
                                {contents.details[10].text}
                            </button>
                        </form>
                    </div>

                    {/* ── Comment list ─────────────────────────────── */}
                    {comments && comments.map((comment, index) => (
                        <div key={index} className="rounded-xl bg-gray-50 px-4 py-3 flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                                <div
                                    style={{ backgroundColor: bgColor }}
                                    className="w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs flex-shrink-0"
                                >
                                    {`${comment.commentsAuthor}`.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col leading-tight">
                                    <span className="text-sm font-semibold text-gray-700">@{comment.commentsAuthor}</span>
                                    <span className="text-xs text-gray-400">{contents.details[11].text}{timeAgoFromTimestamp(+comment?.timePublication)}</span>
                                </div>
                                {comment.rating && (
                                    <span className="ml-auto text-yellow-500 text-base">
                                        {comment.rating === '1' ? '★' : comment.rating === '2' ? '★★' :
                                         comment.rating === '3' ? '★★★' : comment.rating === '4' ? '★★★★' : '★★★★★'}
                                    </span>
                                )}
                            </div>
                            {comment.comment && (
                                <p className="text-sm text-blue-600 ml-10 leading-relaxed">{comment.comment}</p>
                            )}
                        </div>
                    ))}

                </div>
            )}
        </div>
    );
};

export default Details;