import React from "react";
import RecipeUploader from "../components/RecipeUploader";
import { uploadRecipe } from "../services/apiService"; // Importa la función para subir la receta

const PublishPage: React.FC = () => {
  // Manejador para la subida de la receta
  const handleUploadComplete = async (
    title: string,
    ingredients: string,
    procedure: string,
    imagePaths: string[]
  ) => {
    try {
      const successMessage = await uploadRecipe(
        title,
        ingredients,
        procedure,
        imagePaths
      );
      window.location.reload();
    } catch (error: any) {
      console.error("Error uploading recipe:", error);
      alert(`Error uploading recipe: ${error.message}`); // Muestra un mensaje de error al usuario
    }
  };

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) return <></>;

  return (
    <div>
      <h1>Publish Your Recipe</h1>
      <RecipeUploader onUploadComplete={handleUploadComplete} />
    </div>
  );
};

export default PublishPage;
