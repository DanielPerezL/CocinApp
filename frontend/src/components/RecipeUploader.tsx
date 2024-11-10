import React, { useState, ChangeEvent, useRef } from "react";
import { uploadImage, uploadRecipe } from "../services/apiService"; // Asegúrate de que esta función esté disponible
import { t } from "i18next";

const RecipeUploader: React.FC = () => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [title, setTitle] = useState<string>("");
  const [ingredients, setIngredients] = useState<string>("");
  const [procedure, setProcedure] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string>("");
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedImages(Array.from(files));
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
      setProcedure("");
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
            placeholder="Enter title"
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
            placeholder="Enter ingredients"
            rows={3}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="procedure" className="form-label">
            {t("procedure")}
          </label>
          <textarea
            id="procedure"
            name="procedure"
            className="form-control"
            placeholder="Enter procedure"
            rows={4}
            value={procedure}
            onChange={(e) => setProcedure(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="fileUpload" className="form-label">
            {t("addImages")}
          </label>
          <input
            type="file"
            id="fileUpload"
            ref={fileInputRef}
            className="form-control"
            accept="image/*"
            onChange={handleFileChange}
            multiple
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
