import { useTranslation } from "react-i18next";

const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <main className="container my-5">
      <div className="text-center mb-4">
        <h1 className="display-4 text-primary">{t("aboutTitle")}</h1>
        <p className="fs-5 fw-light">{t("aboutSubtitle")}</p>
      </div>
      <div className="col-md-8 offset-md-2 text-center">
        <p className="fs-5">{t("aboutMessage")}</p>
      </div>
    </main>
  );
};

export default AboutPage;
