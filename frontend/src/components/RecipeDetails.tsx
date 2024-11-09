// src/components/RecipeDetails.tsx
import React, { useEffect, useState } from "react";
import ImageCarousel from "./ImageCarousel";
import "../css/RecipeDetails.css";
import { RecipeDetailDTO, UserPublicDTO } from "../interfaces";
import { Link } from "react-router-dom";
import { Button, Modal } from "react-bootstrap";
import share from "../assets/share.png";
import userDefaultPic from "../assets/user.png";
import redHeart from "../assets/red_heart.png";
import pngHeart from "../assets/heart.png";
import {
  addRecipeFav,
  getImage,
  isFavoriteRecipe,
  rmRecipeFav,
} from "../services/apiService";

interface RecipeDetailsProps {
  recipe: RecipeDetailDTO;
  user: UserPublicDTO;
}

const RecipeDetails: React.FC<RecipeDetailsProps> = ({ recipe, user }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isFavorite, setFavorite] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // Modal para iniciar sesión
  const [imgError, setImgError] = useState(false);

  const getFavorite = async () => {
    try {
      const is_fav = await isFavoriteRecipe(recipe.id);
      setFavorite(is_fav);
    } catch (error) {
      setFavorite(false);
    }
  };

  useEffect(() => {
    if (user.picture === "") setImgError(true);
    if (!localStorage.getItem("isLoggedIn") === true) return;
    getFavorite();
  }, []);

  // Función para copiar la URL al portapapeles
  const copyToClipboard = () => {
    if (!navigator.clipboard) {
      setCopySuccess(false); // Si hay un error, indica que no se ha copiado
      setShowModal(true); // Muestra el modal con error
      return;
    }
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
  const closeModal = () => {};

  const handleFavButtonClick = () => {
    if (!localStorage.getItem("isLoggedIn") === true) {
      setShowLoginModal(true);
      return;
    }
    try {
      if (isFavorite) {
        rmRecipeFav(recipe.id);
      } else {
        addRecipeFav(recipe.id);
      }
      setFavorite(!isFavorite);
    } catch (error) {
      //Si da error se habrá cerrado la sesion
      //refrescamos la pantalla para resetear el estado
      window.location.reload();
    }
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
            src={!imgError ? getImage(user.picture) : userDefaultPic}
            alt="Perfil de usuario"
            className="rounded-circle me-3"
            style={{ width: "3rem", height: "3rem" }}
            onError={() => {
              setImgError(true);
            }}
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
          <button
            onClick={handleFavButtonClick}
            className="btn btn-link p-0 d-flex align-items-center justify-content-center"
            style={{ width: "2rem", height: "2rem" }}
            title="Perfil"
          >
            {isFavorite ? (
              <img className="img-fluid" src={redHeart} alt="Perfil" />
            ) : (
              <img className="img-fluid" src={pngHeart} alt="Perfil" />
            )}
          </button>

          <button
            className="btn btn-link p-0 d-flex align-items-center justify-content-center"
            style={{ width: "2rem", height: "2rem" }}
            title="Copiar URL"
            onClick={copyToClipboard}
          >
            <img className="img-fluid" src={share} alt="Copiar URL" />
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

      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
        }}
        size="lg"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Compatir receta!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light">
          {copySuccess ? (
            <p>¡URL copiada con éxito!</p>
          ) : (
            <p>La copia al portapapeles no es compatible con este navegador.</p>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button
            variant="secondary"
            onClick={() => {
              setShowModal(false);
            }}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        size="lg"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Guardar receta!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light">
          <p>Para guardar recetas necesitas iniciar sesión.</p>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button
            variant="secondary"
            onClick={() => {
              setShowLoginModal(false);
            }}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RecipeDetails;
