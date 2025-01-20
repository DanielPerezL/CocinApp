import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import {
  fetchIngredients,
  fetchRecipesCategories,
  uploadImage,
  uploadRecipe,
} from "../services/apiService"; // Asegúrate de que esta función esté disponible
import { useTranslation } from "react-i18next";
import { CategoryOptions, ConcreteIngredient, Ingredient } from "../interfaces";

const RecipeUploader: React.FC = () => {
  const { t } = useTranslation();

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [title, setTitle] = useState<string>("");
  const [procedure, setProcedure] = useState<string[]>([""]);
  const filteredProcedure = procedure.filter((item) => item.trim() !== ""); //Solo quiero los NO VACIOS

  const [ingredientInput, setIngredientInput] = useState<string>(""); // Estado del input de ingredientes
  const [selectedIngredients, setSelectedIngredients] = useState<
    ConcreteIngredient[]
  >([]); // Ingredientes seleccionados
  const [ingredientsList, setIngredientsList] = useState<Ingredient[]>([]);
  const [ingredientsError, setIngredientsError] = useState<boolean>(false);

  const [aviableCategories, setAviableCategories] = useState<CategoryOptions[]>(
    []
  );
  const [selectedCategories, setSelectedCategories] = useState<{
    [key: string]: string;
  }>({});
  const [categoryError, setCategoryError] = useState<boolean>(false);

  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string>("");
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileNames, setFileNames] = useState(t("noImagesSelected"));

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

  // Filtrar ingredientes que coinciden con lo que el usuario escribe
  const filteredIngredients = ingredientsList.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(ingredientInput.toLowerCase())
  );

  // Manejador de selección de ingrediente
  const handleIngredientSelect = (ingredient: Ingredient): void => {
    setIngredientInput(""); // Limpiar el campo de entrada
    setSelectedIngredients([
      ...selectedIngredients,
      { ...ingredient, amount: "" }, // Agregar el ingrediente con una cantidad vacía
    ]);
  };

  // Manejador de cambio de cantidad
  const handleQuantityChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ): void => {
    const updatedIngredients = [...selectedIngredients];
    updatedIngredients[index].amount = e.target.value; // Actualizar la cantidad en el ingrediente seleccionado
    setSelectedIngredients(updatedIngredients);
  };

  const handleIngredientRemove = (event: React.MouseEvent, index: number) => {
    event.preventDefault(); // Prevenir el comportamiento por defecto (por ejemplo, un refresco)

    const updatedIngredients = selectedIngredients.filter(
      (_, i) => i !== index
    );
    setSelectedIngredients(updatedIngredients);
  };

  const handleUpload = async () => {
    setUploadSuccessMsg("");
    if (
      selectedImages.length === 0 ||
      !title ||
      !selectedIngredients ||
      filteredProcedure.length === 0 ||
      !selectedCategories["time"] ||
      !selectedCategories["difficulty"] ||
      !selectedCategories["type"]
    ) {
      setUploadStatus(t("errorFillRecipeData"));
      return;
    }

    try {
      setUploadStatus(t("uploadingImages"));
      const imagePaths = await Promise.all(
        selectedImages.map((image) => uploadImage(image))
      );
      const id = await uploadRecipe(
        title,
        selectedIngredients,
        filteredProcedure,
        selectedCategories["time"],
        selectedCategories["difficulty"],
        selectedCategories["type"],
        imagePaths
      );
      setUploadStatus("");
      setUploadErrorMsg("");
      setUploadSuccessMsg(t("recipeUploadedSuccesfully"));
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Espera 2 seg
      window.location.href = `/recipe?id=${id}`;
    } catch (error: any) {
      setUploadStatus("");
      setUploadErrorMsg(t("errorRecipeUpload"));
      //window.location.reload();
    } finally {
      setTitle("");
      setSelectedIngredients([]);
      setProcedure([""]);
      setSelectedImages([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset the input
      }
    }
  };

  useEffect(() => {
    const loadRecipeCategories = async () => {
      try {
        const fetchedCategories = await fetchRecipesCategories();
        setAviableCategories(fetchedCategories);
      } catch (err: any) {
        console.log(err);
        setCategoryError(true);
      }
    };

    const loadIngredients = async () => {
      try {
        const fetchedIngredients = await fetchIngredients();
        setIngredientsList(fetchedIngredients);
      } catch (err: any) {
        console.log(err);
        setIngredientsError(true);
      }
    };

    loadRecipeCategories();
    loadIngredients();
  }, []);

  const handleCategoryChange = (
    categoryName: string,
    selectedOption: string
  ) => {
    setSelectedCategories((prevSelected) => ({
      ...prevSelected,
      [categoryName]: selectedOption,
    }));
  };

  if (categoryError || ingredientsError) return null;

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
            placeholder={t("enterTitlePlaceHolder")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          {aviableCategories.length > 0 &&
            aviableCategories.map((category, index) => (
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
        </div>

        <div className="task-form">
          <div className="mb-3">
            <label htmlFor="ingredient" className="form-label">
              {t("ingredients")}
            </label>
            <input
              id="ingredient"
              name="ingredient"
              type="text"
              className="form-control"
              placeholder={t("enterIngredientsPlaceHolder")}
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
            />
            <div className="suggestions mt-2">
              {ingredientInput && filteredIngredients.length > 0 && (
                <ul className="list-group">
                  {filteredIngredients.map((ingredient) => (
                    <li
                      key={ingredient.name}
                      className="list-group-item d-flex justify-content-between align-items-center"
                      onClick={() => handleIngredientSelect(ingredient)}
                    >
                      {ingredient.name}
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleIngredientSelect(ingredient)}
                      >
                        Select
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="selected-ingredients mt-3">
            {selectedIngredients.map((ingredient, index) => (
              <div
                key={index}
                className="ingredient-item d-flex justify-content-between align-items-center mb-2"
                style={{ fontSize: "0.875rem" }} // Establecer un tamaño de fuente más pequeño
              >
                <span
                  style={{ fontSize: "0.875rem" }} // Hacer el texto más pequeño
                >
                  {ingredient.name} ({t(ingredient.default_unit)})
                </span>
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
            className="btn btn-secondary"
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

        <button
          type="button"
          className="btn btn-primary w-100"
          onClick={handleUpload}
          disabled={
            selectedImages.length === 0 ||
            !title ||
            selectedIngredients.length === 0 ||
            filteredProcedure.length === 0 ||
            !selectedCategories["time"] ||
            !selectedCategories["difficulty"] ||
            !selectedCategories["type"]
          }
        >
          {t("publishRecipe!")}
        </button>

        {uploadStatus && (
          <p className="mt-3 alert alert-info">{uploadStatus}</p>
        )}
        {uploadErrorMsg && (
          <p className="mt-3 alert alert-danger">{uploadErrorMsg}</p>
        )}
        {uploadSuccessMsg && (
          <p className="mt-3 alert alert-success">{uploadSuccessMsg}</p>
        )}
      </form>
    </div>
  );
};

export default RecipeUploader;
