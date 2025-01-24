import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import {
  fetchRecipesCategories,
  updateRecipe,
  uploadImage,
} from "../services/apiService";
import { useTranslation } from "react-i18next";
import {
  CategoryOptions,
  ConcreteIngredient,
  Ingredient,
  RecipeDetailDTO,
} from "../interfaces";
import IngredientSearch from "./IngredientSearch";

interface RecipeEditorProps {
  recipe: RecipeDetailDTO;
  onConfirm: () => void;
  onCancel: () => void;
}

const RecipeEditor: React.FC<RecipeEditorProps> = ({
  recipe,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();

  // Estados iniciales basados en la receta proporcionada
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [title, setTitle] = useState<string>(recipe.title || "");
  const [procedure, setProcedure] = useState<string[]>(
    recipe.procedure || [""]
  );
  const filteredProcedure = procedure.filter((item) => item.trim() !== ""); // Filtra pasos vacíos

  const [selectedIngredients, setSelectedIngredients] = useState<
    ConcreteIngredient[]
  >(recipe.ingredients || []);
  const [aviableCategories, setAviableCategories] = useState<CategoryOptions[]>(
    []
  );
  const [selectedCategories, setSelectedCategories] = useState<{
    [key: string]: string;
  }>({
    time: recipe.time || "",
    difficulty: recipe.difficulty || "",
    type: recipe.type || "",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileNames, setFileNames] = useState(
    `${recipe.images.length} ${t("nImagesSelected")}`
  );

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files == null) return;
    setSelectedImages(Array.from(files));
    if (files.length === 0) {
      setFileNames(t("noImagesSelected"));
    } else if (files.length === 1) {
      setFileNames(files[0].name);
    } else {
      setFileNames(`${files.length} ${t("nImagesSelected")}`);
    }
  };

  const handleIngredientSelect = (ingredient: Ingredient) => {
    setSelectedIngredients([
      ...selectedIngredients,
      { ...ingredient, amount: "" },
    ]);
  };

  const handleQuantityChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const updatedIngredients = [...selectedIngredients];
    updatedIngredients[index].amount = e.target.value;
    setSelectedIngredients(updatedIngredients);
  };

  const handleIngredientRemove = (event: React.MouseEvent, index: number) => {
    event.preventDefault();
    const updatedIngredients = selectedIngredients.filter(
      (_, i) => i !== index
    );
    setSelectedIngredients(updatedIngredients);
  };

  const handleCategoryChange = (
    categoryName: string,
    selectedOption: string
  ) => {
    setSelectedCategories((prevSelected) => ({
      ...prevSelected,
      [categoryName]: selectedOption,
    }));
  };

  const handleSave = async () => {
    const imagePaths =
      selectedImages.length > 0
        ? await Promise.all(selectedImages.map((image) => uploadImage(image)))
        : recipe.images || [];

    /*GUARDAR EN SV*/
    await updateRecipe(
      recipe.id,
      title,
      selectedIngredients,
      filteredProcedure,
      selectedCategories["time"],
      selectedCategories["difficulty"],
      selectedCategories["type"],
      imagePaths
    );

    onConfirm();
  };

  useEffect(() => {
    const loadRecipeCategories = async () => {
      try {
        const fetchedCategories = await fetchRecipesCategories();
        setAviableCategories(fetchedCategories);
      } catch (err) {
        console.error(err);
      }
    };
    loadRecipeCategories();
  }, []);

  return (
    <div className="container">
      <form className="p-2">
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            {t("title")}
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {aviableCategories.map((category, index) => (
          <div key={index} className="mb-3">
            <label htmlFor={category.name} className="form-label">
              {t(category.name)}
            </label>
            <select
              id={category.name}
              value={selectedCategories[category.name] || ""}
              onChange={(e) =>
                handleCategoryChange(category.name, e.target.value)
              }
              className="form-select"
            >
              <option value="">{t("selectOne")}</option>
              {category.options.map((option, idx) => (
                <option key={idx} value={option}>
                  {t(option)}
                </option>
              ))}
            </select>
          </div>
        ))}

        <div className="task-form">
          <div className="mb-3">
            <label htmlFor="ingredient" className="form-label">
              {t("ingredients")}
            </label>
            <IngredientSearch
              handleIngredientSelect={handleIngredientSelect}
              placeholder={t("enterIngredientsPlaceHolder")}
              ingredientsToHide={selectedIngredients}
            />
          </div>

          <div className="selected-ingredients mt-3">
            {selectedIngredients.map((ingredient, index) => (
              <div
                key={index}
                className="d-flex justify-content-between align-items-center mb-2"
              >
                <span>{`${ingredient.name} (${t(
                  ingredient.default_unit
                )})`}</span>
                <div className="d-flex align-items-center">
                  <input
                    type="number"
                    className="form-control form-control-sm me-2"
                    value={ingredient.amount}
                    onChange={(e) => handleQuantityChange(e, index)}
                    placeholder="Cantidad"
                  />
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={(e) => handleIngredientRemove(e, index)}
                  >
                    {t("remove")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <p className="form-label">{t("procedure")}</p>
          {procedure.map((step, index) => (
            <div key={index} className="d-flex flex-column mb-4">
              <label htmlFor={`procedure-step-${index}`} className="form-label">
                {`${t("step")} ${index + 1}`}{" "}
              </label>
              <textarea
                id={`procedure-step-${index}`}
                name={`procedure-step-${index}`}
                className="form-control"
                placeholder={`${t("step")} ${index + 1}`}
                rows={4}
                value={step}
                onChange={(e) => {
                  const newProcedure = [...procedure];
                  newProcedure[index] = e.target.value; // Actualiza el paso actual
                  setProcedure(newProcedure);
                }}
              />
              {/* Botón para eliminar paso */}
              {index > 0 && (
                <button
                  type="button"
                  className="btn btn-danger mt-2 col-12 col-md-3 col-lg-2"
                  onClick={() => {
                    const newProcedure = procedure.filter(
                      (_, i) => i !== index
                    ); // Elimina el paso actual
                    setProcedure(newProcedure);
                  }}
                >
                  {t("rmStep")} {index + 1}
                </button>
              )}{" "}
            </div>
          ))}
          <button
            type="button"
            className="btn btn-primary"
            disabled={!procedure[procedure.length - 1]} // Deshabilita si el último paso está vacío
            onClick={() => setProcedure([...procedure, ""])} // Añadir un nuevo paso vacío
          >
            {t("addStep")}
          </button>
        </div>

        <div className="mb-3">
          <p className="form-label">{t("addImages")}</p>

          <div style={{ display: "flex", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => {
                if (fileInputRef && fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              className="btn btn-primary"
            >
              {t("addImages")}
            </button>

            <span className="ms-3">{fileNames}</span>
          </div>

          <input
            type="file"
            id="fileUpload"
            ref={fileInputRef}
            className="form-control"
            accept="image/*"
            onChange={handleFileChange}
            multiple
            style={{ display: "none" }} // Hide the default file input
          />
        </div>

        <div className="d-flex justify-content-between mt-3">
          <button
            type="button"
            className="btn btn-primary me-3"
            onClick={handleSave}
            disabled={
              !title ||
              selectedIngredients.length === 0 ||
              !selectedIngredients.every(
                (ingredient) => ingredient.amount != ""
              ) ||
              filteredProcedure.length === 0 ||
              !selectedCategories["time"] ||
              !selectedCategories["difficulty"] ||
              !selectedCategories["type"]
            }
          >
            {t("saveChanges")}
          </button>
          <button type="button" className="btn btn-danger" onClick={onCancel}>
            {t("cancel")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeEditor;
