'use strict';
import './styles/styles.scss';
import 'bootstrap';

/*if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}*/
/**
 * Lollifoi oskarin
 * @param {string} osku
 * @returns {string} modifoitu oskari
 */
const testiFunkkari = (osku) => {
  return osku + ' lol';
};

console.log(testiFunkkari('oskari'));


// Async function with error handling
const getMeal = async () => {
  let response;
  try {
    response = await fetch(`https://cors-anywhere.herokuapp.com/https://users.metropolia.fi/~oskarpi/media-alustat/compass.json`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('getGithubReposOfUser error', error.message);
  }
  let repos = await response.json();
  return repos;
};
getMeal()
.then(data => console.log(data));
