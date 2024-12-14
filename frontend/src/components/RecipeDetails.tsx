// src/components/RecipeDetails.tsx
import React, { useEffect, useState } from "react";
import ImageCarousel from "./ImageCarousel";
import "../css/RecipeDetails.css";
import { RecipeDetailDTO, UserPublicDTO } from "../interfaces";
import { Button, Modal } from "react-bootstrap";
import share from "../assets/share.png";
import userDefaultPic from "../assets/user.png";
import redHeart from "../assets/red_heart.png";
import pngHeart from "../assets/heart.png";
import report from "../assets/report.png";
import {
  addRecipeFav,
  getImage,
  getLoggedUserId,
  isAdmin,
  isLoggedIn,
  removeRecipe,
  reportResource,
  rmRecipeFav,
} from "../services/apiService";
import NotifyReportModal from "./NotifyReportModal";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import NeedConfirmButton from "./NeedConfirmButton";
import ReportButton from "./ReportButton";

interface RecipeDetailsProps {
  recipe: RecipeDetailDTO;
  user: UserPublicDTO;
}

const RecipeDetails: React.FC<RecipeDetailsProps> = ({ recipe, user }) => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const [copySuccess, setCopySuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isFavorite, setFavorite] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false); // Modal para iniciar sesión
  const [imgError, setImgError] = useState(false);

  const handleRecipeDelete = async () => {
    await removeRecipe(recipe.id);
    if (!isAdmin()) {
      navigate("/profile");
    } else {
      navigate(`/user/${user.nickname}`);
    }
  };

  useEffect(() => {
    if (user.picture === "") setImgError(true);
    if (!isLoggedIn()) return;

    console.log("arreglas is fav -> implementar en el backend");
    //const is_fav = false;
    //setFavorite(is_fav);
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

  const handleFavButtonClick = () => {
    if (!isLoggedIn()) {
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
          <Link
            to={"/user/" + user.nickname}
            className="d-flex align-items-center border border-primary rounded p-2 shadow hover-effect text-decoration-none"
          >
            <img
              src={!imgError ? getImage(user.picture) : userDefaultPic}
              className="rounded-circle me-3"
              style={{ width: "3rem", height: "3rem" }}
              onError={() => {
                setImgError(true);
              }}
            />
            <p
              className="m-0 text-black"
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
          </Link>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={handleFavButtonClick}
            className="btn btn-link p-0 d-flex align-items-center justify-content-center"
            style={{ width: "2rem", height: "2rem" }}
            title="Perfil"
          >
            {isFavorite ? (
              <img className="img-fluid" src={redHeart} />
            ) : (
              <img className="img-fluid" src={pngHeart} />
            )}
          </button>

          <button
            className="btn btn-link p-0 d-flex align-items-center justify-content-center"
            style={{ width: "2rem", height: "2rem" }}
            title="Copiar URL"
            onClick={copyToClipboard}
          >
            <img className="img-fluid" src={share} />
          </button>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
        <h1 className="display-5 text-primary">{recipe.title}</h1>

        {(isAdmin() || getLoggedUserId() == recipe.user_id) && (
          <NeedConfirmButton
            className="btn btn-danger"
            buttonText={t("deleteRecipe")}
            title={t("confirmDelteRecipeTitle")}
            message={t("confirmDelteRecipeMessage")}
            onConfirm={handleRecipeDelete}
          />
        )}
      </div>
      {/* Carrusel de imágenes */}
      <ImageCarousel images={recipe.images} />

      <div className="mt-4 mb-1">
        <strong>{t("time")}:</strong>{" "}
        <span className="badge bg-info">{t(recipe.time)}</span>
      </div>
      <div className="mb-3">
        <strong>{t("difficulty")}:</strong>{" "}
        <span className="badge bg-warning text-dark">
          {t(recipe.difficulty)}
        </span>
      </div>

      {/* Sección de ingredientes */}
      <div className="mb-4">
        <h3>{t("ingredients")}</h3>
        <p className="receta-text">{recipe.ingredients}</p>
      </div>

      {/* Sección de procedimiento */}
      <div className="mb-4">
        <h3>{t("procedure")}</h3>
        {recipe.procedure.map((step, index) => (
          <div key={index} className="procedure-step">
            <h5 className="text-primary mt-3 mb-2">
              {t("step")} {index + 1}
            </h5>
            <p className="text-muted">{step}</p>
          </div>
        ))}
      </div>

      {!isAdmin() && getLoggedUserId() != user.id && (
        <ReportButton text={t("reportRecipe")} />
      )}
      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
        }}
        size="lg"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>{t("shareRecipe!")}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light">
          {copySuccess ? <p>{t("urlCopied")}</p> : <p>{t("urlNoCopied")}</p>}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button
            variant="secondary"
            onClick={() => {
              setShowModal(false);
            }}
          >
            {t("close")}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showLoginModal}
        onHide={() => setShowLoginModal(false)}
        size="lg"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>{t("addFavRecipe!")}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light">
          <p>{t("addFavRecipeCondition")}</p>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button
            variant="secondary"
            onClick={() => {
              setShowLoginModal(false);
            }}
          >
            {t("close")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default RecipeDetails;
