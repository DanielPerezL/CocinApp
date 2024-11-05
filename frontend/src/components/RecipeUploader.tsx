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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedImages(Array.from(files));
    }
  };

  const handleUpload = async () => {
    if (selectedImages.length === 0 || !title || !ingredients || !procedure) {
      setUploadStatus(
        "Please fill in all fields and select at least one image."
      );
      return;
    }

    try {
      setUploadStatus("Uploading images...");
      const imagePaths = await Promise.all(
        selectedImages.map((image) => uploadImage(image))
      );

      // Aquí puedes manejar la lógica para guardar la receta en tu backend si es necesario.
      // Por ejemplo, puedes hacer una llamada API para crear una nueva receta.

      setUploadStatus(`Images uploaded successfully!`);
      onUploadComplete(title, ingredients, procedure, imagePaths);
    } catch (error: any) {
      setUploadStatus(`Error uploading images: ${error.message}`);
    }
  };

  return (
    <div>
      <h2>Upload Recipe</h2>
      <input
        type="text"
        name="title"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Ingredients"
        name="ingredients"
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
      />
      <textarea
        placeholder="Procedure"
        name="proceduce"
        value={procedure}
        onChange={(e) => setProcedure(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        multiple
      />
      <button onClick={handleUpload} disabled={selectedImages.length === 0}>
        Upload Recipe
      </button>
      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
};

export default RecipeUploader;
