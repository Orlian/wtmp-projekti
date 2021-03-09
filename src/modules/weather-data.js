'use strict';
/**
 * Functions for managing Weather data from OpenWeather API
 * @module modules/weather-data
 * @author oskarpi <oskarpi@metropolia.fi>
 */
import {fetchGetJson} from './network';

const hourlyForecastUrl = 'https://api.openweathermap.org/data/2.5/onecall';
const appid = 'd5f46b97c0d3618c2e85e2939ec55a4b';


/**
 * Parses array from hourly forecast data json file
 * @param {Object} hourlyForecastData in json format
 * @returns {Object} parsed hourly forecast array
 */
const parseHourlyForecastData = (hourlyForecastData) => {
  const hourlyForecastArray = [];
  let currentWeatherObject = {
    'time': formatHourMins(hourlyForecastData.current.dt),
    'temp': hourlyForecastData.current.temp,
    'feels_like': hourlyForecastData.current.feels_like,
    'desc': hourlyForecastData.current.weather[0].description,
    'icon': `https://openweathermap.org/img/wn/${hourlyForecastData.current.weather[0].icon}.png`,
  };
  for (const hourlyWeather of hourlyForecastData.hourly) {
    let hourlyWeatherObject = {
      'time': formatHourMins(hourlyWeather.dt),
      'temp': hourlyWeather.temp,
      'feels_like': hourlyWeather.feels_like,
      'desc': hourlyWeather.weather[0].description,
      'icon': `https://openweathermap.org/img/wn/${hourlyWeather.weather[0].icon}.png`,
    };

    hourlyForecastArray.push(hourlyWeatherObject);
  }
  return {
    currentWeather: currentWeatherObject,
    weatherForecast: hourlyForecastArray,
  };
};

/**
 * Get hourly weather data from openWeather API based on current coordinates
 * @async
 * @param {number} lat
 * @param {number} lon
 * @param {string} lang
 * @return {Promise<Object>} Hourly forecast data
 */
const getHourlyForecast = async (lat, lon, lang) => {
  let hourlyForecastData;
  try {
    hourlyForecastData = await fetchGetJson(
      `${hourlyForecastUrl}?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&units=metric&lang=${lang}&appid=${appid}`);
  }
  catch (error) {
    throw new Error(error.message);
  }
  let parsedForecast = await parseHourlyForecastData(hourlyForecastData);
  return parsedForecast;
};

/**
 * Formats the time in the weather data into a readable state
 * @param {number} unixtime - timestamp in unix seconds
 * @returns {string}
 */
const formatHourMins = (unixtime) =>{
  let currentDate = new Date(unixtime*1000);
  let hours = currentDate.getHours();
  let minutes = currentDate.getMinutes();
  return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
};


const WeatherData = {getHourlyForecast};
export default WeatherData;
