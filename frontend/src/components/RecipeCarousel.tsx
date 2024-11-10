import React, { useState, useEffect } from "react";
import RecipeCard from "./RecipeCard"; // Asegúrate de importar correctamente tu componente
import { RecipeSimpleDTO } from "../interfaces";
import "../css/RecipeCarousel.css"; // Para el estilo adicional
import { t } from "i18next";

interface RecipeCarouselProps {
  recipes: RecipeSimpleDTO[];
}

const RecipeCarousel: React.FC<RecipeCarouselProps> = ({ recipes }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4); // Número de recetas que se muestran a la vez
  const totalItems = recipes.length;

  // Función para actualizar el número de elementos por página según el tamaño de la ventana
  const updateItemsPerPage = () => {
    setCurrentIndex(0);
    const width = window.innerWidth;
    if (width < 768) {
      setItemsPerPage(2); // Muestra 2 recetas en pantallas pequeñas
    } else if (width < 992) {
      setItemsPerPage(3); // Muestra 3 recetas en pantallas medianas
    } else {
      setItemsPerPage(4); // Muestra 4 recetas en pantallas grandes
    }
  };

  useEffect(() => {
    updateItemsPerPage(); // Inicializa el número de items al cargar el componente
    window.addEventListener("resize", updateItemsPerPage); // Escucha cambios en el tamaño de la ventana

    return () => {
      window.removeEventListener("resize", updateItemsPerPage); // Limpia el event listener al desmontar el componente
    };
  }, []);

  const nextPage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + itemsPerPage < totalItems
        ? prevIndex + itemsPerPage
        : prevIndex
    );
  };

  const prevPage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex - itemsPerPage >= 0 ? prevIndex - itemsPerPage : prevIndex
    );
  };

  return (
    <div className="recipes-carousel">
      <div className="row">
        {recipes
          .slice(currentIndex, currentIndex + itemsPerPage)
          .map((receta, index) => (
            <RecipeCard key={index} recipe={receta} />
          ))}
      </div>
      <div className="recipe-carousel-controls">
        <button
          onClick={prevPage}
          disabled={currentIndex === 0}
          className="recipe-carousel-button"
        >
          {t("previous")}
        </button>
        <button
          onClick={nextPage}
          disabled={currentIndex + itemsPerPage >= totalItems}
          className="recipe-carousel-button"
        >
          {t("next")}
        </button>
      </div>
    </div>
  );
};

export default RecipeCarousel;
