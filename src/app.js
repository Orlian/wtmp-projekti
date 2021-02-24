'use strict';
import './styles/styles.scss';
import 'bootstrap';
import 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import WeatherData from './modules/weather-data';
import HSLData from './modules/hsl-data';

const weatherCard = document.querySelector('#weather-card');
const weatherCardBody = document.querySelector('#weather-card-body');
const weatherCardUl = document.querySelector('#weather-card-ul');

const hslCard = document.querySelector('#hsl-data');
const hslCardBody = document.querySelector('#hsl-data-body');
const hslCardUl = document.querySelector('.hsl-data-ul');

const map = L.map('map-card-body');

const defaultIcon = L.icon({
  iconUrl: icon,
  iconSize: [24, 36],
  iconAnchor: [24, 36],
  popupAnchor: [-3, -76],
  shadowUrl: iconShadow,
  shadowSize: [30, 40],
  shadowAnchor: [24, 36],
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

const success = async (position) => {
  await loadWeatherData(position.coords.latitude, position.coords.longitude);
  await loadBusStops(position.coords);

  map.setView([position.coords.latitude, position.coords.longitude], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  addMarker(position.coords.latitude, position.coords.longitude, 'Olet tässä');
};

const error = () => {
  alert('Sorry, no position available.');
};

const options = {
  enableHighAccuracy: true,
  maximumAge: 5000,
  timeout: 0,
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
  const listItem = document.createElement('li');
  const listItemImg = document.createElement('img');
  listItemImg.id = 'current-weather-icon';
  listItemImg.src = (`${weatherObject.currentWeather.icon}`);
  listItem.textContent = ` ${weatherObject.currentWeather.time} ${weatherObject.currentWeather.desc} ${weatherObject.currentWeather.temp}C ${weatherObject.currentWeather.feels_like}C`;
  listItem.prepend(listItemImg);
  weatherCardUl.appendChild(listItem);

  for (let hourWeather = 1; hourWeather < 13; hourWeather++) {
    const listItem = document.createElement('li');
    const listItemImg = document.createElement('img');
    listItemImg.classList.add('hour-weather-icon');
    listItemImg.src = (`${weatherObject.weatherForecast[hourWeather].icon}`);
    listItem.textContent = ` ${weatherObject.weatherForecast[hourWeather].time} ${weatherObject.weatherForecast[hourWeather].desc} ${weatherObject.weatherForecast[hourWeather].temp}C ${weatherObject.weatherForecast[hourWeather].feels_like}C`;
    listItem.prepend(listItemImg);
    weatherCardUl.appendChild(listItem);
  }

};

const loadBusStops = async (location) => {
  try {
    const stops = await HSLData.getStopsByRadius(location, 700);
    console.log('stops data:', stops.data.stopsByRadius.edges);
    renderBusStops(stops.data.stopsByRadius.edges);
  } catch (err) {

  }
};

const renderBusStops = (stops) => {
  for (let stop of stops) {
    addMarker(stop.node.stop.lat, stop.node.stop.lon, stop.node.stop.name);
    const stopLi = document.createElement('li');
    stopLi.textContent = `Pysäkki: ${stop.node.stop.name} - ${stop.node.distance} metrin päässä.`;
    for(let arrival of stop.node.stop.stoptimesWithoutPatterns){
      let arrivaltime = HSLData.formatTime(HSLData.secondsFromArrival(arrival.realtimeArrival));
      stopLi.textContent += `${arrivaltime} ${arrival.headsign}`;
    }
    hslCardUl.append(stopLi);
  }
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
    console.error('getGithubReposOfUser error', error.message);
  }
  let repos = await response.json();
  return repos;
};
getMeal().then(data => console.log(data));

const addMarker = (lat, lon, text = '') => {
  L.marker([lat, lon]).
    addTo(map).
    bindPopup(text).
    openPopup();
};
