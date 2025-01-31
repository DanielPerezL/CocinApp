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
      >
        {i18n.language == "es" ? "🇪🇸" : "🇬🇧"}
      </button>
      <ul className="dropdown-menu dropdown-menu-end dropdown-menu-md-start">
        <li>
          <button
            className="dropdown-item"
            onClick={() => changeLanguage("es")}
          >
            🇪🇸 Español
          </button>
        </li>
        <li>
          <button
            className="dropdown-item"
            onClick={() => changeLanguage("en")}
          >
            🇬🇧 English
          </button>
        </li>
      </ul>
    </div>
  );
};

export default LanguageSwitcher;
