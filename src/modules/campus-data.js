'use strict';
/**
 * Functions and Objects for all campus related data
 * @module modules/campus-data
 * @author joonasdl <joonasdl@metropolia.fi>
 */

import SodexoData from './sodexo-data';
import FazerData from './fazer-data';

const campusList = [
  {
    name: 'Arabia',
    coords: {latitude: 60.21015476867742, longitude: 24.976743641873423},
    image: {url: '../assets/pictures/arabia.jpg', offset: -20},
    restaurant: {
      name: 'compas-arabia',
      displayname: 'Compas Arabia',
      id: 0,
      type: '',
    },
  },
  {
    name: 'Karamalmi',
    coords: {latitude: 60.2238794, longitude: 24.758149},
    image: {url: '../assets/pictures/karamalmi.jpg', offset: -12},
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
    image: {url: '../assets/pictures/myllypuro.jpg', offset: -15},
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
    image: {url: '../assets/pictures/myyrmaki.jpg', offset: -14},
    restaurant: {
      name: 'sodexo-myyrmaki',
      displayname: 'Sodexo Myyrmäki',
      id: 152,
      type: SodexoData,
    },
  },
];

const getCurrentCampus = (input = '', campusList, key) => {
  for (let campus of campusList) {
    if (input.toString() === campus.name.toLowerCase()) {
      return campus;
    } else if(input === '' && fetchLocalCampus(key) === campus.name) {
      return campus;
    }
  }
};

const saveLocalCampus = (key, value) => {
  localStorage.setItem(key, value);
};

const fetchLocalCampus = (key) => {
    return (localStorage.getItem(key) ? localStorage.getItem(key) : localStorage.setItem(key, 'Karamalmi'));
};

const CampusData = {campusList, getCurrentCampus, fetchLocalCampus, saveLocalCampus};
export default CampusData;
