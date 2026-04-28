import { useEffect, useState } from 'react';
import axios from 'axios';
import VideoUploader from "./VideoUploader";

const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;

interface AdVideo {
    _id: string;
    adsString: string;
    videoUrl: string[];  // Array ??
    publicId: string;
    dateUpload: string;
    ownerName: string;
}

const AdvertisingVideoService = () => {
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
    }, []);

    const fetchAds = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/videos`);
            setAds(res.data);
            // Initialize changeableAdsStrings with empty strings for each ad
            const initial: Record<string, string> = {};
            res.data.forEach((ad: AdVideo) => { initial[ad._id] = ''; });
            setChangeableAdsStrings(initial);
        } catch (err) {
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
            setSuccess('The video was uploaded successfully.');
            setAdsString('');
            setVideoUrl('');
            setPublicId('');
            setOwnerName('');
            await fetchAds();
        } catch (err) {
            console.error('Error saving ad:', err);
            setMessage('Failed to save the ad. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const deleteVideoFromCloudinary = async (url: string): Promise<void> => {
        if (!url) return;

        const uploadIndex = url.indexOf('/upload/');
        if (uploadIndex === -1) throw new Error('Invalid Cloudinary URL format');

        const afterUpload = url.substring(uploadIndex + '/upload/'.length);
        // Remove the version (v1234567890/) if it exists
        const withoutVersion = afterUpload.replace(/^v\d+\//, '');
        // Removing the file extension
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
            setMessage(`Success: ${response.data.message}`);
            await fetchAds();

        } catch (error: any) {
            setMessage(`Failed to delete ad: ${error.response?.data?.error || error.message}`);
            console.error('Error deleting ad:', error);
        }
    };

    const makeFeatured = async (adId: string) => {
        try {
            await axios.post(`${API_URL}/api/videos/set-featured`, { adId });
            setMessage('The ad is now posted on the Home page!');
            await fetchAds();
        } catch (error: any) {
            setMessage(`Failed to set featured: ${error.response?.data?.error || error.message}`);
        }
    };

    const makeChangesAdsString = async (adId: string) => {
        const modifiedString = changeableAdsStrings[adId];
        if (!modifiedString?.trim()) {
            setMessage('Please enter a new ad description before saving.');
            return;
        }
        try {
            await axios.post(`${API_URL}/api/videos/modified-string`, { adId, modifiedString });
            setMessage('Ad description updated successfully!');
            setChangeableAdsStrings(prev => ({ ...prev, [adId]: '' }));
            await fetchAds();
        } catch (error: any) {
            setMessage(`Failed to update: ${error.response?.data?.error || error.message}`);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 border rounded">

            {/* Upload section */}
            <div className="border-2 p-4 mt-16">
                <h2 className="text-xl font-bold mb-4">Advertising Video Manager</h2>

                <input
                    type="text"
                    placeholder="Enter ad description"
                    value={adsString}
                    onChange={(e) => setAdsString(e.target.value)}
                    className="w-full p-2 border mb-4 rounded"
                />
                <input
                    type="text"
                    placeholder="Enter owner's name"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full p-2 border mb-4 rounded"
                />

                <VideoUploader
                    onUploadComplete={(url: string, id: string) => {
                        setVideoUrl(url);
                        setPublicId(id);
                    }}
                />

                {/* Preview the uploaded video before saving */}
                {videoUrl && (
                    <div className="mt-2 mb-2">
                        <p className="text-sm text-green-600 mb-1">Video ready to save:</p>
                        <video src={videoUrl} controls muted className="w-full rounded" style={{ maxHeight: '200px' }} />
                    </div>
                )}

                <button
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                    onClick={handleSave}
                    disabled={loading || !videoUrl || !adsString || !ownerName}
                >
                    {loading ? 'Saving...' : 'Save'}
                </button>

                {success && <p className="text-green-700 mt-2">{success}</p>}
                {message && (
                    <p className={`mt-2 text-sm ${message.startsWith('Success') ? 'text-green-600' : 'text-red-600'}`}>
                        {message}
                    </p>
                )}
            </div>

            {/* Saved videos list */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Saved Videos</h3>
                {ads.length === 0 ? (
                    <p className="text-gray-500">No videos saved yet.</p>
                ) : (
                    ads.map((ad) => (
                        <div key={ad._id} className="mb-6 border p-4 rounded shadow-sm">

                            <p className="mb-2 font-medium">{ad.adsString}</p>
                            <p className="text-xs text-gray-400 mb-3">Owner: {ad.ownerName}</p>

                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    placeholder={`Edit: "${ad.adsString}"`}
                                    value={changeableAdsStrings[ad._id] ?? ''}
                                    onChange={(e) =>
                                        setChangeableAdsStrings(prev => ({
                                            ...prev,
                                            [ad._id]: e.target.value
                                        }))
                                    }
                                    className="flex-1 p-2 border rounded text-sm"
                                />
                                <button
                                    onClick={() => makeChangesAdsString(ad._id)}
                                    disabled={!changeableAdsStrings[ad._id]?.trim()}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 disabled:opacity-40 text-sm"
                                >
                                    Save changes
                                </button>
                            </div>

                            <button
                                onClick={() => makeFeatured(ad._id)}
                                className="mb-3 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 text-sm"
                            >
                                Display on Home page
                            </button>

                            {/* securely access videoUrl as an array */}
                            <video
                                src={Array.isArray(ad.videoUrl) ? ad.videoUrl[0] : ad.videoUrl}
                                controls
                                autoPlay
                                muted
                                className="w-full mb-3 rounded"
                            />

                            <button
                                onClick={() => handleDelete(ad)}
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdvertisingVideoService;


// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import VideoUploader from "./VideoUploader";
// const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
// const UPLOAD_PRESET_NAME = import.meta.env.VITE_UPLOAD_PRESET_NAME;
// const PRESET_VALUE = import.meta.env.VITE_PRESET_VALUE;
//
// interface AdVideo {
//     _id: string;
//     adsString: string;
//     videoUrl: string;
//     publicId: string;
//     dateUpload: string;
//     ownerName: string;
// };
//
// const AdvertisingVideoService = () => {
//     const [message, setMessage] = useState('');
//     const [success, setSuccess] = useState('');
//     const [adsString, setAdsString] = useState('');
//     const [changeableAdsString, setChangeableAdsString] = useState('')
//     const [ownerName, setOwnerName] = useState('')
//     const [videoUrl, setVideoUrl] = useState('');
//     const [publicId, setPublicId] = useState('');
//     const [ads, setAds] = useState<AdVideo[]>([]);
//     const [loading, setLoading] = useState(false);
//     const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
//
//     // Загрузка существующих видео из базы
//     useEffect(() => {
//         fetchAds();
//     }, [message]);
//
//     const fetchAds = async () => {
//         try {
//             //const res = await axios.get('http://localhost:5000/api/ads');
//             const res = await axios.get(`${API_URL}/api/ads`);
//             setAds(res.data);
//         } catch (err) {
//             console.error('Failed to fetch ads');
//         }
//     };
//
//     const handleSave = async () => {
//         if (!adsString || !videoUrl || !ownerName ) return;
//         setLoading(true);
//
//         try {
//             await axios.post(`${API_URL}/api/ads`, {
//                     adsString,
//                     videoUrl,
//                     publicId,
//                     ownerName
//                 },
//                 {
//                     withCredentials: true,
//                     headers: {'Content-Type': 'application/json'}
//                 });
//             setSuccess("The video was uploaded successfully.");
//             setAdsString('');
//             setVideoUrl('');
//             setPublicId('');
//             setOwnerName('');
//             fetchAds();
//         } catch (err) {
//             console.error('Error saving ad:', err);
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     const deleteVideoFromCloudinary = async (url: string) => {
//         try {
//             if (!url) return;
//
//             const urlParts = url.split('/');
//             const publicIdWithExtension = urlParts[urlParts.length - 1];
//             const publicId = publicIdWithExtension.split('.')[0];
//
//             const timestamp = Math.floor(Date.now() / 1000);
//
//             // Получаем подпись с сервера
//             //const { data: signatureData } = await axios.post(`${API_URL}/generate-signature-to-delete-video`, {
//             const { data: signatureData } = await axios.post("http://localhost:5000/generate-signature-video", {
//                 public_id: publicId,
//                 timestamp,
//             });
//
//             // Отправляем запрос на удаление видео
//             const response = await axios.post(
//                 `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/destroy`,
//                 {
//                     public_id: publicId,
//                     api_key: signatureData.api_key,
//                     timestamp: signatureData.timestamp,
//                     signature: signatureData.signature,
//                 }
//             );
//
//             return response.data;
//         } catch (error) {
//             console.error('Cloudinary delete error:', error);
//             throw error;
//         }
//     };
//
//     const handleDelete = async (ad: AdVideo) => {
//         try {
//             //await axios.post('http://localhost:5000/api/ads/delete-video', { publicId: ad.publicId });
//             await deleteVideoFromCloudinary(ad.videoUrl[0]);
//
//             // 2. Удаление записи из MongoBD
//             const response = await axios.delete(`${API_URL}/api/ads/${ad.publicId}`);
//
//             setMessage(`Success: ${response.data.message}`);
//             fetchAds();
//         } catch (error: any) {
//             setMessage(`Failed to delete ad: ${error.response?.data?.error || error.message}`);
//             console.error('Error deleting ad:', error);
//         }
//     };
//
//     const makeFeatured = async (adId: string) => {
//         await axios.post(`${API_URL}/api/ads/set-featured`, { adId });
//         alert("The ad is now posted!");
//     };
//
//     const makeChangesAdsString = async (adId: string, modifiedString: string) => {
//         await axios.post(`${API_URL}/api/ads/modified-string`, { adId, modifiedString });
//         alert("Ad is now modified!");
//     };
//
//     return (
//         <div className="max-w-2xl mx-auto p-6 border rounded">
//             {/* Page*/}
//             <div className="border-2 p-4 mt-16">
//                 <h2 className="text-xl font-bold mb-4">Advertising Video Manager</h2>
//
//                 {/* Описание рекламы */}
//                 <input
//                     type="text"
//                     placeholder="Enter ad description"
//                     value={adsString}
//                     onChange={(e) => setAdsString(e.target.value)}
//                     className="w-full p-2 border mb-4 rounded"
//                 />
//                 {/* Описание рекламы */}
//                 <input
//                     type="text"
//                     placeholder="Enter owner's name"
//                     value={ownerName}
//                     onChange={(e) => setOwnerName(e.target.value)}
//                     className="w-full p-2 border mb-4 rounded"
//                 />
//                 {/* Загрузка видео */}
//                 <VideoUploader
//                     onUploadComplete={(url: string, publicId: string) => {
//                         setVideoUrl(url);
//                         setPublicId(publicId);
//                     }}
//                 />
//
//                 {/* Сохранение */}
//                 <button
//                     className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
//                     onClick={handleSave}
//                     disabled={loading || !videoUrl || !adsString || !ownerName }
//                 >
//                     {loading ? 'Saving...' : 'Save'}
//                 </button>
//                 {success && <p className="text-green-700 mt-2" >{success}</p>}
//             </div>
//
//
//             {/* Список видео */}
//             <div className="mt-6">
//                 <h3 className="text-lg font-semibold mb-2">Saved Videos</h3>
//                 {ads.length === 0 ? (
//                     <p className="text-gray-500">No videos saved yet.</p>
//                 ) : (
//                     ads.map((ad) => (
//                         <div key={ad._id} className="mb-4 border p-3 rounded">
//                             <p className="mb-2">{ad.adsString}</p>
//                             {/*{/ad.publicId}*/}
//                             <div>
//                                 <input type="text"
//                                        placeholder={ad.adsString}
//                                        value={changeableAdsString}
//                                        onChange={(e) => setChangeableAdsString(e.target.value)}
//                                        className="w-[70%] p-2 border mb-4 rounded mr-4"
//                                 />
//                                 <button onClick={()=> makeChangesAdsString(ad._id, changeableAdsString)} >Confirm changes</button>
//                             </div>
//
//                             <button onClick={() => makeFeatured(ad._id)} >Select and display on Home page</button>
//                             <video src={ad.videoUrl[0]} controls autoPlay muted className="w-full mb-2" />
//                             <button
//                                 onClick={() => handleDelete(ad)}
//                                 className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
//                             >
//                                 Delete
//                             </button>
//                         </div>
//                     ))
//                 )}
//             </div>
//         </div>
//     )
// }
// export default AdvertisingVideoService;