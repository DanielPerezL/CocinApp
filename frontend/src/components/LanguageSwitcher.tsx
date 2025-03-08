import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-light dropdown-toggle d-flex align-items-center"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
        id="languageDropdown"
      >
        {i18n.language === "es" ? "🇪🇸" : "🇬🇧"}
        <span className="visually-hidden">Seleccionar idioma</span>
      </button>
      <ul
        className="dropdown-menu dropdown-menu-end dropdown-menu-md-start"
        aria-labelledby="languageDropdown"
      >
        <li>
          <button
            className="dropdown-item"
            onClick={() => changeLanguage("es")}
            aria-current={i18n.language === "es" ? "true" : "false"}
          >
            🇪🇸 Español
          </button>
        </li>
        <li>
          <button
            className="dropdown-item"
            onClick={() => changeLanguage("en")}
            aria-current={i18n.language === "en" ? "true" : "false"}
          >
            🇬🇧 English
          </button>
        </li>
      </ul>
    </div>
  );
};

export default LanguageSwitcher;
