// src/components/ImageCarousel.tsx
import React, { useState } from "react";
import "../css/ImageCarousel.css";

interface ImageCarouselProps {
  imagenes: string[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ imagenes }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? imagenes.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === imagenes.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="carousel-container mb-4">
      <div className="carousel slide">
        <div className="carousel-inner">
          {imagenes.map((imagen, index) => (
            <div
              key={index}
              className={`carousel-item ${
                index === activeIndex ? "active" : ""
              }`}
            >
              <img
                src={imagen}
                className="d-block w-100 carousel-img"
                alt={`Imagen ${index + 1}`}
              />
            </div>
          ))}
        </div>

        <button
          className="carousel-control-prev custom-control"
          type="button"
          onClick={handlePrev}
        >
          <span
            className="carousel-control-prev-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Previous</span>
        </button>

        <button
          className="carousel-control-next custom-control"
          type="button"
          onClick={handleNext}
        >
          <span
            className="carousel-control-next-icon"
            aria-hidden="true"
          ></span>
          <span className="visually-hidden">Next</span>
        </button>

        {/* Indicadores */}
        <div className="carousel-indicators">
          {imagenes.map((_, index) => (
            <button
              key={index}
              className={`indicator ${
                index === activeIndex ? "active-indicator" : ""
              }`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Slide ${index + 1}`}
            ></button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
