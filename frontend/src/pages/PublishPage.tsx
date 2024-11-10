import React from "react";
import AuthWrapper from "../components/AuthWrapper";
import RecipeUploader from "../components/RecipeUploader";
import { useTranslation } from "react-i18next";

const PublishPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="main-container container">
      <div className="text-center mb-4">
        <h1 className="display-5 text-primary">{t("publishRecipe")}</h1>
      </div>
      <AuthWrapper>
        <RecipeUploader />
      </AuthWrapper>
    </div>
  );
};

export default PublishPage;
