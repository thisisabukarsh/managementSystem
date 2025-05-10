import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./i18n/ar";
import en from "./i18n/en";

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
