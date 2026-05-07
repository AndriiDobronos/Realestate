import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from 'react-router-dom';
import ImageUpLoader from "../components/ImageUpLoader";
import { removeImage } from "../features/upLoadImages/upLoadImagesSlice";
import { useDispatch } from 'react-redux';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import { useLanguage } from "../context/LanguageContext";

const AddAgent = () => {
    const { language } = useLanguage();
    const c = language === "en" ? allEnTexts : allUaTexts;
    const a = c.addAgent;
    const { agentId } = useParams<{ agentId?: string }>();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [uploadedImages, setUploadedImages] = useState<(string | null)[]>([null]);
    const [message, setMessage] = useState<string | null>(null);
    const [actionSuccess, setActionSuccess] = useState(false);
    const [name, setName] = useState("");
    const [jobTitle, setJobTitle] = useState("");
    const [email, setEmail] = useState("");
    const [saleVolume, setSaleVolume] = useState("");
    const [totalDeal, setTotalDeal] = useState("");
    const [rating, setRating] = useState("");
    const [license, setLicense] = useState("");
    const [phone, setPhone] = useState("");

    const isEditMode = !!agentId && agentId !== "new";
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;

    useEffect(() => {
        if (!isEditMode) return;
        const fetchAgentData = async () => {
            try {
                const response = await fetch(`${API_URL}/api/agents/${agentId}`);
                const data = await response.json();
                const ag = data[0];
                setUploadedImages(ag.image.filter((img: string) => img !== null));
                setName(ag.name);
                setJobTitle(ag.jobTitle);
                setEmail(ag.email);
                setSaleVolume(ag.saleVolume);
                setTotalDeal(ag.totalDeal);
                setRating(ag.rating);
                setLicense(ag.license);
                setPhone(ag.phone);
            } catch (error) {
                console.error('Error fetching agent data:', error);
            }
        };
        fetchAgentData();
    }, [isEditMode, agentId]);

    const handleImageUpload = (index: number, url: string) => {
        setUploadedImages(prev => {
            const next = [...prev];
            next[index] = url;
            return next;
        });
    };

    const deleteFromCloudinary = async (url: string) => {
        const publicId = url.split('/').pop()!.split('.')[0];
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
    };

    const handleImageDeleteUploading = async (index: number) => {
        const url = uploadedImages[index];
        if (!url || actionSuccess) return;
        try {
            await deleteFromCloudinary(url);
            setUploadedImages(prev => { const n = [...prev]; n[index] = null; return n; });
            dispatch(removeImage(index));
            setMessage(a[25].text);
        } catch (error) {
            setMessage(`${a[26].text}${error}`);
        }
    };

    const handleDeleteUploadingImage = async () => {
        const url = uploadedImages[0];
        if (!url) return;
        try {
            await deleteFromCloudinary(url);
            setUploadedImages([null]);
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    };

    const handleDeleteAgentData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/agents/${agentId}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
            if (!response.ok) throw new Error(await response.text());
            await handleDeleteUploadingImage();
            await response.json();
            setName(''); setEmail(''); setPhone(''); setLicense('');
            setJobTitle(''); setSaleVolume(''); setTotalDeal(''); setRating('');
        } catch (error: any) {
            setMessage(`${a[29].text}${error}`);
            setActionSuccess(false);
        }
    };

    const handleAddOrSaveAgent = async () => {
        const commonData = {
            image: `${uploadedImages}`,
            name, jobTitle, email, saleVolume, totalDeal, rating, license, phone,
            date: Date.now().toString(),
        };
        try {
            if (isEditMode) {
                await axios.put(`${API_URL}/api/agents/${agentId}`, commonData, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' },
                });
                setMessage(a[22].text);
                setActionSuccess(true);
            } else if (
                agentId === "new" && name.length > 2 &&
                uploadedImages[0]?.includes('https://') &&
                jobTitle && email.includes('@') &&
                saleVolume && totalDeal && rating && license && phone
            ) {
                await fetch(`${API_URL}/agents`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(commonData),
                });
                setMessage(a[23].text);
                setActionSuccess(true);
                localStorage.removeItem('agentImages');
                setUploadedImages([null]);
                setName(''); setEmail(''); setPhone(''); setLicense('');
                setJobTitle(''); setSaleVolume(''); setTotalDeal(''); setRating('');
            } else {
                setMessage(a[24].text);
                setActionSuccess(false);
            }
        } catch (error: any) {
            const prefix = isEditMode ? a[27].text : a[28].text;
            setMessage(`${prefix}${error.response?.data?.message || error.message}`);
            setActionSuccess(false);
        }
    };

    const inputCls = "w-full rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-400 transition-colors";
    const labelCls = "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

    return (
        <div className="mx-auto bg-gray-200 pt-20 xl:px-6 px-3 pb-10 min-h-screen">
            <div className="mx-auto max-w-2xl bg-white rounded-2xl shadow-md p-6 flex flex-col gap-5">

                {/* ── Header ──────────────────────────────────── */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">
                        {isEditMode ? a[9].text : a[10].text}
                    </h2>
                    {isEditMode && (
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-yellow-50 text-yellow-700">
                            {a[13].text}
                        </span>
                    )}
                </div>
                <hr className="border-gray-100" />

                {/* ── Photo ────────────────────────────────────── */}
                <div className="flex items-center gap-5">
                    <div>
                        <p className={labelCls}>{a[0].text}</p>
                        <ImageUpLoader
                            key={0}
                            index={0}
                            onUploadComplete={handleImageUpload}
                            onDelete={handleImageDeleteUploading}
                            initialUrl={uploadedImages[0]}
                        />
                    </div>
                    {message && (
                        <p className={`text-sm font-semibold ${actionSuccess ? 'text-green-600' : 'text-red-500'}`}>
                            {message}
                        </p>
                    )}
                </div>

                {/* ── Fields ───────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className={labelCls}>{a[1].text}</label>
                        <input className={inputCls} type="text" placeholder={a[14].text}
                            value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="flex flex-col">
                        <label className={labelCls}>{a[2].text}</label>
                        <input className={inputCls} type="text" placeholder={a[15].text}
                            value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
                    </div>
                    <div className="flex flex-col sm:col-span-2">
                        <label className={labelCls}>{a[3].text}</label>
                        <input className={inputCls} type="email" placeholder={a[16].text}
                            value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="flex flex-col">
                        <label className={labelCls}>{a[4].text}</label>
                        <input className={inputCls} type="text" placeholder={a[17].text}
                            value={saleVolume} onChange={e => setSaleVolume(e.target.value)} />
                    </div>
                    <div className="flex flex-col">
                        <label className={labelCls}>{a[5].text}</label>
                        <input className={inputCls} type="text" placeholder={a[18].text}
                            value={totalDeal} onChange={e => setTotalDeal(e.target.value)} />
                    </div>
                    <div className="flex flex-col">
                        <label className={labelCls}>{a[6].text}</label>
                        <input className={inputCls} type="text" placeholder={a[19].text}
                            value={rating} onChange={e => setRating(e.target.value)} />
                    </div>
                    <div className="flex flex-col">
                        <label className={labelCls}>{a[7].text}</label>
                        <input className={inputCls} type="text" placeholder={a[20].text}
                            value={license} onChange={e => setLicense(e.target.value)} />
                    </div>
                    <div className="flex flex-col sm:col-span-2">
                        <label className={labelCls}>{a[8].text}</label>
                        <input className={inputCls} type="text" placeholder={a[21].text}
                            value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                </div>

                {/* ── Actions ──────────────────────────────────── */}
                <div className="flex flex-wrap gap-3 pt-1">
                    <button
                        onClick={handleAddOrSaveAgent}
                        className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors duration-200 ${
                            isEditMode
                                ? 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700'
                                : 'bg-green-500 hover:bg-green-600 active:bg-green-700'
                        }`}
                    >
                        {isEditMode ? a[9].text : a[10].text}
                    </button>

                    {isEditMode && (
                        <button
                            onClick={handleDeleteAgentData}
                            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-semibold transition-colors duration-200"
                        >
                            {a[11].text}
                        </button>
                    )}

                    {actionSuccess && (
                        <button
                            onClick={() => navigate('/agents')}
                            className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-semibold transition-colors duration-200"
                        >
                            {a[12].text}
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AddAgent;
