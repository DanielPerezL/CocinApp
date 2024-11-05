import React from "react";
import RecipeUploader from "../components/RecipeUploader";
import { uploadRecipe } from "../services/apiService"; // Importa la función para subir la receta
import AuthWrapper from "../components/AuthWrapper";

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
    } catch (error: any) {
      alert(error.message); // Muestra un mensaje de error al usuario
    }
  };

  return (
    <div className="container main-container">
      <h1>Publish Your Recipe</h1>
      <AuthWrapper>
        <RecipeUploader onUploadComplete={handleUploadComplete} />
      </AuthWrapper>
    </div>
  );
};

export default PublishPage;
