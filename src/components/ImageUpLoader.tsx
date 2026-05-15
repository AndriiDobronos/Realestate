import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import { useLanguage } from "../context/LanguageContext";

interface ImageUploaderProps {
    index: number;
    onUploadComplete: (index: number, url: string) => void;
    onDelete?: (index: number) => void;
    initialUrl?: string;
}

const CLOUD_NAME        = import.meta.env.VITE_CLOUD_NAME;
const UPLOAD_PRESET_NAME = import.meta.env.VITE_UPLOAD_PRESET_NAME;
const PRESET_VALUE      = import.meta.env.VITE_PRESET_VALUE;

const ImageUploader: React.FC<ImageUploaderProps> = ({ index, onUploadComplete, onDelete, initialUrl }) => {
    const { language } = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts;

    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl]   = useState<string | null>(initialUrl || null);
    const [error, setError]         = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setImageUrl(initialUrl || null);
    }, [initialUrl]);

    const upload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }
        setUploading(true);
        setError('');
        const formData = new FormData();
        formData.append('file', file);
        formData.append(UPLOAD_PRESET_NAME, PRESET_VALUE);
        try {
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                formData
            );
            setImageUrl(response.data.secure_url);
            onUploadComplete(index, response.data.secure_url);
        } catch {
            setError('Failed to upload image');
            onUploadComplete(index, '');
        } finally {
            setUploading(false);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            upload(file);
            e.target.value = '';
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) upload(file);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setImageUrl(null);
        onUploadComplete(index, '');
        onDelete?.(index);
    };

    return (
        <div
            className="relative transition-all duration-300 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileInput}
                accept="image/*"
            />
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className={[
                    'w-full h-40',
                    'flex items-center justify-center',
                    'border-[3px] border-dashed rounded-lg',
                    'transition-colors duration-300',
                    imageUrl
                        ? 'border-[#4CAF50] bg-[#f8fff8] p-0'
                        : 'border-[#ccc] text-[#444] p-4 hover:border-[#666] hover:text-black',
                ].join(' ')}
            >
                {uploading ? (
                    <div className="flex items-center justify-center w-full h-full">
                        <div className="w-9 h-9 rounded-full border-[3px] border-blue-600/15 border-t-blue-600 animate-spin" />
                    </div>
                ) : imageUrl ? (
                    <div className="relative flex justify-center items-center w-full h-full bg-[#ccc] rounded-md">
                        <img
                            src={imageUrl}
                            alt="Uploaded"
                            className="w-full h-full object-cover rounded-md"
                        />
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="absolute top-0 right-0 w-11 h-11 flex items-center justify-center !bg-red-600/80 hover:!bg-red-700 !shadow-none !border-0 rounded-tr-md rounded-bl-lg text-white text-lg leading-none transition-colors duration-200 backdrop-blur-[2px]"
                        >
                            ×
                        </button>
                    </div>
                ) : (
                    <div className="text-center text-sm">
                        <div className="hidden sm:flex flex-col items-center gap-0.5">
                            <p>{contents.imageUploader[0].text}</p>
                            <p>{contents.imageUploader[1].text}</p>
                        </div>
                        <div className="flex sm:hidden">
                            <p>{contents.imageUploader[2].text}</p>
                        </div>
                    </div>
                )}
                {error && <p className="text-red-500 mt-2 text-xs">{error}</p>}
            </div>
        </div>
    );
};

export default ImageUploader;
