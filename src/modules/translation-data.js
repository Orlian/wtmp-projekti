'use strict';
/**
 * Functions for managing Language data from static json file app-text-data.json
 * @module modules/translation-data
 * @author oskarpi <oskarpi@metropolia.fi>
 */
import translationJson from '../assets/jsons/app-text-data.json';

/**
 * Returns language object from app-text json data
 * @param {string} lang - Active language
 * @returns {Object} fi or en object
 */
const getTranslation = (lang) => {
  return lang === 'fi' ? translationJson.fi : translationJson.en;
};

/**
 * Returns active language key value, fi or en. If there is no such a key, function sets default value fi.
 * @param {string} key - active language key
 * @returns {string} key value - fi or en
 */
const getCurrentLanguage = (key) => {
  if(localStorage.getItem(key)){
    return localStorage.getItem(key);
  } else {
    localStorage.setItem(key, 'fi');
    return localStorage.getItem(key);
  }
};

/**
 * Sets item to local storage. In this case language.
 * @param {string} key
 * @param {string} value
 */
const saveLanguage = (key, value) => {
  localStorage.setItem(key, value);
};

const TranslationData = {getCurrentLanguage, getTranslation, saveLanguage};
export default TranslationData;
