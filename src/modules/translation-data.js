import translationJson from '../assets/jsons/app-text-data.json';

const getTranslation = (lang) => {
  return lang === 'fi' ? translationJson.fi : translationJson.en;
};

const getCurrentLanguage = (key) => {
  if(localStorage.getItem(key)){
    return localStorage.getItem(key);
  } else {
    localStorage.setItem(key, 'fi');
    return localStorage.getItem(key);
  }
};

const saveLanguage = (key, value) => {
  localStorage.setItem(key, value);
};

const TranslationData = {getCurrentLanguage, getTranslation, saveLanguage};
export default TranslationData;
