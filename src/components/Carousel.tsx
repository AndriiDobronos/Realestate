import React, { useState } from 'react';
import './Carousel.css';

interface CarouselProps {
    images: string[];
}

const Carousel: React.FC<CarouselProps> = ({images}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        const isLastSlide = currentIndex === images.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    return (
        <div className="carousel-container">
            <div className="carousel">
                <button className="arrow left-arrow" onClick={goToPrevious}>
                    ❮
                </button>

                <div className="carousel-slide flex justify-center">
                    <img src={images[currentIndex]} alt={`Slide ${currentIndex}`} />
                </div>

                <button className="arrow right-arrow" onClick={goToNext}>
                    ❯
                </button>
            </div>

            <div className="indicators">
                {images.map((_, index) => (
                    <div
                        key={index}
                        className={`indicator ${index === currentIndex ? 'active' : ''}`}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default Carousel;
