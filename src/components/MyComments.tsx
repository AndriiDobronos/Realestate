import React, {useEffect, useState} from 'react';
import {RootState} from "../app/store";
import { useSelector } from 'react-redux';
//import { useParams } from 'react-router-dom';
import {useLanguage} from "../context/LanguageContext";
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import noCommentsFound from '../assets/images/noCommentsFound.png';

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
    _id: string,
    listingNumber: number,
    typeOfNovelty: string,
    numbersOfRooms: number,
    totalArea: number,
    numberOfFloor: number,
    numberOfStoreysOfBuilding: number,
    apartmentDetails: string,
    description: string,
    price: number,
    image: [string | null],
    owner: string,
    ownerId: string,
    email: string,
    contact: string,
    location: string,
    date: string,
    listingType: string,
    propertyType: string,
    lat: number,
    lon: number,
}

const MyComments = () => {
    const { language } = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts
    //const { id } = useParams<{ id: string }>();
    const userName = useSelector((state: RootState) => state.registration.userName);
    const userId = useSelector((state: RootState) => state.registration.userId);
    const [message,setMessage] = useState('');
    const [messageSuccess, setMessageSuccess] = useState('');
    const [listings, setListings] = useState<[IListing] | []>([]);
    const [comments, setComments] = useState<[{_id:string,comment:string,rating:string,listingId:string}]>([{_id:'',comment:'',rating:'',listingId:''}]);
    const [editableComments, setEditableComments] = useState<{[key: string]: {comment: string; rating: string}}>({});
    const listingIdWithComment:string[] = [];
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    // Инициализация состояний редактирования при загрузке комментариев
    useEffect(() => {
        const initialEditable = comments.reduce((acc, comment) => ({
            ...acc,
            [comment._id]: {
                comment: comment.comment,
                rating: comment.rating
            }
        }), {});
        setEditableComments(initialEditable);
    }, [comments]);

    const handleCommentChange = (commentId: string, field: string, value: string) => {
        setEditableComments(prev => ({
            ...prev,
            [commentId]: {
                ...prev[commentId],
                [field]: value
            }
        }));
    };

    const handleRequestListings = async (reqString: string) => {
        if (comments) {
            comments.forEach((el)=> listingIdWithComment.push(`${API_URL}/api/listings/${encodeURIComponent(el?.listingId)}`))
        }

        if (listingIdWithComment.length > 0) {
            const response = await fetch(reqString, { credentials: 'include' });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch listings: ${errorText}`);
            }
            const newListings = await response.json();
            setListings(prev => {
                const existingIds = new Set(prev.map((l: any) => l._id));
                const filtered = newListings.filter((l: any) => !existingIds.has(l._id));
                return [...prev, ...filtered];
            });
        } else {
            //setMessage('Listings not founded')
            setMessage(contents.myComments[0].text)
        }
    };

    const handleRequestComments = async() => {
        const commentsResponse = (userName === 'admin') ? await fetch(`${API_URL}/comments`,{ credentials: 'include' }) :
            await fetch(`${API_URL}/api/comments/authorId/${userId}`, { credentials: 'include' });

        if (!commentsResponse.ok) {
            const errorText = await commentsResponse.text();
            setMessage(`Failed to fetch comments: ${errorText}`)
            throw new Error(`Failed to fetch comments: ${errorText}`);
        }
        const userComments = await commentsResponse.json();
        setComments(userComments);
        setListings([]);
        setMessageSuccess(`Fetch returned successful`)
    };

    useEffect(() => {
        const fetchData = async () => {
            await handleRequestComments();   // Сначала загружаем комментарии

            // Для всех пользователей загружаем объявления из их комментариев
            const uniqueListingIds = [...new Set(comments.map(c => c.listingId))];
            const urls = uniqueListingIds.map(id =>
                `${API_URL}/api/listings/${encodeURIComponent(id)}`
            );
            await Promise.all(urls.map(url => handleRequestListings(url)));
            setMessage(``);
        };
        fetchData();
    }, [messageSuccess]);

    const handleSubmitEditComments = async (e: React.FormEvent, commentId: string) => {
        e.preventDefault();
        try {
            const dataToSend = {
                ...editableComments[commentId],
                authorId: userId,
                commentsAuthor: userName,
                rating: editableComments[commentId].rating || ""
            };

            const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(dataToSend)
            });
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || 'Update failed');
            }

            // Обновляем список комментариев после успешного обновления
            await handleRequestComments();
            setMessageSuccess(`Successful updating comment`);
            //setMessage(``);
        } catch (error) {
            //setMessageSuccess(``);
            setMessage(`Error updating comment: ${error}`);
        }
    };

    const handleDeleteComment = async(commentId:string) => {
        try {
            const response = await fetch(`${API_URL}/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (!response.ok) throw new Error('Delete failed');
            setMessageSuccess(`Successful delete`)

        } catch (error) {
            setMessage(`Error delete comment: ${error}`);
        }
    };

    if (!listings[0]?._id || !comments[0]?._id) {
        return (
            <div className="flex flex-col items-center min-h-screen pt-24 px-4 pb-8">
                <p
                    className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 sm:mb-8 md:mb-10"
                    style={{textShadow: "2px 1px 2px rgba(0, 0, 0, 0.6)"}}
                >
                    {contents.myComments[0].text}
                </p>
                <img
                    src={noCommentsFound}
                    alt="No comments found"
                    className="w-4/5 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl object-contain flex-1"
                />
            </div>
        );
    } else {
        return (
            <div className="myComments">
                <div className="h-[44px]"></div>
                <section className="py-10 xl:px-8 p-4">
                    <div className="mx-auto">
                        <h3 className="text-4xl font-bold mb-6" style={{textShadow:"2px 1px 2px rgba(0,0,0,0.6)"}}>
                            {contents.myComments[15].text}{userName}{contents.myComments[1].text}
                            {/*{, select comment to edit}*/}
                        </h3>
                        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {comments.map((comment) => {
                                const listing = listings.find((l: any) => l._id === comment.listingId);
                                if (!listing) return null; // Пропускаем комментарии без объявлений
                                return (
                                    <li key={comment._id} className="text-left border-gray-400 border-2 p-2 rounded-md shadow-xl relative">
                                        <p className="text-gray-600 font-bold">&#x25FC;{contents.myComments[2].text}{listing.apartmentDetails}</p>
                                        {/*{ Property : }*/}
                                        <p className="text-gray-600">&#x25FC; {contents.myComments[3].text}{listing.description}.</p>
                                        {/*{Description of property : }*/}
                                        {listing.listingType === "rent" ? (
                                            <p className="text-gray-600">&#x25FC; {contents.myComments[4].text}${listing.price}.</p>
                                            // {Monthly rental property : }
                                        ) : (
                                            <p className="text-gray-600">&#x25FC; {contents.myComments[5].text}${listing.price}.</p>)}
                                        {/*{Selling price : }*/}
                                        <p className="text-gray-600">&#x25FC; {contents.myComments[6].text}{listing.contact}.</p>
                                        {/*{Owner's contact data : }*/}
                                        <p className="text-gray-600">&#x25FC; {contents.myComments[7].text}{listing?.location}.</p>
                                        {/*{Location : }*/}
                                        <p className="text-gray-600">&#x25FC; {contents.myComments[8].text}{listing.propertyType}.</p>
                                        {/*{Property type : }*/}
                                        <p className="text-gray-600">&#x25FC; {contents.myComments[9].text}{ new Date(+listing.date).toLocaleString()}.</p>
                                        {/*{Time of download : }*/}
                                        <div style={{position: "absolute",zIndex:"20", left:"30px", top:"90px",opacity:"0.6",transform: "rotateZ(-45deg)"}}>
                                            {listing.listingType === 'sale' ? <p style={{fontSize:"40px",color:"green"}}>{contents.myComments[10].text}</p> :
                                                <p style={{fontSize:"40px",color:"green"}}>{contents.myComments[11].text}</p>}
                                        </div>
                                        <div  className="w-full h-[300px] bg-white overflow-hidden relative">
                                            {/*{<img src={listing.image.find(item => item !== null) || null} alt={`Property`}}*/}
                                            <img src={listing.image.find(item => item !== null)} alt={`Property`}
                                                 className="w-full h-full object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                            />
                                        </div>

                                        <div className="mt-4 p-4 bg-gray-100 rounded-md relative">
                                            <form onSubmit={(e) => handleSubmitEditComments(e, comment._id)}>
                                                <div className="flex flex-col">
                                                    <div className="border-gray-400 border-b-2 mb-2">
                                                        <input
                                                            style={{outline: "none"}}
                                                            className="w-full"
                                                            type="text"
                                                            name="comment"
                                                            //onChange={handleChange}
                                                            onChange={(e) => handleCommentChange(comment._id, 'comment', e.target.value)}
                                                            //value={comment.comment || ''}
                                                            value={editableComments[comment._id]?.comment || ''}
                                                            placeholder={contents.myComments[12].text} //Enter comment
                                                        />
                                                    </div>
                                                    <select name="rating"
                                                            value={editableComments[comment._id]?.rating || ''}
                                                            onChange={(e) => handleCommentChange(comment._id, 'rating', e.target.value)}
                                                            style={{outline: "none", fontSize: "20px"}}
                                                    >
                                                        <option value="" className="text-gray-400 text-2xl">★</option>
                                                        <option value="1" className="text-yellow-500 text-2xl">★</option>
                                                        <option value="2" className="text-yellow-500 text-2xl">★★</option>
                                                        <option value="3" className="text-yellow-500 text-2xl">★★★</option>
                                                        <option value="4" className="text-yellow-500 text-2xl">★★★★</option>
                                                        <option value="5" className="text-yellow-500 text-2xl">★★★★★</option>
                                                    </select>
                                                </div>
                                                <button type="submit" className="mt-2 bg-blue-500 text-white mr-6">
                                                    {contents.myComments[13].text}
                                                    {/*{Update Comment}*/}
                                                </button>
                                            </form>
                                            <button className="bg-red-500 text-white absolute z-10 left-1/2 bottom-4" onClick={() => handleDeleteComment(comment._id)} >
                                                {contents.myComments[14].text}
                                                {/*{Delete Comment}*/}
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </section>
                {/*<h2 className="text-red-500">{message}:<b className="text-green-500">{messageSuccess}</b></h2>*/}
                {/*<h3>{userId} : {userName}</h3>*/}
                {/*<h3>*{editableComments[comments[2]._id]?.comment}</h3>*/}
                {/*<h3>*{editableComments[comments[2]._id]?.rating}</h3>*/}
            </div>
        )
    }
};
export default MyComments;