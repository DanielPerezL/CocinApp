// src/components/RecipeDetails.tsx
import React, { useState } from "react";
import ImageCarousel from "./ImageCarousel";
import "../css/RecipeDetails.css";
import { RecipeDetailDTO, UserPublicDTO } from "../interfaces";
import userPicture from "../assets/user.png";
import { Link } from "react-router-dom";
import share from "../assets/share.png";
import { Button, Modal } from "react-bootstrap";

interface RecipeDetailsProps {
  recipe: RecipeDetailDTO;
  user: UserPublicDTO;
}

const RecipeDetails: React.FC<RecipeDetailsProps> = ({ recipe, user }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Función para copiar la URL al portapapeles
  const copyToClipboard = () => {
    const currentUrl = window.location.href; // Obtiene la URL actual de la página
    navigator.clipboard
      .writeText(currentUrl) // Copia la URL al portapapeles
      .then(() => {
        setCopySuccess(true); // Indica que se ha copiado con éxito
        setShowModal(true); // Muestra el modal
      })
      .catch((err) => {
        setCopySuccess(false); // Si hay un error, indica que no se ha copiado
        setShowModal(true); // Muestra el modal con error
      });
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setShowModal(false); // Cierra el modal
  };

  return (
    <div className="container">
      <div
        className="d-flex justify-content-between align-items-center mb-3"
        style={{ height: "4rem" }}
      >
        <div
          className="d-flex align-items-center flex-grow-1 me-3"
          style={{ maxWidth: "calc(100% - 5rem)", overflow: "hidden" }}
        >
          <img
            src={userPicture}
            alt="Perfil de usuario"
            className="rounded-circle me-3"
            style={{ width: "3rem", height: "3rem" }}
          />
          <p
            className="m-0"
            style={{
              fontSize: "1.25rem",
              fontWeight: "bold",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {user.nickname}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link
            to="/favorites"
            className="btn btn-link p-0 d-flex align-items-center justify-content-center"
            style={{ width: "2rem", height: "2rem" }}
            title="Favoritos"
            onClick={() => {
              window.scrollTo(0, 0);
            }}
          >
            <img className="img-fluid" src={userPicture} alt="Favoritos" />
          </Link>

          <button
            className="btn btn-link p-0 d-flex align-items-center justify-content-center"
            style={{ width: "2rem", height: "2rem" }}
            title="Copiar URL"
            onClick={copyToClipboard}
          >
            <img className="img-fluid" src={share} alt="Copiar URL" />{" "}
            {/* Reemplaza con tu icono */}
          </button>
        </div>
      </div>

      <h1 className="display-5 text-primary mb-4">{recipe.title}</h1>
      {/* Carrusel de imágenes */}
      <ImageCarousel
        images={
          Array.isArray(recipe.images)
            ? recipe.images
            : recipe.images.split(",")
        }
      />

      {/* Sección de ingredientes */}
      <div className="mb-4">
        <h3>Ingredientes</h3>
        <p className="receta-text">{recipe.ingredients}</p>
      </div>

      {/* Sección de procedimiento */}
      <div className="mb-4">
        <h3>Procedimiento</h3>
        <p className="receta-text">{recipe.procedure}</p>
      </div>

      <Modal show={showModal} onHide={closeModal} size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Compatir receta!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light">
          {copySuccess ? (
            <p>¡URL copiada con éxito!</p>
          ) : (
            <p>Error al copiar la URL.</p>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={closeModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RecipeDetails;
