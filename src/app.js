'use strict';
import './styles/styles.scss';
import 'bootstrap';
import 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import WeatherData from './modules/weather-data';
import HSLData from './modules/hsl-data';
import CampusData from './modules/campus-data';

const weatherCardUl = document.querySelector('#weather-card-ul');
const campusDropdown = document.querySelector('#campus-selection');
const hslCardUl = document.querySelector('.hsl-data-ul');
const menuCardBody = document.querySelector('#restaurant-body');
const searchButton = document.querySelector('#search-button');
const searchInput = document.querySelector('#search-input');
const sections = document.querySelectorAll('section');
const homeButton = document.querySelector('#navbar-brand-img');
const homeLink = document.querySelector('#nav-item-home');
const briefingLink = document.querySelector('#nav-item-briefing');
const menuLink = document.querySelector('#nav-item-menu');
const hslLink = document.querySelector('#nav-item-hsl');
const weatherLink = document.querySelector('#nav-item-weather');
const coronaCarousel = document.querySelector('#corona-carousel');
const briefingSection = document.querySelector('#briefing-section');
const menuSection = document.querySelector('#menu-section');
const hslSection = document.querySelector('#hsl-section');
const weatherSection = document.querySelector('#weather-section');

const campusKey = 'activeCampus';
const campusList = CampusData.campusList;
let languageSetting = 'fi';
const today = new Date().toISOString().split('T')[0];

const map = L.map('map-card-body');

const defaultIcon = L.icon({
  iconUrl: icon,
  iconSize: [24, 36],
  iconAnchor: [24, 36],
  popupAnchor: [-13, -40],
  shadowUrl: iconShadow,
  shadowSize: [30, 40],
  shadowAnchor: [24, 36],
});

const youIcon = L.icon({
  iconUrl: './assets/pictures/men-silhouette.png',
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

const init = async () => {
  CampusData.fetchLocalCampus(campusKey);
  const activeCampus = CampusData.getCurrentCampus('', CampusData.campusList,
    campusKey);
  await loadMenuData(activeCampus.restaurant);
  console.log('active campus object', activeCampus);
};

const success = async (position) => {
  localStorage.setItem('lat', position.coords.latitude);
  localStorage.setItem('lon', position.coords.longitude);
  await loadWeatherData(position.coords.latitude, position.coords.longitude);
  await loadBusStops(position.coords.latitude, position.coords.longitude);

  map.setView([position.coords.latitude, position.coords.longitude], 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  addMarker(position.coords.latitude, position.coords.longitude, 'Olet tässä',
    {specialMarker: true}, true);
};

const error = () => {
  alert('Sorry, no position available.');
};

const options = {
  enableHighAccuracy: true,
  maximumAge: 5000,
};

navigator.geolocation.getCurrentPosition(success, error, options);

const loadWeatherData = async (lat, lon) => {
  try {
    const weather = await WeatherData.getHourlyForecast(lat, lon,
      'fi');
    console.log(weather);
    renderWeatherData(weather);
  } catch (error) {
    console.log(error.message);
  }
};

const renderWeatherData = (weatherObject) => {
  weatherCardUl.innerHTML = '';
  const listItem = document.createElement('li');
  const listItemImg = document.createElement('img');
  listItemImg.id = 'current-weather-icon';
  listItemImg.src = (`${weatherObject.currentWeather.icon}`);
  listItem.textContent = ` ${weatherObject.currentWeather.time} ${weatherObject.currentWeather.desc} ${weatherObject.currentWeather.temp}C ${weatherObject.currentWeather.feels_like}C`;
  listItem.prepend(listItemImg);
  weatherCardUl.appendChild(listItem);

  for (let hourWeather = 1; hourWeather < 5; hourWeather++) {
    const listItem = document.createElement('li');
    const listItemImg = document.createElement('img');
    listItemImg.classList.add('hour-weather-icon');
    listItemImg.src = (`${weatherObject.weatherForecast[hourWeather].icon}`);
    listItem.textContent = ` ${weatherObject.weatherForecast[hourWeather].time} ${weatherObject.weatherForecast[hourWeather].desc} ${weatherObject.weatherForecast[hourWeather].temp}C ${weatherObject.weatherForecast[hourWeather].feels_like}C`;
    listItem.prepend(listItemImg);
    weatherCardUl.appendChild(listItem);
  }

};

const loadBusStops = async (lat, lon) => {
  try {
    const stops = await HSLData.getStopsByRadius(lat, lon, 700);
    console.log('stops data:', stops.data.stopsByRadius.edges);
    renderBusStops(stops.data.stopsByRadius.edges);
  } catch (err) {
    console.error('loadBusStops error', err.message);
  }
};

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

const updateHslData = async (lat, lon) => {
  const stops = await HSLData.getStopsByRadius(lat, lon, 700);
};

// Async function with error handling
const getMeal = async () => {
  let response;
  try {
    response = await fetch(
      `https://cors-anywhere.herokuapp.com/https://users.metropolia.fi/~oskarpi/media-alustat/compass.json`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('getMeal error', error.message);
  }
  let meals = await response.json();
  return meals;
};
getMeal().then(data => console.log(data));

const makeId = (lat, lon) => {
  const listId1 = `a${lat}`.replace('.', '');
  const listId2 = `${lon}`.replace('.', '');
  return listId1 + listId2;
};

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
    bindPopup(popUp).
    openPopup().on('popupopen', () => {
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

const renderMenu = (menuData) => {
  menuCardBody.innerHTML = '';
  const ul = document.createElement('ul');
  for (const item of menuData) {
    const listItem = document.createElement('li');
    listItem.textContent = item;
    ul.appendChild(listItem);
  }
  menuCardBody.appendChild(ul);
};

const renderNoDataNotification = (message) => {
  menuCardBody.innerHTML = `<p>${message}</p>`;
};

const loadMenuData = async (restaurant) => {
  try {
    const parsedMenu = await restaurant.type.getDailyMenu(restaurant.id,
      languageSetting, today);
    renderMenu(parsedMenu);
  } catch (error) {
    console.error(error);
    // notify user if errors with data
    renderNoDataNotification('No data available..');
  }
};

campusDropdown.addEventListener('click', async (evt) => {
  console.log('event target', evt.target.getAttribute('data-name'));
  const currentCampus = CampusData.getCurrentCampus(
    evt.target.getAttribute('data-name'), campusList, campusKey);
  CampusData.saveLocalCampus(campusKey, currentCampus.name);
  console.log('currentCampus', currentCampus);
  await loadMenuData(currentCampus.restaurant);
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

const removePageAttributes = () => {
  homeLink.classList.remove('active');
  homeLink.removeAttribute('aria-current');
  briefingLink.classList.remove('active');
  briefingLink.removeAttribute('aria-current');
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

briefingLink.addEventListener('click', (event) => {
  event.preventDefault();
  coronaCarousel.style.display = 'none';
  briefingSection.style.display = 'block';
  menuSection.style.display = 'none';
  hslSection.style.display = 'none';
  weatherSection.style.display = 'none';
  removePageAttributes();
  briefingLink.classList.add('active');
  briefingLink.setAttribute('aria-current', 'page');
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

setInterval(async () => {

}, 60000);
