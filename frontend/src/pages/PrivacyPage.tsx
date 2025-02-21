import { useTranslation } from "react-i18next";

const PrivacyPage = () => {
  const { t } = useTranslation();

  return (
    <div className="container my-5">
      <div className="text-center mb-4">
        <h1 className="display-4 text-primary">{t("privacyTitle")}</h1>
        <p className="fs-5 fw-light">{t("privacySubtitle")}</p>
      </div>
      <div className="col-md-8 offset-md-2">
        <p className="fs-5 mb-3">{t("privacyIntro")}</p>
        <ul className="fs-6">
          <li>{t("privacyPoint1")}</li>
          <li>{t("privacyPoint2")}</li>
          <li>{t("privacyPoint3")}</li>
          <li>{t("privacyPoint4")}</li>
        </ul>
        <p className="fs-5">{t("privacyConclusion")}</p>
      </div>
    </div>
  );
};

export default PrivacyPage;
