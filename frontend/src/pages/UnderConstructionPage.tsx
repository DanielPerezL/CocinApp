import { t } from "../services/i18n";
import React from "react";
import { Link } from "react-router-dom";

const UnderConstruction: React.FC = () => {
  return (
    <div className="d-flex align-items-center justify-content-center main-container mx-5">
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
  );
};

export default UnderConstruction;
