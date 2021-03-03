import translationJson from '../assets/jsons/app-text-data.json';

const getTranslation = () => {

};

const getCurrentLanguage = () => {
  return localStorage.getItem('language') ? localStorage.getItem('language') : localStorage.setItem('language', 'fi');
};

const saveLanguage = (key, value) => {
  localStorage.setItem(key, value);
};

const TranslationData = {getCurrentLanguage, getTranslation, saveLanguage};
export default TranslationData;
