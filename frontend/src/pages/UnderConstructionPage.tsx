import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const UnderConstruction: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mb-5 main-container">
      <div className="d-flex align-items-center justify-content-center mx-5">
        <div className="text-center">
          <h1 className="display-3 fw-bold text-warning">
            ⚠️ {t("errorOnDevelopment")}
          </h1>
          <p className="fs-4">{t("errorWokingOn")} </p>
          <p className="lead">{t("errorUnderConstruction")}</p>
          <Link
            to="/"
            className="btn btn-primary"
            onClick={() => {
              window.scrollTo(0, 0);
            }}
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnderConstruction;
