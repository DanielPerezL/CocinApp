import React, { useState, ChangeEvent, useRef } from "react";
import { uploadImage, uploadRecipe } from "../services/apiService"; // Asegúrate de que esta función esté disponible
import { useTranslation } from "react-i18next";

const RecipeUploader: React.FC = () => {
  const { t } = useTranslation();

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [title, setTitle] = useState<string>("");
  const [ingredients, setIngredients] = useState<string>("");
  const [procedure, setProcedure] = useState<string[]>([""]);
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

  const handleUpload = async () => {
    setUploadSuccessMsg("");
    if (selectedImages.length === 0 || !title || !ingredients || !procedure) {
      setUploadStatus(t("errorFillRecipeData"));
      return;
    }

    try {
      setUploadStatus(t("uploadingImages"));
      const imagePaths = await Promise.all(
        selectedImages.map((image) => uploadImage(image))
      );
      const id = await uploadRecipe(title, ingredients, procedure, imagePaths);
      setUploadStatus("");
      setUploadErrorMsg("");
      setUploadSuccessMsg(t("recipeUploadedSuccesfully"));
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Espera 2 seg
      window.location.href = `/recipe?id=${id}`;
      setTitle("");
      setIngredients("");
      setProcedure([""]);
      setSelectedImages([]);
    } catch (error: any) {
      setUploadStatus("");
      setUploadErrorMsg(t("errorRecipeUpload"));
      window.location.reload();
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset the input
      }
    }
  };

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

        <div className="mb-3">
          <label htmlFor="ingredients" className="form-label">
            {t("ingredients")}
          </label>
          <textarea
            id="ingredients"
            name="ingredients"
            className="form-control"
            placeholder={t("enterIngredientsPlaceHolder")}
            rows={3}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="procedure" className="form-label">
            {t("procedure")}
          </label>

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
          <label htmlFor="fileUpload" className="form-label">
            {t("addImages")}
          </label>

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
          disabled={selectedImages.length === 0}
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
