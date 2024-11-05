import React, { useState, ChangeEvent } from "react";
import { uploadImage } from "../services/apiService"; // Asegúrate de que esta función esté disponible

interface RecipeUploaderProps {
  onUploadComplete: (
    title: string,
    ingredients: string,
    procedure: string,
    imagePaths: string[]
  ) => void;
}

const RecipeUploader: React.FC<RecipeUploaderProps> = ({
  onUploadComplete,
}) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [title, setTitle] = useState<string>("");
  const [ingredients, setIngredients] = useState<string>("");
  const [procedure, setProcedure] = useState<string>("");
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState<string>("");
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string>("");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedImages(Array.from(files));
    }
  };

  const handleUpload = async () => {
    if (selectedImages.length === 0 || !title || !ingredients || !procedure) {
      setUploadStatus(
        "Por favor, rellena todos los campos y al menos una imágen."
      );
      return;
    }

    try {
      setUploadStatus("Subiendo imágenes...");
      const imagePaths = await Promise.all(
        selectedImages.map((image) => uploadImage(image))
      );
      onUploadComplete(title, ingredients, procedure, imagePaths);
      setTitle("");
      setIngredients("");
      setProcedure("");
      setSelectedImages([]);
      setUploadStatus("");
      setUploadErrorMsg("");
      setUploadSuccessMsg("Receta publicada correctamente.");
    } catch (error: any) {
      setUploadStatus("");
      setUploadErrorMsg(`Error al publicar la receta`);
    }
  };

  return (
    <div className="container mt-4">
      <form className="p-4">
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            Titulo
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
            Ingredientes
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
            Procedimiento
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
            Añade imágenes
          </label>
          <input
            type="file"
            id="fileUpload"
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
          Publicar receta!
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
