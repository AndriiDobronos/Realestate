import { useEffect, useState } from 'react';
import axios from 'axios';
import VideoUploader from "./VideoUploader";
import { useLanguage } from '../context/LanguageContext';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';

const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;

interface AdVideo {
    _id: string;
    adsString: string;
    videoUrl: string[];
    publicId: string;
    dateUpload: string;
    ownerName: string;
}

const AdvertisingVideoService = () => {
    const { language } = useLanguage();
    const t = (language === 'en' ? allEnTexts : allUaTexts).advertisingVideo;
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState('');
    const [adsString, setAdsString] = useState('');
    const [changeableAdsStrings, setChangeableAdsStrings] = useState<Record<string, string>>({});
    const [ownerName, setOwnerName] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [publicId, setPublicId] = useState('');
    const [ads, setAds] = useState<AdVideo[]>([]);
    const [loading, setLoading] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        fetchAds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAds = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/videos`);
            setAds(res.data);
            const initial: Record<string, string> = {};
            res.data.forEach((ad: AdVideo) => { initial[ad._id] = ''; });
            setChangeableAdsStrings(initial);
        } catch {
            console.error('Failed to fetch ads');
        }
    };

    const handleSave = async () => {
        if (!adsString || !videoUrl || !ownerName) return;
        setLoading(true);
        setSuccess('');
        setMessage('');
        try {
            await axios.post(
                `${API_URL}/api/videos`,
                { adsString, videoUrl, publicId, ownerName },
                { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
            );
            setSuccess(t.successUpload);
            setAdsString('');
            setVideoUrl('');
            setPublicId('');
            setOwnerName('');
            await fetchAds();
        } catch (err) {
            console.error('Error saving ad:', err);
            setMessage(t.failedSave);
        } finally {
            setLoading(false);
        }
    };

    const deleteVideoFromCloudinary = async (url: string): Promise<void> => {
        if (!url) return;
        const uploadIndex = url.indexOf('/upload/');
        if (uploadIndex === -1) throw new Error('Invalid Cloudinary URL format');
        const afterUpload = url.substring(uploadIndex + '/upload/'.length);
        const withoutVersion = afterUpload.replace(/^v\d+\//, '');
        const extractedPublicId = withoutVersion.replace(/\.[^/.]+$/, '');
        const timestamp = Math.floor(Date.now() / 1000);
        const { data: signatureData } = await axios.post(
            `${API_URL}/generate-signature-to-delete-video`,
            { public_id: extractedPublicId, timestamp }
        );
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/destroy`,
            {
                public_id: extractedPublicId,
                api_key: signatureData.api_key,
                timestamp: signatureData.timestamp,
                signature: signatureData.signature,
            }
        );
        if (response.data?.result !== 'ok') {
            console.warn('Cloudinary delete result:', response.data?.result);
        }
    };

    const handleDelete = async (ad: AdVideo) => {
        setMessage('');
        try {
            const videoToDelete = Array.isArray(ad.videoUrl) ? ad.videoUrl[0] : ad.videoUrl;
            await deleteVideoFromCloudinary(videoToDelete);
            const response = await axios.delete(`${API_URL}/api/videos/${ad.publicId}`);
            setMessage(`${t.successPrefix} ${response.data.message}`);
            await fetchAds();
        } catch (error) {
            const msg = axios.isAxiosError(error)
                ? (error.response?.data?.error as string | undefined) ?? error.message
                : String(error);
            setMessage(`${t.failedDelete} ${msg}`);
        }
    };

    const makeFeatured = async (adId: string) => {
        try {
            await axios.post(`${API_URL}/api/videos/set-featured`, { adId });
            setMessage(t.successFeatured);
            await fetchAds();
        } catch (error) {
            const msg = axios.isAxiosError(error)
                ? (error.response?.data?.error as string | undefined) ?? error.message
                : String(error);
            setMessage(`${t.failedFeatured} ${msg}`);
        }
    };

    const makeChangesAdsString = async (adId: string) => {
        const modifiedString = changeableAdsStrings[adId];
        if (!modifiedString?.trim()) {
            setMessage(t.enterDescription);
            return;
        }
        try {
            await axios.post(`${API_URL}/api/videos/modified-string`, { adId, modifiedString });
            setMessage(t.successUpdated);
            setChangeableAdsStrings(prev => ({ ...prev, [adId]: '' }));
            await fetchAds();
        } catch (error) {
            const msg = axios.isAxiosError(error)
                ? (error.response?.data?.error as string | undefined) ?? error.message
                : String(error);
            setMessage(`${t.failedUpdate} ${msg}`);
        }
    };

    const isSuccess = (msg: string) => msg.toLowerCase().startsWith('success') || msg.toLowerCase().includes('successfully');

    const inputCls = "w-full rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-400 transition-colors";
    const labelCls = "text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
        <div className="mx-auto max-w-2xl flex flex-col gap-5 pt-20 pb-10 px-4">

            {/* ── Upload section ──────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
                <h2 className="text-xl font-bold text-gray-800">{t.title}</h2>
                <hr className="border-gray-100" />

                <div className="flex flex-col gap-1">
                    <label className={labelCls}>{t.labelDescription}</label>
                    <input
                        type="text"
                        placeholder={t.placeholderDescription}
                        value={adsString}
                        onChange={e => setAdsString(e.target.value)}
                        className={inputCls}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className={labelCls}>{t.labelOwner}</label>
                    <input
                        type="text"
                        placeholder={t.placeholderOwner}
                        value={ownerName}
                        onChange={e => setOwnerName(e.target.value)}
                        className={inputCls}
                    />
                </div>

                <VideoUploader
                    onUploadComplete={(url: string, id: string) => {
                        setVideoUrl(url);
                        setPublicId(id);
                    }}
                />

                {videoUrl && (
                    <div className="flex flex-col gap-1">
                        <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">{t.videoReady}</p>
                        <video src={videoUrl} controls muted className="w-full rounded-xl" style={{ maxHeight: '200px' }} />
                    </div>
                )}

                <button
                    onClick={handleSave}
                    disabled={loading || !videoUrl || !adsString || !ownerName}
                    className="w-full py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? t.saving : t.save}
                </button>

                {success && <p className="text-sm font-semibold text-green-600">{success}</p>}
                {message && !success && (
                    <p className={`text-sm font-semibold ${isSuccess(message) ? 'text-green-600' : 'text-red-500'}`}>
                        {message}
                    </p>
                )}
            </div>

            {/* ── Saved videos ─────────────────────────────────── */}
            <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold text-gray-700 px-1">{t.savedVideos}</h3>

                {ads.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md p-6 text-center text-gray-400 text-sm">
                        {t.noVideos}
                    </div>
                ) : (
                    ads.map(ad => (
                        <div key={ad._id} className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-3">

                            {/* header */}
                            <div>
                                <p className="font-semibold text-gray-800">{ad.adsString}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{t.ownerPrefix} {ad.ownerName}</p>
                            </div>
                            <hr className="border-gray-100" />

                            {/* edit description */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder={`${t.editPrefix} "${ad.adsString}"`}
                                    value={changeableAdsStrings[ad._id] ?? ''}
                                    onChange={e =>
                                        setChangeableAdsStrings(prev => ({ ...prev, [ad._id]: e.target.value }))
                                    }
                                    className="flex-1 rounded-xl bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-blue-400 transition-colors"
                                />
                                <button
                                    onClick={() => makeChangesAdsString(ad._id)}
                                    disabled={!changeableAdsStrings[ad._id]?.trim()}
                                    className="px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white text-sm font-semibold transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                    {t.saveChanges}
                                </button>
                            </div>

                            {/* video */}
                            <video
                                src={Array.isArray(ad.videoUrl) ? ad.videoUrl[0] : ad.videoUrl}
                                controls
                                autoPlay
                                muted
                                className="w-full rounded-xl"
                            />

                            {/* actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => makeFeatured(ad._id)}
                                    className="flex-1 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-sm font-semibold transition-colors duration-200"
                                >
                                    {t.displayOnHome}
                                </button>
                                <button
                                    onClick={() => handleDelete(ad)}
                                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-semibold transition-colors duration-200"
                                >
                                    {t.delete}
                                </button>
                            </div>

                            {message && (
                                <p className={`text-sm font-semibold ${isSuccess(message) ? 'text-green-600' : 'text-red-500'}`}>
                                    {message}
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>

        </div>
        </div>
    );
};

export default AdvertisingVideoService;
