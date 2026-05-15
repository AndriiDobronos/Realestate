import React, { useRef, useState } from 'react';
import axios from 'axios';

const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
const PRESET_VALUE = import.meta.env.VITE_PRESET_VALUE;

interface Props {
    onUploadComplete: (url: string, publicId: string) => void;
}

const VideoUploader: React.FC<Props> = ({ onUploadComplete }) => {
    const [isUploading, setIsUploading] = useState(false);   // идёт загрузка
    const [isUploadDone, setIsUploadDone] = useState(false); // загрузка завершена
    const [progress, setProgress] = useState(0);             // прогресс в %
    const [message, setMessage] = useState('');
    const dropRef = useRef<HTMLDivElement>(null);

    const uploadVideo = async (file: File): Promise<void> => {
        const MAX_SIZE_MB = 100;
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            setMessage(`File is too large. Maximum size is ${MAX_SIZE_MB} MB.`);
            return;
        }

        setIsUploading(true);
        setMessage('');
        setProgress(0);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', PRESET_VALUE);

        try {
            const res = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
                formData,
                {
                    // Tracking download progress is useful for large video files.
                    onUploadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percent = Math.round(
                                (progressEvent.loaded * 100) / progressEvent.total
                            );
                            setProgress(percent);
                        }
                    },
                }
            );

            const { secure_url, public_id } = res.data;
            onUploadComplete(secure_url, public_id);
            setIsUploadDone(true);
            setMessage('');
        } catch (error) {
            setIsUploadDone(false);
            if (axios.isAxiosError(error)) {
                const msg = (error.response?.data as { error?: { message?: string } } | undefined)?.error?.message;
                setMessage(msg ? `Upload error: ${msg}` : `Upload failed. ${error.message}`);
            } else {
                setMessage(`Upload failed. ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        } finally {
            setIsUploading(false);
            setProgress(0);
        }
    };

    const handleFileSelect = (file: File | undefined) => {
        if (!file) return;
        if (!file.type.startsWith('video/')) {
            setMessage('Please select a valid video file.');
            return;
        }
        uploadVideo(file);
    };

    // ─── Drag & Drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        dropRef.current?.classList.add('border-blue-500', 'bg-blue-50');
    };

    const handleDragLeave = () => {
        dropRef.current?.classList.remove('border-blue-500', 'bg-blue-50');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        dropRef.current?.classList.remove('border-blue-500', 'bg-blue-50');
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    // Reset component to reload
    const handleReset = () => {
        setIsUploadDone(false);
        setIsUploading(false);
        setMessage('');
        setProgress(0);
    };

    return (
        <div>
            {/* Drop zone */}
            <div
                ref={dropRef}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className="w-full h-32 border-2 border-dashed border-gray-400 rounded flex flex-col items-center justify-center text-gray-600 mb-2 transition cursor-pointer"
            >
                {isUploading ? (
                    <span className="text-blue-500">Uploading... {progress}%</span>
                ) : isUploadDone ? (
                    <span className="text-green-600">✅ Upload completed!</span>
                ) : (
                    <span>Drag & drop video here</span>
                )}
            </div>

            {/* Progress bar */}
            {isUploading && (
                <div className="w-full bg-gray-200 rounded h-2 mb-3">
                    <div
                        className="bg-blue-500 h-2 rounded transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {/* Error message */}
            {message && (
                <p className="text-red-500 text-sm mb-2">{message}</p>
            )}

            {/* Buttons: select file or reset */}
            {!isUploadDone && !isUploading && (
                <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    className="mb-4 text-sm"
                />
            )}

            {isUploadDone && (
                <button
                    type="button"
                    onClick={handleReset}
                    className="text-sm text-blue-500 underline mb-4"
                >
                    Upload a different video
                </button>
            )}
        </div>
    );
};

export default VideoUploader;