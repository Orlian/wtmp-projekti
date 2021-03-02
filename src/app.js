'use strict';

import './styles/styles.scss';
import 'bootstrap';
import 'leaflet';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import WeatherData from './modules/weather-data';
import HSLData from './modules/hsl-data';
import CampusData from './modules/campus-data';

const weatherCardUl = document.querySelector('#weather-card-ul');
const weatherCardBody = document.querySelector('#weather-card-body');
const campusDropdown = document.querySelector('#campus-selection');
const hslCardUl = document.querySelector('.hsl-data-ul');
const hslCard = document.querySelector('#hsl-data');
const menuCardBody = document.querySelector('#restaurant-body');
const searchButton = document.querySelector('#search-button');
const searchInput = document.querySelector('#search-input');
const sections = document.querySelectorAll('section');
const homeButton = document.querySelector('#navbar-brand-img');
const homeLink = document.querySelector('#nav-item-home');
const briefingNavLink = document.querySelector('#briefing-nav-link');
const briefingLinks = document.querySelectorAll('.briefing-link');
const menuLink = document.querySelector('#nav-item-menu');
const hslLink = document.querySelector('#nav-item-hsl');
const weatherLink = document.querySelector('#nav-item-weather');
const coronaCarousel = document.querySelector('#corona-carousel');
const briefingSection = document.querySelector('#briefing-section');
const menuSection = document.querySelector('#menu-section');
const hslSection = document.querySelector('#hsl-section');
const weatherSection = document.querySelector('#weather-section');
const bannerImage = document.querySelector('#banner');
const bannerHeading = document.querySelector('#banner-heading');

const campusKey = 'activeCampus';
const campusList = CampusData.campusList;
let languageSetting = 'fi';
const today = new Date().toISOString().split('T')[0];
const noDataMessage = 'No data available';

const map = L.map('map-card-body');

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
 * Initialization function that calls all relevant functions at page load
 * fetches active campus from localStorage or sets a default one
 * @returns {Promise<void>}
 */
const init = async () => {
  CampusData.fetchLocalCampus(campusKey);
  const activeCampus = CampusData.getCurrentCampus('', CampusData.campusList,
    campusKey);
  loadBanner(activeCampus);
  await loadApiData(activeCampus);
};

/**
 * Bundled function that calls all functions requiring active campus data and
 * sets up the leaflet map with relevant position and markers
 * @param {Object} campus - Active campus data
 * @returns {Promise<void>}
 */
const loadApiData = async (campus) => {
  await loadWeatherData(campus.coords.latitude, campus.coords.longitude);
  await loadBusStops(campus.coords.latitude, campus.coords.longitude);
  await loadMenuData(campus.restaurant);
  map.setView([campus.coords.latitude, campus.coords.longitude], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  addMarker(campus.coords.latitude, campus.coords.longitude, `${campus.name}`,
    {specialMarker: true}, true);
};

/**
 * Fetches weather data for active campus from weather module
 * @param {number} lat - Campus latitude
 * @param {number} lon - Campus longitude
 * @returns {Promise<void>}
 */
const loadWeatherData = async (lat, lon) => {
  try {
    const weather = await WeatherData.getHourlyForecast(lat, lon,
      'fi');
    console.log(weather);
    renderWeatherData(weather);
  } catch (error) {
    console.log(error.message);
    renderNoDataNotification(weatherCardBody, noDataMessage);
  }
};

/**
 * Renders campus weather data into relevant objects
 * @param {Object} weatherObject - Contains formatted weather data
 */
const renderWeatherData = (weatherObject) => {
  weatherCardUl.innerHTML = '';
  const listItem = document.createElement('li');
  const listItemImg = document.createElement('img');
  listItemImg.id = 'current-weather-icon';
  listItemImg.src = (`${weatherObject.currentWeather.icon}`);
  listItem.textContent = ` ${weatherObject.currentWeather.time} ${weatherObject.currentWeather.desc} ${weatherObject.currentWeather.temp.toFixed(0)}\u00B0C Feels like: ${weatherObject.currentWeather.feels_like.toFixed(0)}\u00B0C`;
  listItem.prepend(listItemImg);
  weatherCardUl.appendChild(listItem);

  for (let hourWeather = 1; hourWeather < 5; hourWeather++) {
    const listItem = document.createElement('li');
    const listItemImg = document.createElement('img');
    listItemImg.classList.add('hour-weather-icon');
    listItemImg.src = (`${weatherObject.weatherForecast[hourWeather].icon}`);
    listItem.textContent = ` ${weatherObject.weatherForecast[hourWeather].time} ${weatherObject.weatherForecast[hourWeather].desc} ${weatherObject.weatherForecast[hourWeather].temp.toFixed(0)}\u00B0C ${weatherObject.weatherForecast[hourWeather].feels_like.toFixed(0)}\u00B0C`;
    listItem.prepend(listItemImg);
    weatherCardUl.appendChild(listItem);
  }

};

/**
 * Fetches HSL-data about nearby public transport stops and timetables
 * @param {number} lat - Campus latitude
 * @param {number} lon - Campus longitude
 * @returns {Promise<void>}
 */
const loadBusStops = async (lat, lon) => {
  try {
    const stops = await HSLData.getStopsByRadius(lat, lon, 700);
    console.log('stops data:', stops.data.stopsByRadius.edges);
    renderBusStops(stops.data.stopsByRadius.edges);
  } catch (err) {
    console.error('loadBusStops error', err.message);
    renderNoDataNotification(hslCard, noDataMessage);
  }
};

/**
 * Renders HSL-data into relevant elements
 * @param {Object} stops - GraphQl object containing data of stops and departures
 */
const renderBusStops = (stops) => {
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
    stopLi.innerHTML = `<h1 class="h5">${stop.node.stop.name} - ${stop.node.distance}m</h1>`;

    const stopCollapse = document.createElement('div');
    stopCollapse.classList.add('collapse');
    stopCollapse.id = `${collapseId}`;

    const stopCollapseUl = document.createElement('ul');
    stopCollapseUl.classList.add('list-group');

    for (let arrival of stop.node.stop.stoptimesWithoutPatterns) {
      const stopCollapseLi = document.createElement('li');
      stopCollapseLi.classList.add('list-group-item');
      let arrivaltime = HSLData.secondsFromArrival(arrival.realtimeArrival);
      if (arrivaltime > 0) {
        arrivaltime = HSLData.formatTime(arrivaltime);
        stopCollapseLi.textContent += `${arrivaltime} ${arrival.headsign} - ${arrival.trip.route.shortName}`;
      } else {
        stopCollapseLi.textContent += `lähtee huomenna`;
      }
      stopCollapseUl.appendChild(stopCollapseLi);
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
      stop.node.stop.name, stopLi);
    stopLi.addEventListener('click', (evt) => {
      if (!marker.options.isOpen) {
        marker.openPopup();
        console.log('marker isOpen', marker.options.isOpen);
      } else {
        marker.closePopup();
        console.log('marker isOpen', marker.options.isOpen);
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
 *
 * @param {number} lat - Marker latitude
 * @param {number} lon - Marker longitude
 * @param {string} text - Marker popup text
 * @param {Object} elem - Represents the linked collapsible li-element that shares the same stop-data as the marker
 * @param {boolean} isOpen - Represents whether marker's bound popup is open or not
 * @returns {*}
 */
const addMarker = (lat, lon, text = '', elem = {}, isOpen = false) => {
  const popUp = L.popup({autoClose: false, closeOnClick: false}).
    setContent(text);
  const marker = L.marker([lat, lon],
    {
      myCustomId: makeId(lat, lon),
      isOpen: isOpen,
      icon: (elem.specialMarker ? youIcon : defaultIcon),
    }).
    addTo(map).
    bindPopup(popUp).on('popupopen', () => {
      console.log('popupopen event');
      if (!marker.options.isOpen && !elem.specialMarker) {
        elem.click();
        marker.options.isOpen = true;
      }
    }).on('popupclose', () => {
      console.log('popupclose event');
      if (marker.options.isOpen && !elem.specialMarker) {
        elem.click();
        marker.options.isOpen = false;
      }
    });
  return marker;
};

/**
 *
 * @param {Object} menuData - Parsed JSON-data from restaurant API
 * @param {Object} restaurant - Restaurant of the active campus
 */
const renderMenu = (menuData, restaurant) => {
  menuCardBody.innerHTML = '';
  const restaurantHeader = document.createElement('h4');
  restaurantHeader.textContent = restaurant.displayname;
  restaurantHeader.classList.add('text-center');
  const ul = document.createElement('ul');
  for (const item of menuData) {
    const listItem = document.createElement('li');
    listItem.textContent = item;
    ul.appendChild(listItem);
  }
  menuCardBody.appendChild(restaurantHeader);
  menuCardBody.appendChild(ul);
};

/**
 * Replaces restaurant menu with no data message if no data is found
 * @param {Object} element - Targeted element for message
 * @param {string} message - Message for targeted element
 */
const renderNoDataNotification = (element ,message) => {
  element.innerHTML = `<p>${message}</p>`;
};

/**
 * Calls relevant restaurant fetch function based on active campus restaurant
 * @param {Object} restaurant - Restaurant from the active campus object
 * @returns {Promise<void>}
 */
const loadMenuData = async (restaurant) => {
  try {
    const parsedMenu = await restaurant.type.getDailyMenu(restaurant.id,
      languageSetting, today);
    renderMenu(parsedMenu, restaurant);
  } catch (error) {
    console.error(error);
    // notify user if errors with data
    renderNoDataNotification(menuCardBody, noDataMessage);
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

campusDropdown.addEventListener('click', async (evt) => {
  const currentCampus = CampusData.getCurrentCampus(
    evt.target.getAttribute('data-name'), campusList, campusKey);
  CampusData.saveLocalCampus(campusKey, currentCampus.name);
  loadBanner(currentCampus);
  map.eachLayer((layer) => {
    layer.remove();
  });
  await loadApiData(currentCampus);
});

searchButton.addEventListener('click', (event) => {
  event.preventDefault();
  for (let section of sections) {
    console.log(section);
    if (section.innerHTML.toLowerCase().
      includes(searchInput.value.toLowerCase())) {
      section.style.display = 'block';
    } else {
      section.style.display = 'none';
    }
  }
});

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

init();

homeButton.addEventListener('click', (event) => {
  event.preventDefault();
  coronaCarousel.style.display = 'block';
  for (const section of sections) {
    section.style.display = 'block';
  }
  removePageAttributes();
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
  homeLink.classList.add('active');
  homeLink.setAttribute('aria-current', 'page');
});

briefingLinks.forEach((link)=>{
  link.addEventListener('click', (event)=>{
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
/*
setInterval(async () => {
  const activeCampus = CampusData.getCurrentCampus('', CampusData.campusList,
    campusKey);
  await loadBusStops(activeCampus.coords.latitude, activeCampus.coords.longitude);
  await loadWeatherData(activeCampus.coords.latitude, activeCampus.coords.longitude);
}, 60000);*/
