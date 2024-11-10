// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

// Configuración inicial
i18n
  .use(HttpApi) // para cargar archivos de traducción desde el servidor
  .use(LanguageDetector) // para detectar el idioma del navegador
  .use(initReactI18next) // para integrarse con React
  .init({
    supportedLngs: ["en", "es"], // idiomas soportados
    fallbackLng: "en", // idioma por defecto
    detection: {
      order: ["cookie", "localStorage", "navigator"], // orden de detección
      caches: ["cookie", "localStorage"], // almacenamiento del idioma detectado
    },
    backend: {
      loadPath: "/locales/{{lng}}/translation.json", // ruta de las traducciones
    },
    interpolation: {
      escapeValue: false, // react ya se encarga de escapar el contenido
    },
  });

// Exporta `i18n` para configuraciones adicionales si es necesario
export default i18n;

// Exporta una función `t` para obtener traducciones de forma programática
export const t = (key: any) => i18n.t(key);

// Exporta una función para cambiar el idioma de forma programática
export const changeLanguage = (lng: any) => i18n.changeLanguage(lng);
