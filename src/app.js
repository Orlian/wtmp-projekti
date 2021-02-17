'use strict';
import {Toast, Tooltip} from 'bootstrap';
import './assets/styles/styles.scss';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}
/**
 * Lollifoi oskarin
 * @param {string} osku
 * @returns {string} modifoitu oskari
 */
const testiFunkkari = (osku) => {
  return osku + ' lol';
};

console.log(testiFunkkari('oskari'));
