import React from "react";
import AuthWrapper from "../components/AuthWrapper";
import RecipeUploader from "../components/RecipeUploader";

const PublishPage: React.FC = () => {
  return (
    <div className="main-container container">
      <div className="text-center mb-4">
        <h1 className="display-5 text-primary">Publica una receta</h1>
      </div>
      <AuthWrapper>
        <RecipeUploader />
      </AuthWrapper>
    </div>
  );
};

export default PublishPage;
