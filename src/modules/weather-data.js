'use strict';
/**
 * Functions for managing Weather data from OpenWeather API data
 * @module modules/weather-data
 * @author oskarpi <oskarpi@metropolia.fi>
 *
 */
import {fetchGetJson} from './network';

const hourlyForecastUrl = 'https://api.openweathermap.org/data/2.5/onecall';
const appid = 'd5f46b97c0d3618c2e85e2939ec55a4b';
//lat=60.2149594&lon=24.7854673&exclude=minutely,daily,alerts&units=metric&lang=fi&appid=d5f46b97c0d3618c2e85e2939ec55a4b


/**
 * Parses array from hourly forecast data json file
 *
 * @param {Object} hourlyForecastData in json format
 * @returns {Object} parsed hourly forecast array
 *
 */
const parseHourlyForecastData = (hourlyForecastData) => {
  const hourlyForecastArray = [];
  const currentWeather = hourlyForecastData.current.weather[0];
  for (const hourlyWeather of hourlyForecastData.hourly) {
    hourlyForecastArray.push(hourlyWeather.weather[0]);
  }
  return {currentWeather: currentWeather, weatherForecast: hourlyForecastArray};
};


/**
 * Get daily menu from Sodexo API
 *
 * @async
 * @param {number} lat
 * @param {number} lon
 * @param {string} lang
 * @return {Promise<Object>} Hourly forecast data
 */
const getHourlyForecast = async (lat, lon, lang) =>{
  let hourlyForecastData;
  try {
    hourlyForecastData = await fetchGetJson(`${hourlyForecastUrl}?lat=${lat}&lon=${lon}&exclude=minutely,daily,alerts&units=metric&lang=${lang}&appid=${appid}`);
  } catch (error) {
    throw new Error(error.message);
  }
  let parsedForecast =  await parseHourlyForecastData(hourlyForecastData);
  return parsedForecast;
};

const WeatherData = {getHourlyForecast};
export default WeatherData;
