// src/components/ImageCarousel.tsx
import React, { useState } from "react";
import "../css/ImageCarousel.css";
import { getImage } from "../services/apiService";
import { Modal } from "react-bootstrap";

interface ImageCarouselProps {
  images: string[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const handlePrev = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="carousel slide">
      <div className="carousel-indicators">
        {images.map((image, index) => (
          <button
            key={index}
            type="button"
            data-bs-target="#carouselExampleIndicators"
            className={`${
              index === activeIndex ? "active" : ""
            } border border-2 border-dark`}
            onClick={() => {
              setActiveIndex(index);
            }}
          ></button>
        ))}
      </div>
      <div className="carousel-inner">
        {images.map((image, index) => (
          <div
            key={index}
            className={`carousel-item ${index === activeIndex ? "active" : ""}`}
            onClick={() => {
              setShowModal(true);
            }}
          >
            <img
              src={getImage(image)}
              className="d-block w-100 carousel-img"
              alt={`Imagen ${index + 1}`}
            />
          </div>
        ))}
      </div>

      <button
        className="carousel-control-prev"
        type="button"
        onClick={handlePrev}
      >
        <span
          className="carousel-control-prev-icon bg-dark"
          aria-hidden="true"
        ></span>
        <span className="visually-hidden">Previous</span>
      </button>

      <button
        className="carousel-control-next"
        type="button"
        onClick={handleNext}
      >
        <span className="carousel-control-next-icon bg-dark"></span>
        <span className="visually-hidden">Next</span>
      </button>
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
        }}
        centered
        dialogClassName="modal-dialog-custom"
      >
        <Modal.Body className="d-flex justify-content-center align-items-center">
          <img
            src={getImage(images[activeIndex])}
            style={{
              maxWidth: "80vw", // Ancho máximo de la imagen
              maxHeight: "80vh", // Alto máximo de la imagen
              objectFit: "contain", // Escala la imagen y recorta si es necesario
            }} // Ajusta el tamaño
            alt={`Imagen ${activeIndex + 1}`}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ImageCarousel;
