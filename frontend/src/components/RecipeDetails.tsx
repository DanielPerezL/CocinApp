// src/components/RecipeDetails.tsx
import React, { useEffect, useRef, useState } from "react";
import ImageCarousel from "./ImageCarousel";
import "../css/RecipeDetails.css";
import { RecipeDetailDTO, RecipeSimpleDTO, UserPublicDTO } from "../interfaces";
import { Button, Modal } from "react-bootstrap";
import share from "../assets/share.png";
import userDefaultPic from "../assets/user.png";
import redHeart from "../assets/red_heart.png";
import pngHeart from "../assets/heart.png";
import pngCart from "../assets/cart.png";
import greenCart from "../assets/green_cart.png";
import {
  addRecipeCart,
  addRecipeFav,
  fetchSimilarRecipes,
  getImage,
  getLoggedUserId,
  isAdmin,
  isLoggedIn,
  removeRecipe,
  rmRecipeCart,
  rmRecipeFav,
} from "../services/apiService";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import NeedConfirmButton from "./NeedConfirmButton";
import ReportButton from "./ReportButton";
import RecipeGrid from "./RecipeGrid";

interface RecipeDetailsProps {
  recipe: RecipeDetailDTO;
  user: UserPublicDTO;
}

const RecipeDetails: React.FC<RecipeDetailsProps> = ({ recipe, user }) => {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const [copySuccess, setCopySuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isFavorite, setFavorite] = useState(recipe.isFav);
  const [isInCart, setInCart] = useState(recipe.isCart);
  const [showLoginModal, setShowLoginModal] = useState(false); // Modal para iniciar sesión
  const [showErrorCartModal, setShowErrorCartModal] = useState(false); // Modal para iniciar sesión

  const [imgError, setImgError] = useState(false);

  const [recipes, setRecipes] = useState<RecipeSimpleDTO[]>([]);
  const [error, setError] = useState<string | null>(null); // Estado para gestionar errores
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef<boolean>(false); // Estado para gestionar la carga

  const loadRecipes = async () => {
    if (loadingRef.current || !hasMore) return; // Evitar solicitudes repetidas
    loadingRef.current = true;
    try {
      let data;
      if (offset == 0) {
        const limit = 4;
        data = await fetchSimilarRecipes(recipe.id, offset, limit);
      } else {
        data = await fetchSimilarRecipes(recipe.id, offset);
      }

      const newRecipes = data.recipes;

      setRecipes((prev) => {
        // Evitar duplicados combinando las nuevas recetas con las existentes
        const existingIds = new Set(prev.map((recipe) => recipe.id));
        const uniqueRecipes = newRecipes.filter(
          (recipe) => !existingIds.has(recipe.id)
        );
        const duplicates = newRecipes.length - uniqueRecipes.length;

        // Si existen duplicados, ajustamos el offset
        const newOffset = offset + (newRecipes.length - duplicates);
        setOffset(newOffset); // Actualizar el offset con el valor correcto

        return [...prev, ...uniqueRecipes];
      });
      setHasMore(data.has_more); // Si no hay más recetas, desactivar carga
    } catch (err: any) {
      setError(err.message); // Captura el error y actualiza el estado
    } finally {
      loadingRef.current = false; // Cambia el estado de carga a false al final
    }
  };

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
    loadRecipes();
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

  const handleCartButtonClick = async () => {
    if (!isLoggedIn()) {
      setShowLoginModal(true);
      return;
    }
    try {
      if (isInCart) {
        await rmRecipeCart(recipe.id);
      } else {
        await addRecipeCart(recipe.id);
      }
      setInCart(!isInCart);
    } catch (error: any) {
      setShowErrorCartModal(true);
    }
  };

  return (
    <>
      <div className="container">
        <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-sm-between align-items-center mb-3">
          <div className="d-flex w-100 w-sm-25 w-md-50 justify-content-center justify-content-sm-start">
            <Link
              to={"/user/" + user.nickname}
              className="d-flex align-items-center border border-primary rounded p-2 hover-effect text-decoration-none"
            >
              <img
                src={!imgError ? getImage(user.picture) : userDefaultPic}
                className="rounded-circle me-3"
                style={{ width: "3rem", height: "3rem" }}
                onError={() => setImgError(true)}
              />
              <p
                className="m-0 text-black"
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "calc(18ch)",
                }}
              >
                {user.nickname}
              </p>
            </Link>
          </div>

          <div className="d-flex gap-2 mt-3 mt-sm-0">
            <button
              onClick={handleFavButtonClick}
              className="btn btn-link p-0 d-flex align-items-center justify-content-center"
              style={{ width: "2rem", height: "2rem" }}
              title="Favourite Button"
            >
              {isFavorite ? (
                <img className="img-fluid" src={redHeart} />
              ) : (
                <img className="img-fluid" src={pngHeart} />
              )}
            </button>

            <button
              onClick={handleCartButtonClick}
              className="btn btn-link p-0 d-flex align-items-center justify-content-center"
              style={{ width: "2rem", height: "2rem" }}
              title="Cart Button"
            >
              {isInCart ? (
                <img className="img-fluid" src={greenCart} />
              ) : (
                <img className="img-fluid" src={pngCart} />
              )}
            </button>

            <button
              className="btn btn-link p-0 d-flex align-items-center justify-content-center"
              style={{ width: "2rem", height: "2rem" }}
              title="URL Button"
              onClick={copyToClipboard}
            >
              <img className="img-fluid" src={share} />
            </button>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
          <h1 className="display-5 text-primary">{recipe.title}</h1>
        </div>
        {/* Carrusel de imágenes */}
        <ImageCarousel images={recipe.images} />
        <div className="mt-4 mb-1">
          <strong>{t("time")}:</strong>{" "}
          <span className="badge bg-primary">{t(recipe.time)}</span>
        </div>
        <div className="mb-1">
          <strong>{t("difficulty")}:</strong>{" "}
          <span className="badge bg-primary">{t(recipe.difficulty)}</span>
        </div>
        <div className="mb-4">
          <strong>{t("type")}:</strong>{" "}
          <span className="badge bg-primary">{t(recipe.type)}</span>
        </div>
        {/* Sección de ingredientes */}
        <div className="mb-4">
          <h3>{t("ingredients")}</h3>
          <ul className="receta-ingredients">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>
                <span className="ingredient-name">{ingredient.name}:</span>{" "}
                <span className="ingredient-amount">
                  {ingredient.amount} {t(ingredient.default_unit)}
                </span>
              </li>
            ))}
          </ul>
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
        {isAdmin() || getLoggedUserId() == user.id ? (
          //Soy admin o dueño de receta, puedo eliminar
          <NeedConfirmButton
            className="btn btn-danger"
            title={t("confirmDelteRecipeTitle")}
            message={t("confirmDelteRecipeMessage")}
            onConfirm={handleRecipeDelete}
          >
            {t("deleteRecipe")}
          </NeedConfirmButton>
        ) : (
          //El cualquier otro caso puedo reportar
          <ReportButton className="btn btn-danger" text={t("reportRecipe")} />
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
        <Modal
          show={showErrorCartModal}
          onHide={() => setShowErrorCartModal(false)}
          size="lg"
        >
          <Modal.Header closeButton className="bg-light">
            <Modal.Title>{t("cartError")}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-light">
            <p>{t("cartErrorMessage")}</p>
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button
              variant="secondary"
              onClick={() => {
                setShowErrorCartModal(false);
              }}
            >
              {t("close")}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
      <div className="mt-4">
        {!loadingRef.current && !error && recipes.length > 0 && (
          <>
            <p className="mt-5 mb-2 fs-5 fw-light">{t("similarRecipes")}</p>
            <RecipeGrid
              hasMore={hasMore}
              loading={loadingRef.current}
              onLoadMore={loadRecipes}
              recipes={recipes}
            />
          </>
        )}
      </div>
    </>
  );
};

export default RecipeDetails;
