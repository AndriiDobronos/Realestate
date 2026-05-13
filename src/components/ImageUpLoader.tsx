import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import allEnTexts from '../contents/allEnTexts';
import allUaTexts from '../contents/allUaTexts';
import {useLanguage} from "../context/LanguageContext";

interface ImageUploaderProps {
    index: number;
    onUploadComplete: (index: number, url: string) => void;
    onDelete?: (index: number) => void;
    initialUrl?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({index, onUploadComplete, onDelete, initialUrl}) => {
    const { language } = useLanguage();
    const contents = language === "en" ? allEnTexts : allUaTexts
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(initialUrl || null);
    const [error, setError] = useState('');
    const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
    const UPLOAD_PRESET_NAME = import.meta.env.VITE_UPLOAD_PRESET_NAME;
    const PRESET_VALUE = import.meta.env.VITE_PRESET_VALUE;

    // Добавляем обработчик клика
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await handleFileUpload(file);
            e.target.value = ''; // Сбрасываем значение input
        }
    };

    const uploadImageToCloudinary = async (file: File) => {
        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append(`${UPLOAD_PRESET_NAME}`, `${PRESET_VALUE}`);

        try {
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
                formData
            );

            setImageUrl(response.data.secure_url);
            onUploadComplete(index, response.data.secure_url);

        } catch (err) {
            setError('Failed to upload image');
            onUploadComplete(index, '');
        } finally {
            setUploading(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }
        uploadImageToCloudinary(file);
    };

    const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];

        if (!file?.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }
        uploadImageToCloudinary(file);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
    };

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();
        setImageUrl(null);
        onUploadComplete(index, '');
        onDelete?.(index);
    };

    // Добавляем эффект для синхронизации с initialUrl
    useEffect(() => {
        setImageUrl(initialUrl || null);
    }, [initialUrl]);

    return (
        <div className="image-uploader-container" onClick={handleClick} >
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileInput}
                accept="image/*"
            />
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={`upload-area ${imageUrl ? 'has-image' : ''}`}
            >
                {uploading ? (
                    <div className="loader" style={style.loader}>Uploading...</div>
                ) : imageUrl ? (
                    <div className="image-preview">
                        <img
                            src={imageUrl}
                            alt="Uploaded"
                            className="preview-image"
                        />
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="delete-button"
                        >
                            ×
                        </button>
                    </div>
                ) : (
                    <div className="upload-prompt">
                        <p>{contents.imageUploader[0].text}</p>
                        {/*{Drag & drop image}*/}
                        <p>{contents.imageUploader[1].text}</p>
                        {/*{or click to browse}*/}
                    </div>
                )}
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default ImageUploader;

const style: { [key: string]: React.CSSProperties } = {
    loader: {
        width: 'fit-content',
        fontWeight: 'bold',
        fontFamily: 'sans-serif',
        fontSize: '24px',
        color: 'black',
        margin: '0 auto 0 auto',
        background: 'repeating-linear-gradient(90deg,currentColor 0 8%,#0000 0 10%) 200% 100%/200% 3px no-repeat',
        animation: 'l3 2s steps(6) infinite',
    }
}

const styleSheet = document.styleSheets[0]; // Получаем первый стиль на странице
styleSheet.insertRule(`
  @keyframes l3 {
    to {
      background-position: 80% 100%;
    }
  }
`, styleSheet.cssRules.length);

const styles = `
    .image-uploader-container {
        transition: all 0.3s ease;
        /* margin: 0 0 1rem 1rem; */
        position: relative;       
    }

    .upload-area {
        border: 3px dashed #ccc;
        border-radius: 8px;
        padding: 1rem;
        /* min-height: 100px; */ 
        width: 180px;  /* Фиксированная ширина */
        height: 160px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: border-color 0.3s;
        box-sizing: border-box;
        color: #444;
        @media(max-width: 426px) {
            width: 150px;
        }
    }
    
    .upload-area.has-image {
    border-color: #4CAF50;
    background: #f8fff8;
    }

    .upload-area:hover {
        border-color: #666;
        color: #000;
    }

    .has-image {
        border-color: #4CAF50;
        padding: 0;
    }
  
    .image-preview {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 6px;
        background-color: #ccc;
    }
    
    .preview-image {
       object-fit: cover;
       max-height: 180px;
    }

    .delete-button {
        position: absolute;
        top: -10px;
        right: -10px;
        background: #ff4444;
        color: white;
        border: none;
        border-radius: 50%;
        transition: opacity 0.3s ease;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 14px;
        line-height: 0.2;
        opacity: 0;
    }
    
    .upload-area:hover .delete-button {
        opacity: 1;
    }

    .loader {
        color: #666;
        font-size: 0.9rem;
    }

    .error-message {
        color: #ff4444;
        margin-top: 0.5rem;
        font-size: 0.8rem;
    }
`;

const styleTag = document.createElement('style');
styleTag.innerHTML = styles;
document.head.appendChild(styleTag);