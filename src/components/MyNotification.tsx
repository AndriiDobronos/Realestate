import { useEffect, useState } from 'react';
import { RootState } from "../app/store";
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import { useLanguage } from "../context/LanguageContext";
import noNotificationsFound from '../assets/images/noNotificationsFound.png';

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
    userId: string;
    lat: number;
    lon: number;
    date: number;
}

/* ── tiny helper: show "min — max" only when at least one value exists ── */
const RangeRow = ({ label, min, max, unit = '' }: { label: string; min: string; max: string; unit?: string }) => {
    if (!min && !max) return null;
    const range = min && max ? `${min} — ${max}` : min || max;
    return (
        <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="text-gray-400 text-xs font-medium">{label}</span>
            <span className="font-semibold">{range}{unit ? ` ${unit}` : ''}</span>
        </div>
    );
};

const MyNotification = () => {
    const { language } = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts;
    const n = contents.myNotification;
    const c = contents.cards;

    const userName = useSelector((state: RootState) => state.registration.userName);
    const userId = useSelector((state: RootState) => state.registration.userId);
    const isAdmin = userName === 'admin';

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [error, setError] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    useEffect(() => {
        setError('');
        const url = userName === 'admin'
            ? `${API_URL}/notifications`
            : `${API_URL}/api/notifications/authorId/${userId}`;

        fetch(url, { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
                return res.json();
            })
            .then((data) => {
                const arr: Notification[] = Array.isArray(data) ? data : (data?._id ? [data] : []);
                setNotifications(arr.filter(n => n?._id));
            })
            .catch(err => setError(String(err)));
    }, [refreshKey, userName, userId, API_URL]);

    const handleDelete = async (notificationId: string) => {
        try {
            const res = await fetch(`${API_URL}/api/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Delete failed');
            setRefreshKey(k => k + 1);
        } catch (err) {
            setError(String(err));
        }
    };

    /* ── helpers ── */
    const listingTypeLabel = (t: string) =>
        t === 'rent' ? c[10].text : t === 'sale' ? c[11].text : t;

    const propertyTypeLabel = (t: string) =>
        t === 'flat' ? c[12].text : t === 'private house' ? c[13].text : t === 'commercial' ? c[14].text : t;

    const noveltyLabel = (t: string) =>
        t === 'newBuilding' ? c[18].text : t;

    /* ── empty state ── */
    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center min-h-screen pt-24 px-4 pb-8">
                {error && (
                    <p className="text-red-500 text-sm font-medium mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                        {error}
                    </p>
                )}
                <p
                    className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 sm:mb-8 md:mb-10"
                    style={{ textShadow: "2px 1px 2px rgba(0, 0, 0, 0.6)" }}
                >
                    {n[1].text}
                </p>
                <img
                    src={noNotificationsFound}
                    alt="No notifications found"
                    className="w-4/5 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl object-contain flex-1"
                />
            </div>
        );
    }

    return (
        <div>
            <div className="h-[64px]" />
            <section className="py-10 px-8">
                <h3
                    className="text-4xl font-bold mb-6"
                    style={{ textShadow: "2px 1px 2px rgba(0,0,0,0.6)" }}
                >
                    {userName}, {n[0].text}
                </h3>

                {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

                <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notifications.map((notification) => {
                        const formattedDate = new Date(Number(notification.date)).toLocaleDateString(
                            language === 'en' ? 'en-GB' : 'uk-UA',
                            { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
                        );

                        return (
                            <li
                                key={notification._id}
                                className="flex flex-col bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                            >
                                {/* ── Header: date + type badges ───────── */}
                                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="#9ca3af">
                                            <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"/>
                                        </svg>
                                        <span>{formattedDate}</span>
                                    </div>
                                    <div className="flex gap-1.5">
                                        {notification.listingType && (
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white ${notification.listingType === 'rent' ? 'bg-blue-500' : 'bg-green-500'}`}>
                                                {listingTypeLabel(notification.listingType)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* ── Admin: owner email row ────────────── */}
                                {isAdmin && (
                                    <div className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 border-b border-blue-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="#3b82f6">
                                            <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 129-46.5T480-440q68 0 135 15.5T744-378q29 15 46.5 43.5T808-272v112H160Z"/>
                                        </svg>
                                        <span className="text-xs text-blue-600">{n[19].text}</span>
                                        <span className="text-xs font-semibold text-blue-800 truncate">{notification.email}</span>
                                    </div>
                                )}

                                {/* ── Content ──────────────────────────── */}
                                <div className="flex flex-col flex-1 p-4 gap-3">

                                    {/* Property type + novelty chips */}
                                    <div className="flex flex-wrap gap-2">
                                        {notification.propertyType && (
                                            <span className="inline-flex items-center bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
                                                {propertyTypeLabel(notification.propertyType)}
                                            </span>
                                        )}
                                        {notification.typeOfNovelty && (
                                            <span className="inline-flex items-center bg-orange-50 text-orange-600 text-xs font-medium px-2.5 py-1 rounded-full">
                                                {noveltyLabel(notification.typeOfNovelty)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Range rows */}
                                    <div className="flex flex-col gap-1.5 border border-gray-100 rounded-xl p-3 bg-gray-50">
                                        <RangeRow label={n[6].text} min={notification.minNumbersOfRoom} max={notification.maxNumbersOfRoom} unit={c[15].text} />
                                        <RangeRow label={n[8].text} min={notification.minTotalArea} max={notification.maxTotalArea} unit={c[16].text} />
                                        <RangeRow label={n[10].text} min={notification.minFloor} max={notification.maxFloor} />
                                        <RangeRow label={n[12].text} min={notification.minPrice} max={notification.maxPrice} unit="$" />
                                    </div>

                                    {/* Location */}
                                    {(notification.locationSought || notification.locationRange) && (
                                        <div className="flex items-start gap-1.5 text-sm text-gray-600">
                                            <svg className="flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="#EF4444">
                                                <path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/>
                                            </svg>
                                            <span className="line-clamp-2 leading-snug flex-1">{notification.locationSought}</span>
                                            {notification.locationRange ? (
                                                <span className="flex-shrink-0 text-xs text-gray-400 font-medium">{notification.locationRange} km</span>
                                            ) : null}
                                        </div>
                                    )}

                                    {/* Email */}
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-auto">
                                        <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="#9ca3af">
                                            <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z"/>
                                        </svg>
                                        <span className="truncate text-xs">{notification.email}</span>
                                    </div>
                                </div>

                                {/* ── Actions ──────────────────────────── */}
                                <div className="flex gap-2 p-4 pt-2 border-t border-gray-100">
                                    <Link
                                        to={`/notification/edit/${notification._id}`}
                                        className="flex-1 py-2 text-center rounded-xl !bg-blue-500 hover:!bg-blue-600 active:!bg-blue-700 text-white text-sm font-semibold transition-colors duration-200 !shadow-none !border-0 !no-underline"
                                    >
                                        {n[17].text}
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(notification._id)}
                                        className="flex-1 py-2 rounded-xl !bg-red-500 hover:!bg-red-600 active:!bg-red-700 text-white text-sm font-semibold transition-colors duration-200 !shadow-none !border-0"
                                    >
                                        {n[18].text}
                                    </button>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </section>
        </div>
    );
};

export default MyNotification;
