import { useEffect, useState, useCallback } from 'react';
import { RootState } from "../app/store";
import { useSelector } from 'react-redux';
import { useIsAdmin } from '../app/hooks';
import { useLanguage } from "../context/LanguageContext";
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import noCommentsFound from '../assets/images/noCommentsFound.webp';

interface Comment {
    _id: string;
    listingId: string;
    commentsAuthor: string;
    authorId: string;
    timePublication: string;
    comment: string;
    rating: string;
}

interface IListing {
    _id: string;
    listingNumber?: number;
    typeOfNovelty?: string;
    numbersOfRooms?: number;
    totalArea?: number;
    numberOfFloor?: number;
    numberOfStoreysOfBuilding?: number;
    apartmentDetails: string;
    description: string;
    price: number;
    image: (string | null)[];
    owner: string;
    ownerId: string;
    contact: string;
    location: string;
    date: string;
    listingType: string;
    propertyType: string;
}

const STAR_OPTIONS = ['', '1', '2', '3', '4', '5'] as const;
const STAR_LABELS = ['★', '★', '★★', '★★★', '★★★★', '★★★★★'];

const MyComments = () => {
    const { language } = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts;
    const c = contents.cards;
    const m = contents.myComments;

    const userName = useSelector((state: RootState) => state.registration.userName);
    const userId = useSelector((state: RootState) => state.registration.userId);
    const isAdmin = useIsAdmin();

    const [listings, setListings] = useState<IListing[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [editableComments, setEditableComments] = useState<Record<string, { comment: string; rating: string }>>({});
    const [error, setError] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    const loadData = useCallback(async () => {
        setError('');
        try {
            // 1. Fetch comments
            const commentsUrl = isAdmin
                ? `${API_URL}/comments`
                : `${API_URL}/api/comments/authorId/${encodeURIComponent(userId)}`;

            const commentsRes = await fetch(commentsUrl, { credentials: 'include' });
            if (!commentsRes.ok) throw new Error(`Failed to fetch comments: ${commentsRes.status}`);
            const fetchedComments: Comment[] = await commentsRes.json();
            setComments(fetchedComments);

            const initialEditable = fetchedComments.reduce<Record<string, { comment: string; rating: string }>>(
                (acc, c) => ({ ...acc, [c._id]: { comment: c.comment, rating: c.rating } }),
                {}
            );
            setEditableComments(initialEditable);

            // 2. Fetch listings for those comments (deduplicated)
            const uniqueIds = [...new Set(fetchedComments.map(c => c.listingId))];
            if (uniqueIds.length === 0) { setListings([]); return; }

            const listingResults = await Promise.all(
                uniqueIds.map(id =>
                    fetch(`${API_URL}/api/listings/${encodeURIComponent(id)}`, { credentials: 'include' })
                        .then(r => r.ok ? r.json() : null)
                        .catch(() => null)
                )
            );
            // API returns either a single object or an array — normalise both shapes
            const flatListings = listingResults.flatMap(r => {
                if (!r) return [];
                return Array.isArray(r) ? r : [r];
            }).filter((l): l is IListing => Boolean(l?._id));
            setListings(flatListings);
        } catch (err) {
            setError(String(err));
        }
    }, [API_URL, isAdmin, userId]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleCommentChange = (commentId: string, field: 'comment' | 'rating', value: string) => {
        setEditableComments(prev => ({
            ...prev,
            [commentId]: { ...prev[commentId], [field]: value }
        }));
    };

    const handleSubmitEdit = async (e: React.FormEvent, commentId: string) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/comments/${commentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    ...editableComments[commentId],
                    authorId: userId,
                    commentsAuthor: userName,
                })
            });
            if (!res.ok) throw new Error((await res.json()).message || 'Update failed');
            await loadData();
        } catch (err) {
            setError(String(err));
        }
    };

    const handleDelete = async (commentId: string) => {
        try {
            const res = await fetch(`${API_URL}/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Delete failed');
            await loadData();
        } catch (err) {
            setError(String(err));
        }
    };

    if (comments.length === 0 || listings.length === 0) {
        return (
            <div className="flex flex-col items-center min-h-screen pt-24 px-4 pb-8">
                <p className="text-2xl sm:text-3xl font-bold text-gray-700 text-center mb-6 sm:mb-8">
                    {m[0].text}
                </p>
                <img
                    src={noCommentsFound}
                    alt="No comments found"
                    className="w-4/5 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl object-contain flex-1"
                />
            </div>
        );
    }

    return (
        <div>
            <div className="h-[64px]" />
            <section className="py-10 px-8">
                <div className="mx-auto">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-3">
                        {m[15].text}{userName}{m[1].text}
                    </h1>

                    {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {comments.map((comment, index) => {
                            const listing = listings.find(l => l._id === comment.listingId);
                            if (!listing) return null;

                            const coverImage = listing.image?.find(img => img !== null) ?? null;
                            const isRent = listing.listingType === 'rent';
                            const isFlat = listing.propertyType === 'flat';
                            const isPrivateHouse = listing.propertyType === 'private house';
                            const showRooms = (isFlat || isPrivateHouse) && listing.numbersOfRooms;
                            const showFloor = listing.numberOfFloor && listing.numberOfStoreysOfBuilding;
                            const propertyLabel = isFlat ? c[12].text : isPrivateHouse ? c[13].text : c[14].text;
                            const displayNumber = listing.listingNumber ?? index + 1;
                            const currentEditable = editableComments[comment._id];

                            return (
                                <li
                                    key={comment._id}
                                    className="group flex flex-col bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
                                >
                                    {/* ── Image ─────────────────────────── */}
                                    <div className="relative h-64 flex-shrink-0 overflow-hidden bg-gray-100">
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
                                    </div>

                                    {/* ── Listing info ───────────────────── */}
                                    <div className="flex flex-col p-4 gap-2 border-b border-gray-100">

                                        {/* Listing number + owner */}
                                        <div className="flex items-center justify-between text-xs text-gray-400">
                                            <span className="font-semibold">{m[16].text}{displayNumber}</span>
                                            <span>{m[17].text}<span className="font-semibold text-gray-600">{listing.owner}</span></span>
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
                                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#1C935D" className="flex-shrink-0">
                                                <path d="M856-390 570-104q-12 12-27 18t-30 6q-15 0-30-6t-27-18L103-457q-11-11-17-25.5T80-513v-287q0-33 23.5-56.5T160-880h287q16 0 31 6.5t26 17.5l352 353q12 12 17.5 27t5.5 30q0 15-5.5 29.5T856-390ZM513-160l286-286-353-354H160v286l353 354ZM260-640q25 0 42.5-17.5T320-700q0-25-17.5-42.5T260-760q-25 0-42.5 17.5T200-700q0 25 17.5 42.5T260-640Zm220 160Z"/>
                                            </svg>
                                            <span className="text-xl font-bold text-gray-800">{listing.price} &#8372;</span>
                                            {isRent && <span className="text-sm text-gray-400">{c[17].text}</span>}
                                        </div>

                                        {/* Spec chips */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {showRooms && (
                                                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                                                    {listing.numbersOfRooms} {c[15].text}
                                                </span>
                                            )}
                                            {listing.totalArea ? (
                                                <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-xs font-medium px-2 py-0.5 rounded-full">
                                                    {listing.totalArea} {c[16].text}
                                                </span>
                                            ) : null}
                                            {showFloor ? (
                                                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                                                    {listing.numberOfFloor} {c[20].text} {listing.numberOfStoreysOfBuilding} {c[21].text}
                                                </span>
                                            ) : null}
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-start gap-1.5 text-sm text-gray-500">
                                            <svg className="flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="#EF4444">
                                                <path d="M480-480q33 0 56.5-23.5T560-560q0-33-23.5-56.5T480-640q-33 0-56.5 23.5T400-560q0 33 23.5 56.5T480-480Zm0 294q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z"/>
                                            </svg>
                                            <span className="line-clamp-1 leading-snug">{listing.location}</span>
                                        </div>
                                    </div>

                                    {/* ── Comment section ────────────────── */}
                                    <div className="flex flex-col flex-1 p-4 gap-3 bg-gray-50">

                                        {/* Admin: show commenter name */}
                                        {isAdmin && (
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="#6b7280">
                                                    <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 129-46.5T480-440q68 0 135 15.5T744-378q29 15 46.5 43.5T808-272v112H160Z"/>
                                                </svg>
                                                <span className="font-medium text-gray-700">{m[18].text}</span>
                                                <span className="font-bold text-blue-600">{comment.commentsAuthor}</span>
                                            </div>
                                        )}

                                        <form
                                            onSubmit={(e) => handleSubmitEdit(e, comment._id)}
                                            className="flex flex-col gap-3"
                                        >
                                            {/* Comment input */}
                                            <div className="flex flex-col gap-1">
                                                <input
                                                    type="text"
                                                    name="comment"
                                                    value={currentEditable?.comment ?? ''}
                                                    onChange={(e) => handleCommentChange(comment._id, 'comment', e.target.value)}
                                                    placeholder={m[12].text}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white"
                                                />
                                            </div>

                                            {/* Star rating */}
                                            <select
                                                name="rating"
                                                value={currentEditable?.rating ?? ''}
                                                onChange={(e) => handleCommentChange(comment._id, 'rating', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-lg text-yellow-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white cursor-pointer"
                                            >
                                                {STAR_OPTIONS.map((val, i) => (
                                                    <option key={val} value={val} className="text-yellow-500">
                                                        {STAR_LABELS[i]}
                                                    </option>
                                                ))}
                                            </select>

                                            {/* Action buttons */}
                                            <div className="flex gap-2 mt-auto">
                                                <button
                                                    type="submit"
                                                    className="flex-1 py-2 rounded-xl !bg-blue-500 hover:!bg-blue-600 active:!bg-blue-700 text-white text-sm font-semibold transition-colors duration-200 !shadow-none !border-0"
                                                >
                                                    {m[13].text}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(comment._id)}
                                                    className="flex-1 py-2 rounded-xl !bg-red-500 hover:!bg-red-600 active:!bg-red-700 text-white text-sm font-semibold transition-colors duration-200 !shadow-none !border-0"
                                                >
                                                    {m[14].text}
                                                </button>
                                            </div>
                                        </form>
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

export default MyComments;
