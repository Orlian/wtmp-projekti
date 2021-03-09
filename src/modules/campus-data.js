'use strict';
/**
 * Functions and Objects for all campus related data
 * @module modules/campus-data
 * @author joonasdl <joonasdl@metropolia.fi>
 */

import SodexoData from './sodexo-data';
import FazerData from './fazer-data';
import CompassData from './compass-data';

const campusList = [
  {
    name: 'Arabia',
    coords: {latitude: 60.21015476867742, longitude: 24.976743641873423},
    image: {url: './assets/pictures/arabia.webp', offset: -22},
    address: 'Hämeentie 135 D 00560 Helsinki',
    postal: 'Metropolia Ammattikorkeakoulu PL 4072 00079 Metropolia',
    hours: {
      fi: 'Ma - Pe  7:30 - 21:00',
      en:'Mon - Fri  7:30 - 21:00'
    },
    lobby: {
      phone: '040 579 8403',
      email: 'aulapalvelut.arabia@metropolia.fi'
    },
    directions: 'https://www.metropolia.fi/fi/metropoliasta/kampukset/arabia#saapumisohjeet',
    restaurant: {
      name: 'compas-arabia',
      displayname: 'Ravintola Luova',
      id: 0,
      type: CompassData,
    },
  },
  {
    name: 'Karamalmi',
    coords: {latitude: 60.2238794, longitude: 24.758149},
    image: {url: './assets/pictures/karamalmi.webp', offset: -23},
    address: 'Karaportti 2 02610 Espoo',
    postal: 'Metropolia Ammattikorkeakoulu PL 4070 00079 Metropolia',
    hours: {
      fi: 'Ma - Pe  7:30 - 21:00',
      en:'Mon - Fri  7:30 - 21:00'
    },
    lobby: {
      phone: '040 545 1572',
      email: 'aulapalvelut.karamalmi@metropolia.fi'
    },
    restaurant: {
      name: 'fazer-karamalmi',
      displayname: 'Fazer Karamalmi',
      id: 270540,
      type: FazerData,
    },
  },
  {
    name: 'Myllypuro',
    coords: {latitude: 60.2236145, longitude: 25.0783509},
    image: {url: './assets/pictures/myllypuro.webp', offset: -26},
    address: 'Myllypurontie 1 00920 Helsinki',
    postal: 'Metropolia Ammattikorkeakoulu PL 4000 00079 Metropolia',
    hours: {
      fi: 'Ma - Pe  7:30 - 21:00',
      en:'Mon - Fri  7:30 - 21:00'
    },
    lobby: {
      phone: '040 193 7758',
      email: 'aulapalvelut.myllypuro@metropolia.fi'
    },
    restaurant: {
      name: 'sodexo-myllypuro',
      displayname: 'Sodexo Myllypuro',
      id: 158,
      type: SodexoData,
    },
  },
  {
    name: 'Myyrmäki',
    coords: {latitude: 60.2586191, longitude: 24.8454723},
    image: {url: './assets/pictures/myyrmaki.webp', offset: -25},
    address: 'Leiritie 1 01600 Vantaa',
    postal: 'Metropolia Ammattikorkeakoulu PL 4071 00079 Metropolia',
    hours: {
      fi: 'Ma - Pe  7:30 - 21:00',
      en:'Mon - Fri  7:30 - 21:00'
    },
    lobby: {
      phone: '040 545 1573',
      email: 'aulapalvelut.myyrmaki@metropolia.fi'
    },
    restaurant: {
      name: 'sodexo-myyrmaki',
      displayname: 'Sodexo Myyrmäki',
      id: 152,
      type: SodexoData,
    },
  },
];

/**
 * Compares and finds the campus that matches the corresponding link clicked
 * @param {string} input - link target campus
 * @param {array} campusList - Array of campus objects
 * @param {string} key - key string for localStorage
 * @returns {Object}
 */
const getCurrentCampus = (input = '', campusList, key) => {
  for (let campus of campusList) {
    if (input === '' && fetchLocalCampus(key) === campus.name) {
      return campus;
    } else if(input.toString() === campus.name.toLowerCase()) {
      return campus;
    }
  }
};

/**
 * Saves the new choice as active campus in localStorage
 * @param {string} key - key string for localStorage
 * @param {string} value - current campus name
 */
const saveLocalCampus = (key, value) => {
  localStorage.setItem(key, value);
};

/**
 * Retrieves the active campus from localStorage if it exists, or sets a default
 * @param {string} key - key string for localStorage
 * @returns {string|void}
 */
const fetchLocalCampus = (key) => {
    return (localStorage.getItem(key) ? localStorage.getItem(key) : localStorage.setItem(key, 'Karamalmi'));
};

const CampusData = {campusList, getCurrentCampus, fetchLocalCampus, saveLocalCampus};
export default CampusData;
