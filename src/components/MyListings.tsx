import React, {useEffect, useState} from 'react';
import {RootState} from "../app/store";
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import {useLanguage} from "../context/LanguageContext";

const MyListings = () => {
    const { language } = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts
    const userName = useSelector((state: RootState) => state.registration.userName);
    const userId = useSelector((state: RootState) => state.registration.userId);
    const [listings, setListings] = useState([]);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const [requestString, setRequestString] = useState(`${API_URL}/api/listings/ownerId/${encodeURIComponent(userId)}`);

    const handleRequest = async(reqString:string) => {
        const listingsResponse = await fetch(reqString, { credentials: 'include' });

        if (!listingsResponse.ok) {
            const errorText = await listingsResponse.text();
            throw new Error(`Failed to fetch listings: ${errorText}`);
        }
        const userListings = await listingsResponse.json();
        setListings(userListings);
    };

    useEffect(() => {
        if(userName === `admin`) {
            setRequestString(`${API_URL}/listings`);
        }
        handleRequest(requestString)
    }, [requestString]);

    return(
        <div>
            <div className="h-[64px]"></div>
            <section className="py-10 p-8" >
                <div className="mx-auto">
                    <h3 className="text-4xl font-bold mb-6" style={{textShadow:"2px 1px 2px rgba(0,0,0,0.6)"}}>{contents.myListings[0].text}{userName}</h3>
                    {/*{Select listing to edit }*/}
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {listings.map((listing: any) => {
                            return (
                                <Link key={listing._id}
                                    className="hover:bg-gray-300"
                                    to={`/listings/edit/${listing._id}`}
                                >
                                    <li className="h-full text-left relative border-gray-400 border-2 p-2 rounded-md shadow-xl flex flex-col justify-between">
                                        <p className="text-gray-600 font-bold">&#x25FC; {contents.myListings[2].text}{listing.apartmentDetails}</p>
                                        {/*{Property : }*/}
                                        <p className="text-gray-600">&#x25FC; {contents.myListings[3].text}{listing.description}.</p>
                                        {/*{Description of property : }*/}
                                        {listing.listingType === "rent" ? (
                                            <p className="text-gray-600">&#x25FC; {contents.myListings[4].text}${listing.price}.</p>
                                            // {Monthly rental property : }
                                        ) : (
                                            <p className="text-gray-600">&#x25FC; {contents.myListings[5].text}${listing.price}.</p>)}
                                        {/*{Selling price : }*/}
                                        <p className="text-gray-600">&#x25FC; {contents.myListings[6].text}{listing.contact}.</p>
                                        {/*{Owner's contact data : }*/}
                                        <p className="text-gray-600">&#x25FC; {contents.myListings[7].text}{listing?.location}.</p>
                                        {/*{Location : }*/}
                                        <p className="text-gray-600">&#x25FC; {contents.myListings[8].text}{listing.propertyType}.</p>
                                        {/*{Property type : }*/}
                                        <p className="text-gray-600">&#x25FC; {contents.myListings[9].text}{ new Date(+listing.date).toLocaleString()}.</p>
                                        {/*{Time of download : }*/}
                                        <div style={{position: "absolute",zIndex:"20", left:"30px", top:"90px",opacity:"0.6",transform: "rotateZ(-45deg)"}}>
                                            {listing.listingType === 'sale' ? <p style={{fontSize:"40px",color:"green"}}>{contents.myListings[10].text}</p> :
                                                <p style={{fontSize:"40px",color:"green"}}>{contents.myListings[11].text}</p>}
                                        </div>
                                        <div  className="w-full h-[300px] bg-white overflow-hidden relative">
                                            <img src={listing.image.find(item => item !== null) || null} alt={`Property`}
                                                 //className="hover:zoom-1.1 w-full h-full object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                                 className="w-full h-full object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-in-out hover:scale-110"
                                            />
                                        </div>
                                    </li>
                                </Link>
                            );
                        })}
                    </ul>
                </div>
            </section>
        </div>
    )
};
export default MyListings;