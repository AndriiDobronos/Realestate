import React, {useEffect, useState} from "react";
import axios from "axios";
import { useParams } from 'react-router-dom';
import ImageUpLoader from "../components/ImageUpLoader";
import { removeImage} from "../features/upLoadImages/upLoadImagesSlice";
import { useDispatch } from 'react-redux';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import {useLanguage} from "../context/LanguageContext";

const AddAgent = () => {
    const { language } = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts
    const {agentId} = useParams<{agentId?: string}>();
    const dispatch = useDispatch();
    const [uploadedImages, setUploadedImages] = useState<(string | null)[]>([null]);
    const [message, setMessage] = useState<string | null>(null);
    const [name, setName] =  useState("");
    const [jobTitle, setJobTitle] =  useState("");
    const [email, setEmail] =  useState("");
    const [saleVolume, setSaleVolume] =  useState("");
    const [totalDeal, setTotalDeal] =  useState("");
    const [rating, setRating] =  useState("");
    const [license, setLicense] =  useState("");
    const [phone, setPhone] =  useState("");
    const index = 0;
    const isEditMode = (!!agentId && agentId !== "new");
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    useEffect(() => {
        if (isEditMode) {
            const fetchAgentData = async () => {
                try {
                    const response = await fetch(`${API_URL}/api/agents/${agentId}`);
                    const data = await response.json();
                    setUploadedImages(data[0].image.filter((img: string) => img !== null))
                    setName(data[0].name);
                    setJobTitle(data[0].jobTitle);
                    setEmail(data[0].email);
                    setSaleVolume(data[0].saleVolume);
                    setTotalDeal(data[0].totalDeal);
                    setRating( data[0].rating);
                    setLicense(data[0].license);
                    setPhone(data[0].phone)
                } catch (error) {
                    console.error('Error fetching agent data:', error);
                }
            };
            fetchAgentData();
        }
    }, [isEditMode, agentId]);


    const handleImageUpload = (index: number, url: string) => {
        setUploadedImages(prev => {
            const newImages = [...prev];
            newImages[index] = url;
            return newImages;
        });
        //localStorage.setItem('agentImage', JSON.stringify(uploadedImages));
       //dispatch(addImage({ index, url }));
    };

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

            await axios.post(`https://api.cloudinary.com/v1_1/dndnmla09/image/destroy`, {
                public_id: publicId,
                api_key: data.api_key,
                timestamp: data.timestamp,
                signature: data.signature,
            });

            // Обновляем состояние
            setUploadedImages(prev => {
                const newImages = [...prev];
                newImages[index] = null;
                return newImages;
            });
            dispatch(removeImage(index));
            setMessage('Image deleted!')

        } catch (error) {
            setMessage(`Error deleting image: ${error}`)
        }
    };

    const handleInputName = (value: string) => {
        setName(value)
    };
    const handleInputJobTitle = (value: string) => {
        setJobTitle(value)
    };
    const handleInputEmail = (value: string) => {
        setEmail(value)
    };
    const handleInputSaleVolume = (value: string) => {
        setSaleVolume(value)
    };
    const handleInputTotalDeal = (value: string) => {
        setTotalDeal(value)
    };
    const handleInputRating = (value: string) => {
        setRating(value)
    };
    const handleInputLicense = (value: string) => {
        setLicense(value)
    };
    const handleInputPhone = (value: string) => {
        setPhone(value)
    };

    const addAgent = async (agentData: Record<string, any>) => {
        const response = await fetch(`${API_URL}/agents`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            credentials: 'include',
            body: JSON.stringify(agentData),
        });
        return response.json();
    };

    const handleDeleteUploadingImage = async () => {
        const urlToDelete = uploadedImages[0];
        if (!urlToDelete) return;

        try {
            // Удаляем из Cloudinary
            const urlParts = urlToDelete.split('/');
            const publicId = urlParts[urlParts.length - 1].split('.')[0];
            const { data } = await axios.post(`${API_URL}/generate-signature`, {
                public_id: publicId,
                timestamp: Math.floor(Date.now() / 1000),
            });

            await axios.post(`https://api.cloudinary.com/v1_1/dndnmla09/image/destroy`, {
                public_id: publicId,
                api_key: data.api_key,
                timestamp: data.timestamp,
                signature: data.signature,
            });

            // Обновляем состояние
            // setUploadedImages(prev => {
            //     const newImages = [...prev];
            //     newImages[0] = null;
            //     return newImages;
            // });
            setUploadedImages([null]);
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    };

    const handleDeleteAgentData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/agents/${agentId}`, {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json',},
                credentials: 'include',
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Delete agent data failed: ${errorText}`);
            }

            await handleDeleteUploadingImage()
            const successResponse = await response.json();
            setMessage(successResponse.message);
            setName('');
            setEmail('');
            setPhone('');
            setLicense ('');
            setJobTitle('');
            setSaleVolume('');
            setTotalDeal('');
            setRating('');
        } catch (error: any) {
            setMessage(`Delete agent data failed with error: ${error}`);
        }
    };

    const handleAddOrSaveAgent = async () => {
        try {
            const commonData = {
                image: `${uploadedImages}`,
                name: `${name}`,
                jobTitle: `${jobTitle}`,
                email: `${email}`,
                saleVolume: `${saleVolume}`,
                totalDeal: `${totalDeal}`,
                rating: `${rating}`,
                license: `${license}`,
                phone: `${phone}`,
                date: Date.now().toString()
            };
            // && agentId && agentId !== "new"
            if (isEditMode) {
                const updatedData = {...commonData};

                await axios.put(`${API_URL}/api/agents/${agentId}`, updatedData,{
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                setMessage("Success: agent's data updated successfully!");

            } else if (agentId === "new" && name.length > 2 &&  uploadedImages[0]?.includes('https://') && jobTitle &&
                email.includes('@') && saleVolume && totalDeal && rating && license && phone) {
                const newAgent = {...commonData};

                await addAgent(newAgent);
                setMessage("Success: agent's data added successfully.");

                // Очистка формы после успешного создания
                localStorage.removeItem('agentImages');
                setUploadedImages(Array(1).fill(null));
                setName('');
                setEmail('');
                setPhone('');
                setLicense ('');
                setJobTitle('');
                setSaleVolume('');
                setTotalDeal('');
                setRating('');
            } else {
                setMessage(`Fill in all fields with the required data`)
            }

        } catch (error: any) {
            const errorMessage = isEditMode
                ? "Failed to update agent's data:"
                : "Failed to add agent's data:";
            setMessage(`${errorMessage} ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div className="text-left px-10">
            <div className="h-[65px]"></div>
            <div className="bg-gray-500 w-[800px] rounded-md">
                <div className="flex flex-row items-center px-8 pt-2">
                    <h2 className="mr-6 text-white">{contents.addAgent[0].text}</h2>
                    {/*{Photo of agent:}*/}
                    <ImageUpLoader
                        key={index}
                        index={index}
                        onUploadComplete={handleImageUpload}
                        onDelete={handleImageDeleteUploading}
                        initialUrl={uploadedImages[index]}
                    />
                    <div className="ml-6 flex flex-col">
                        <p className="text-white">*{uploadedImages}</p>
                        <p className="text-white">*{message}</p>
                    </div>
                </div>
                <div className="flex flex-col px-6">
                    <label htmlFor="fullName" className="mr-2 text-white">{contents.addAgent[1].text}</label>
                    {/*{Full name: }*/}
                    <input  placeholder="Full name" type="text" value={name} onChange={(e) => handleInputName(e.target.value)}
                            className="border-gray-400 border-2 rounded text-gray-600 pl-2" name="fullName" />
                    <label htmlFor="jobTitle" className="mr-2 text-white">{contents.addAgent[2].text}</label>
                    {/*{Job title: }*/}
                    <input  placeholder="Job title • service area" type="text" value={jobTitle} onChange={(e) => handleInputJobTitle(e.target.value)}
                            className="border-gray-400 border-2 rounded text-gray-600 pl-2" name="jobTitle" />
                    <label htmlFor="email" className="mr-2 text-white">{contents.addAgent[3].text}</label>
                    {/*{Email: }*/}
                    <input  placeholder="Email" type="email" value={email} onChange={(e) => handleInputEmail(e.target.value)}
                            className="border-gray-400 border-2 rounded text-gray-600 pl-2" name="email" />
                    <label htmlFor="saleVolume" className="mr-2 text-white">{contents.addAgent[4].text}</label>
                    {/*{Sale volume: }*/}
                    <input  placeholder="Sale volume" type="text" value={saleVolume} onChange={(e) => handleInputSaleVolume(e.target.value)}
                            className="border-gray-400 border-2 rounded text-gray-600 pl-2" name="saleVolume" />
                    <label htmlFor="totalDeal" className="mr-2 text-white">{contents.addAgent[5].text}</label>
                    {/*{Total deal: }*/}
                    <input  placeholder="Total deal" type="text" value={totalDeal} onChange={(e) => handleInputTotalDeal(e.target.value)}
                            className="border-gray-400 border-2 rounded text-gray-600 pl-2" name="totalDeal" />
                    <label htmlFor="rating" className="mr-2 text-white">{contents.addAgent[6].text}</label>
                    {/*{Rating: }*/}
                    <input  placeholder="Rating" type="text" value={rating} onChange={(e) => handleInputRating(e.target.value)}
                            className="border-gray-400 border-2 rounded text-gray-600 pl-2" name="rating" />
                    <label htmlFor="license" className="mr-2 text-white">{contents.addAgent[7].text}</label>
                    {/*{License number: }*/}
                    <input  placeholder="License number" type="text" value={license} onChange={(e) => handleInputLicense(e.target.value)}
                            className="border-gray-400 border-2 rounded text-gray-600 pl-2" name="license" />
                    <label htmlFor="phone" className="mr-2 text-white">{contents.addAgent[8].text}</label>
                    {/*{Phone number: }*/}
                    <input  placeholder="Phone" type="text" value={phone} onChange={(e) => handleInputPhone(e.target.value)}
                            className="border-gray-400 border-2 rounded text-gray-600 pl-2" name="phone" />
                    <div>
                        {<button onClick={handleAddOrSaveAgent}
                                 className={isEditMode ? "text-white bg-yellow-600 mt-3 mx-16 mb-4" : "mt-3 mx-16 mb-4 text-gray-600"}
                        >{isEditMode ? contents.addAgent[9].text : contents.addAgent[10].text}
                        </button>}  {/*{"Save Changes" : "Add Agent"}*/}
                        {isEditMode && <button onClick={handleDeleteAgentData} className="bg-red-500 text-white">{contents.addAgent[11].text}</button>}
                        {/*{Delete agent}*/}
                    </div>
                </div>
            </div>
        </div>
    )
};
export default AddAgent;