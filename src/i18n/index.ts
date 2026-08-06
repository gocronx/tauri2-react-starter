import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import zh from "./locales/zh.json";
import en from "./locales/en.json";

const savedLang =
  typeof localStorage !== "undefined" ? localStorage.getItem("app_lang") : null;
const userLang = savedLang || (navigator.language.startsWith("zh") ? "zh" : "en");

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
  },
  lng: userLang,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export function changeLanguage(lang: "zh" | "en") {
  localStorage.setItem("app_lang", lang);
  return i18n.changeLanguage(lang);
}

export default i18n;
