'use strict';

import './styles/styles.scss';
import 'bootstrap';
import 'leaflet';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import WeatherData from './modules/weather-data';
import HSLData from './modules/hsl-data';
import CampusData from './modules/campus-data';
import TranslationData from './modules/translation-data';
import {isArray} from 'leaflet/src/core/Util';

// Navigation elements //
const homeButton = document.querySelector('#navbar-brand-img');
const homeLink = document.querySelector('#nav-item-home');
const menuLink = document.querySelector('#nav-item-menu');
const hslLink = document.querySelector('#nav-item-hsl');
const weatherLink = document.querySelector('#nav-item-weather');
const campusLink = document.querySelector('#navbarDropdown');
const campusDropdown = document.querySelector('#campus-selection');
const briefingNavLink = document.querySelector('#briefing-nav-link');
const languageButton = document.querySelector('#change-language-btn');
const flagImg = document.querySelector('#flag-img');
const searchInput = document.querySelector('#search-input');
const searchButton = document.querySelector('#search-button');

// Banner elements //
const bannerImage = document.querySelector('#banner');
const bannerHeading = document.querySelector('#banner-heading');

// Modal elements //
const campusModalTitle = document.querySelector('.modal-title');
const campusModalBody = document.querySelector('.modal-body');

// Carousel elements //
const coronaCarousel = document.querySelector('#corona-carousel');
const coronaCarouselAllP = document.querySelectorAll('.carousel-slide-p');
const coronaCarouselAllImg = document.querySelectorAll('.carousel-item img');

// Restaurant elements //
const menuSection = document.querySelector('#menu-section');
const menuCardBody = document.querySelector('#restaurant-body');

// Weather elements //
const weatherSection = document.querySelector('#weather-section');
const weatherCardHeader = document.querySelector('#weather-card-header');
const weatherCardUl = document.querySelector('#weather-card-ul');
const weatherCardBody = document.querySelector('#weather-card-body');

// HSL elements //
const hslCardUl = document.querySelector('.hsl-data-ul');
const hslCard = document.querySelector('#hsl-data');
const hslSectionHeader = document.querySelector('#hsl-section-header h1');
const hslSection = document.querySelector('#hsl-section');

// Covid19 info elements //
const briefingSection = document.querySelector('#briefing-section');
const coronaInfo = document.querySelector('#corona-info');

const sections = document.querySelectorAll('section');

const campusKey = 'activeCampus';
const languageKey = 'language';
const campusList = CampusData.campusList;

const today = new Date().toISOString().split('T')[0];

const map = L.map('map-card-body');
const markerLayer = L.layerGroup().addTo(map);

// Leaflet icons //
const defaultIcon = L.icon({
  iconUrl: './assets/pictures/pin.png',
  iconSize: [32, 36],
  iconAnchor: [14, 36],
  popupAnchor: [2, -40],
  shadowUrl: iconShadow,
  shadowSize: [30, 40],
  shadowAnchor: [10, 36],
});

const youIcon = L.icon({
  iconUrl: './assets/pictures/mortarboard.png',
  iconSize: [36, 48],
  iconAnchor: [24, 36],
  popupAnchor: [-5, -40],
});

L.Marker.prototype.options.icon = defaultIcon;


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').
      then(registration => {
        console.log('SW registered: ', registration);
      }).
      catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

/**
 * Initialization function that calls all relevant functions at page load
 * fetches active campus from localStorage or sets a default one
 * @returns {Promise<void>}
 */
const init = async () => {
  CampusData.fetchLocalCampus(campusKey);
  const languageSetting = TranslationData.getCurrentLanguage(languageKey);
  const activeCampus = CampusData.getCurrentCampus('', CampusData.campusList,
    campusKey);
  loadBanner(activeCampus);
  renderLanguage(languageSetting);
  await loadApiData(activeCampus, languageSetting);
};

/**
 * Bundled function that calls all functions requiring active campus data and
 * sets up the leaflet map with relevant position and markers
 * @param {Object} campus - Active campus data
 * @param {string} language - Active language
 * @returns {Promise<void>}
 */
const loadApiData = async (campus, language) => {
  await loadWeatherData(campus, language);
  await loadBusStops(campus.coords.latitude, campus.coords.longitude, language);
  await loadMenuData(campus.restaurant, language);
  map.setView([campus.coords.latitude, campus.coords.longitude], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  addMarker(campus.coords.latitude, campus.coords.longitude, `${campus.name}`,
    {specialMarker: true}, true,
    (language === 'fi' ? 'kampus ikoni' : 'campus icon'));
};

/**
 * Fetches weather data for active campus from weather module
 * @param {Object} campus - Active campus object
 * @param {string} lang - Active language
 * @returns {Promise<void>}
 */
const loadWeatherData = async (campus, lang) => {
  try {
    const weather = await WeatherData.getHourlyForecast(campus.coords.latitude,
      campus.coords.longitude,
      lang);
    renderWeatherData(weather, lang, campus);
  } catch (error) {
    renderNoDataNotification(weatherCardBody, (lang === 'fi' ?
      'Ei säätietoja saatavilla' :
      'No weather data available'));
  }
};

/**
 * Renders campus weather data into relevant html elements
 * @param {Object} weatherObject - Contains formatted weather data
 * @param {string} lang - Active language
 * @param {Object} campus - Active campus object
 */
const renderWeatherData = (weatherObject, lang, campus) => {
  weatherCardUl.innerHTML = '';
  weatherCardHeader.textContent = campus.name;
  const listItem = document.createElement('li');
  const listItemImg = document.createElement('img');
  listItemImg.id = 'current-weather-icon';
  listItemImg.src = (`${weatherObject.currentWeather.icon}`);
  listItemImg.alt = `${lang === 'fi' ?
    weatherObject.currentWeather.desc + ' ikoni' :
    weatherObject.currentWeather.desc + ' icon'}`;
  listItem.textContent = ` ${weatherObject.currentWeather.time} ${weatherObject.currentWeather.desc} ${weatherObject.currentWeather.temp.toFixed(
    0)}\u00B0C ${lang === 'fi' ?
    'Tuntuu kuin: ' :
    'Feels like: '} ${weatherObject.currentWeather.feels_like.toFixed(
    0)}\u00B0C`;
  listItem.prepend(listItemImg);
  weatherCardUl.appendChild(listItem);

  for (let hourWeather = 1; hourWeather < 5; hourWeather++) {
    const listItem = document.createElement('li');
    const listItemImg = document.createElement('img');
    listItemImg.classList.add('hour-weather-icon');
    listItemImg.src = (`${weatherObject.weatherForecast[hourWeather].icon}`);
    listItemImg.alt = `${lang === 'fi' ?
      weatherObject.weatherForecast[hourWeather].desc + ' ikoni' :
      weatherObject.weatherForecast[hourWeather].desc + ' icon'}`;
    listItem.textContent = ` ${weatherObject.weatherForecast[hourWeather].time} ${weatherObject.weatherForecast[hourWeather].desc} ${weatherObject.weatherForecast[hourWeather].temp.toFixed(
      0)}\u00B0C ${lang === 'fi' ?
      'Tuntuu kuin: ' :
      'Feels like: '} ${weatherObject.weatherForecast[hourWeather].feels_like.toFixed(
      0)}\u00B0C`;
    listItem.prepend(listItemImg);
    weatherCardUl.appendChild(listItem);
  }
};

/**
 * Fetches HSL-data about nearby public transport stops and timetables
 * @param {number} lat - Campus latitude
 * @param {number} lon - Campus longitude
 * @param {string} language - Active language
 * @returns {Promise<void>}
 */
const loadBusStops = async (lat, lon, language) => {
  try {
    const stops = await HSLData.getStopsByRadius(lat, lon, 700);
    renderBusStops(stops.data.stopsByRadius.edges, language);
  } catch (err) {
    renderNoDataNotification(hslCard, (language === 'fi' ?
      'Ei HSL-tietoja saatavilla' :
      'No HSL-data available'));
  }
};

/**
 * Renders HSL-data into relevant html elements
 * @param {Object} stops - GraphQl object containing data of stops and departures
 * @param {string} language - Active language
 */
const renderBusStops = (stops, language) => {
  hslCardUl.innerHTML = '';
  for (let stop of stops) {
    const collapseId = makeId(stop.node.stop.lat, stop.node.stop.lon);
    const stopLi = document.createElement('li');
    stopLi.classList.add('list-group-item');
    stopLi.setAttribute('data-bs-toggle', 'collapse');
    stopLi.setAttribute('href', `#${collapseId}`);
    stopLi.setAttribute('role', 'button');
    stopLi.ariaExpanded = 'false';
    stopLi.setAttribute('aria-controls', 'collapse');
    stopLi.innerHTML = `<h2>${stop.node.stop.name} - ${stop.node.distance}m</h2>`;

    const stopCollapse = document.createElement('div');
    stopCollapse.classList.add('collapse');
    stopCollapse.id = `${collapseId}`;

    const stopCollapseUl = document.createElement('ul');
    stopCollapseUl.classList.add('list-group');
    let stopIterator = 0;
    for (let arrival of stop.node.stop.stoptimesWithoutPatterns) {
      const stopCollapseLi = document.createElement('li');
      stopCollapseLi.classList.add('list-group-item');
      let arrivaltime = HSLData.secondsFromArrival(arrival.realtimeArrival);
      if (arrivaltime > 0) {
        arrivaltime = HSLData.formatTime(arrivaltime);
        stopCollapseLi.textContent += `${arrivaltime} ${arrival.headsign ?
          arrival.headsign :
          ''} - ${arrival.trip.route.shortName}`;
      } else if (arrivaltime <= 0 && stopIterator !== 0) {
        stopCollapseLi.textContent += `${language === 'fi' ?
          'lähtee huomenna' :
          'leaves tomorrow'}`;
      } else {
        stopCollapseLi.textContent += `${language === 'fi' ?
          'NYT' :
          'NOW'} ${arrival.headsign ?
          arrival.headsign :
          ''} - ${arrival.trip.route.shortName}`;
      }
      stopCollapseUl.appendChild(stopCollapseLi);
      stopIterator++;
    }
    if (stop.node.stop.stoptimesWithoutPatterns.length === 0) {
      const stopCollapseLi = document.createElement('li');
      stopCollapseLi.classList.add('list-group-item');
      stopCollapseLi.textContent = 'No upcoming departures';
      stopCollapseUl.appendChild(stopCollapseLi);
    }
    stopCollapse.appendChild(stopCollapseUl);
    stopLi.appendChild(stopCollapse);
    hslCardUl.append(stopLi);
    const marker = addMarker(stop.node.stop.lat, stop.node.stop.lon,
      stop.node.stop.name, stopLi, false,
      (language === 'fi' ? 'pysäkki ikoni' : 'public transport stop icon'));
    stopLi.addEventListener('click', (evt) => {
      if (!marker.options.isOpen) {
        marker.openPopup();
      } else {
        marker.closePopup();
      }
    });
  }
};

/**
 * Combines coordinates into a unique id
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {string}
 */
const makeId = (lat, lon) => {
  const listId1 = `a${lat}`.replace('.', '');
  const listId2 = `${lon}`.replace('.', '');
  return listId1 + listId2;
};

/**
 * Add marker to leaflet map. Adds popup and eventlisteners to markers.
 * @param {number} lat - Marker latitude
 * @param {number} lon - Marker longitude
 * @param {string} text - Marker popup text
 * @param {Object} elem - Represents the linked collapsible li-element that shares the same stop-data as the marker
 * @param {boolean} isOpen - Represents whether marker's bound popup is open or not
 * @param {string} alt - Marker icon alt text
 * @returns {Object} marker - marker object
 */
const addMarker = (lat, lon, text = '', elem = {}, isOpen = false, alt) => {
  const popUp = L.popup({autoClose: false, closeOnClick: false}).
    setContent(text);
  const marker = L.marker([lat, lon],
    {
      isOpen: isOpen,
      icon: (elem.specialMarker ? youIcon : defaultIcon),
      alt: alt,
    }).
    addTo(markerLayer).
    bindPopup(popUp).on('popupopen', () => {
      if (!marker.options.isOpen && !elem.specialMarker) {
        elem.click();
        marker.options.isOpen = true;
      }
    }).on('popupclose', () => {
      if (marker.options.isOpen && !elem.specialMarker) {
        elem.click();
        marker.options.isOpen = false;
      }
    });
  return marker;
};

/**
 * Displays lunch menu items as html list. Displays diet info under the menu list in active language.
 * @param {Object} menuData - Parsed JSON-data from restaurant API
 * @param {Object} restaurant - Restaurant of the active campus
 * @param {string} language - Active language
 */
const renderMenu = (menuData, restaurant, language) => {
  menuCardBody.innerHTML = '';
  const languageJson = TranslationData.getTranslation(language);
  const restaurantHeader = document.createElement('h1');
  restaurantHeader.classList.add('header-h1');
  restaurantHeader.textContent = restaurant.displayname;
  restaurantHeader.classList.add('text-center');
  const ul = document.createElement('ul');
  for (const item of menuData) {
    const listItem = document.createElement('li');
    listItem.textContent = item;
    ul.appendChild(listItem);
  }
  const dietInfoP = document.createElement('p');
  dietInfoP.id = 'dietInfo-p';
  let dietInfoText = '';
  languageJson.dietInfo.forEach((diet) => {
    dietInfoText += `${diet}`;
  });
  dietInfoP.textContent = dietInfoText;
  menuCardBody.appendChild(restaurantHeader);
  menuCardBody.appendChild(ul);
  menuCardBody.appendChild(dietInfoP);
};

/**
 * Replaces restaurant menu with no data message if no data is found
 * @param {Object} element - Targeted element for message
 * @param {string} message - Message for targeted element
 */
const renderNoDataNotification = (element, message) => {
  element.innerHTML = `<p>${message}</p>`;
};

/**
 * Calls relevant restaurant fetch function based on active campus restaurant
 * @param {Object} restaurant - Restaurant from the active campus object
 * @param {string} languageSetting - Active language
 * @returns {Promise<void>}
 */
const loadMenuData = async (restaurant, languageSetting) => {
  try {
    const parsedMenu = await restaurant.type.getDailyMenu(restaurant.id,
      languageSetting, today);
    renderMenu(parsedMenu, restaurant, languageSetting);
  } catch (error) {
    renderNoDataNotification(menuCardBody, (languageSetting === 'fi' ?
      'Ei ravintolatietoja saatavilla' :
      'No restaurant data available'));
  }
};

/**
 * Loads the correct banner image and text based on campus choice
 * @param {Object} campus - Active campus object
 */
const loadBanner = (campus) => {
  bannerImage.style.backgroundImage = `url(${campus.image.url})`;
  bannerImage.style.backgroundPosition = `center ${campus.image.offset}em`;
  bannerHeading.textContent = campus.name;
};


/**
 * Removes the 'active' class and attribute from all links
 */
const removePageAttributes = () => {
  homeLink.classList.remove('active');
  homeLink.removeAttribute('aria-current');
  briefingNavLink.classList.remove('active');
  briefingNavLink.removeAttribute('aria-current');
  menuLink.classList.remove('active');
  menuLink.removeAttribute('aria-current');
  hslLink.classList.remove('active');
  hslLink.removeAttribute('aria-current');
  weatherLink.classList.remove('active');
  weatherLink.removeAttribute('aria-current');
};


/**
 * Renders language into relevant html elements.
 * @param {string} language = Active language
 */
const renderLanguage = (language) => {
  coronaInfo.textContent = '';
  let i = 1;
  const languageJson = TranslationData.getTranslation(language);

  if (language === 'fi') {
    flagImg.style.backgroundImage = 'url("./assets/pictures/united-kingdom.png")';
    searchInput.setAttribute('placeholder', 'Etsi hakusanalla');
    searchButton.textContent = 'Hae';
  } else {
    flagImg.style.backgroundImage = 'url("./assets/pictures/finland.png")';
    searchInput.setAttribute('placeholder', 'Search');
    searchButton.textContent = 'Search';
  }

  homeLink.textContent = languageJson.navigation['nav-item-home'];
  briefingNavLink.textContent = languageJson.navigation['nav-item-briefing'];
  menuLink.textContent = languageJson.navigation['nav-item-menu'];
  hslLink.textContent = languageJson.navigation['nav-item-hsl'];
  weatherLink.textContent = languageJson.navigation['nav-item-weather'];
  campusLink.textContent = languageJson.navigation['nav-item-campus'];
  hslSectionHeader.textContent = languageJson['section-header']['hsl'];

  coronaCarouselAllP.forEach((link) => {
    link.textContent = '';
  });

  coronaCarouselAllImg.forEach((carouselImg) => {
    carouselImg.alt = `${languageJson.carousel[`carousel-alt`]}`;
  });

  coronaCarouselAllP.forEach((link) => {
    link.append(languageJson.carousel[`carousel-slide-${i}`]);
    link.innerHTML += `<a href="#" class="link-info briefing-link">Info</a>`;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      coronaCarousel.style.display = 'none';
      briefingSection.style.display = 'block';
      menuSection.style.display = 'none';
      hslSection.style.display = 'none';
      weatherSection.style.display = 'none';
      removePageAttributes();
      briefingNavLink.classList.add('active');
      briefingNavLink.setAttribute('aria-current', 'page');
    });

    i++;
  });

  i = 1;

  languageJson.info.forEach((article) => {
    const infoChapter = document.createElement('article');
    const textWrapper = document.createElement('div');
    textWrapper.classList.add('article-text-wrapper');
    const chapterHeader = document.createElement('h1');
    const chapterParag = document.createElement('p');

    chapterHeader.textContent = article.header;
    textWrapper.appendChild(chapterHeader);

    if (isArray(article.text)) {
      let textUl = document.createElement('ul');
      article.text.forEach((text) => {
        let textLi = document.createElement('li');
        textLi.textContent = text;
        textUl.appendChild(textLi);
      });
      chapterParag.appendChild(textUl);
    } else {
      chapterParag.textContent = article.text;
    }

    textWrapper.appendChild(chapterParag);

    if (article.link) {
      const chapterLink = document.createElement('a');
      chapterLink.textContent = article.link;
      chapterLink.href = article.link;
      chapterLink.setAttribute('target', '_blank');
      textWrapper.appendChild(chapterLink);
    }

    if (article.image) {
      const chapterImage = document.createElement('img');
      chapterImage.classList.add('article-image');
      chapterImage.setAttribute('loading', 'lazy');
      chapterImage.src = article.image.src;
      chapterImage.alt = `${article.image.alt}`;
      infoChapter.appendChild(chapterImage);
    }
    infoChapter.appendChild(textWrapper);
    coronaInfo.appendChild(infoChapter);
  });
};

init();

setInterval(async () => {
  const activeLanguage = TranslationData.getCurrentLanguage(languageKey);
  const activeCampus = CampusData.getCurrentCampus('', CampusData.campusList,
    campusKey);
  markerLayer.clearLayers();
  addMarker(activeCampus.coords.latitude, activeCampus.coords.longitude,
    `${activeCampus.name}`,
    {specialMarker: true}, true,
    (activeLanguage === 'fi' ? 'kampus ikoni' : 'campus icon'));
  await loadBusStops(activeCampus.coords.latitude,
    activeCampus.coords.longitude, activeLanguage);
  await loadWeatherData(activeCampus, activeLanguage);
}, 60000);

// Event listeners //
searchButton.addEventListener('click', (event) => {
  event.preventDefault();
  for (let section of sections) {
    if (searchInput.value === '') {
      section.style.display = 'none';
    } else if (section.innerHTML.toLowerCase().
      includes(searchInput.value.toLowerCase())) {
      section.style.display = 'block';
    } else {
      section.style.display = 'none';
    }
  }
});

campusDropdown.addEventListener('click', async (evt) => {
  const currentCampus = CampusData.getCurrentCampus(
    evt.target.getAttribute('data-name'), campusList, campusKey);
  CampusData.saveLocalCampus(campusKey, currentCampus.name);
  loadBanner(currentCampus);
  await loadApiData(currentCampus,
    TranslationData.getCurrentLanguage(languageKey));
});

homeButton.addEventListener('click', (event) => {
  event.preventDefault();
  coronaCarousel.style.display = 'block';
  for (const section of sections) {
    section.style.display = 'block';
  }
  removePageAttributes();
  briefingSection.style.display = 'none';
  homeLink.classList.add('active');
  homeLink.setAttribute('aria-current', 'page');
});

homeLink.addEventListener('click', (event) => {
  event.preventDefault();
  coronaCarousel.style.display = 'block';
  for (const section of sections) {
    section.style.display = 'block';
  }
  removePageAttributes();
  briefingSection.style.display = 'none';
  homeLink.classList.add('active');
  homeLink.setAttribute('aria-current', 'page');
});

briefingNavLink.addEventListener('click', (event) => {
  event.preventDefault();
  coronaCarousel.style.display = 'none';
  briefingSection.style.display = 'block';
  menuSection.style.display = 'none';
  hslSection.style.display = 'none';
  weatherSection.style.display = 'none';
  removePageAttributes();
  briefingNavLink.classList.add('active');
  briefingNavLink.setAttribute('aria-current', 'page');
});

menuLink.addEventListener('click', (event) => {
  event.preventDefault();
  coronaCarousel.style.display = 'none';
  briefingSection.style.display = 'none';
  menuSection.style.display = 'block';
  hslSection.style.display = 'none';
  weatherSection.style.display = 'none';
  removePageAttributes();
  menuLink.classList.add('active');
  menuLink.setAttribute('aria-current', 'page');
});

hslLink.addEventListener('click', (event) => {
  event.preventDefault();
  coronaCarousel.style.display = 'none';
  briefingSection.style.display = 'none';
  menuSection.style.display = 'none';
  hslSection.style.display = 'block';
  weatherSection.style.display = 'none';
  removePageAttributes();
  hslLink.classList.add('active');
  hslLink.setAttribute('aria-current', 'page');
});

weatherLink.addEventListener('click', (event) => {
  event.preventDefault();
  coronaCarousel.style.display = 'none';
  briefingSection.style.display = 'none';
  menuSection.style.display = 'none';
  hslSection.style.display = 'none';
  weatherSection.style.display = 'block';
  removePageAttributes();
  weatherLink.classList.add('active');
  weatherLink.setAttribute('aria-current', 'page');
});

languageButton.addEventListener('click', (event) => {
  event.preventDefault();
  let activeLanguage = TranslationData.getCurrentLanguage(languageKey);
  if (activeLanguage === 'fi') {
    TranslationData.saveLanguage(languageKey, 'en');
  } else {
    TranslationData.saveLanguage(languageKey, 'fi');
  }
  init();
});

bannerImage.addEventListener('click', (evt) => {
  evt.preventDefault();
  const activeLanguage = TranslationData.getCurrentLanguage(languageKey);
  const activeCampus = CampusData.getCurrentCampus('', CampusData.campusList,
    campusKey);
  campusModalTitle.textContent = activeCampus.name;
  campusModalBody.innerHTML = `<strong>${activeLanguage === 'fi' ?
    'Käyntiosoite:  ' :
    'Visit at:  '}</strong>${activeCampus.address}<br/><br/><strong>${activeLanguage ===
  'fi' ?
    'Postiosoite:  ' :
    'Postal address:  '}</strong>${activeCampus.postal} <br/><br/><strong>${activeLanguage ===
  'fi' ? 'Aukioloajat:' : 'Business hours:  '}</strong>   ${activeLanguage ===
  'fi' ?
    activeCampus.hours.fi :
    activeCampus.hours.en} <br/><br/><strong>${activeLanguage === 'fi' ?
    'Aulapalvelut:  ' :
    'Lobby services:  '}</strong>   ${activeCampus.lobby.phone} <br/>${activeCampus.lobby.email}`;
});
