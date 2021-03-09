'use strict';
/**
 * Functions for dealing with HSL traffic data
 * @module modules/hsl-data
 * @author joonasdl <joonasdl@metropolia.fi>
 */
import {fetchPostJson} from './network';

const apiUrl = 'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql';

/**
 * Fetches nearby stops based on user coordinates and their upcoming buses
 * @param {number} lat - User's latitude
 * @param {number} lon - User's longitude
 * @param {number} radius - Search radius in meters
 * @returns {Promise<*>}
 */
const getStopsByRadius = async (lat, lon, radius) => {
  const query = `{
    stopsByRadius(lat:${lat}, lon:${lon}, radius:${radius}, first: 5) {
      edges {
        node {
          stop {
            gtfsId
            name
            lat
            lon
            stoptimesWithoutPatterns {
              realtimeArrival
              arrivalDelay
              serviceDay
              headsign
              trip {
                route {
                  shortName
                }
              }
            }
          }
          distance
        }
      }
    }
  }`;
  try {
    return await fetchPostJson(apiUrl, 'application/graphql', query);
  } catch(err) {
    return console.log(`error ${err.status}, message: ${err.message}`);
  }

};

/**
 * Calculates how many seconds from midnight a unix timestamp represents
 * @param {number} arrivalTime - Unix timestamp of arrival time
 * @returns {number}
 */
const secondsFromArrival = (arrivalTime) =>{
  let now = new Date();
  let hours = now.getHours()*(60*60);
  let minutes = now.getMinutes()*60;
  let seconds = now.getSeconds();

  let secSinceMidnight = hours+minutes+seconds;
  let totalSeconds = arrivalTime-(secSinceMidnight);
  return totalSeconds;
};


/**
 * Converts HSL time to more readable format
 * @param {number} seconds - since midnight
 * @returns {string} HH:MM
 */
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) - (hours * 60);
  return `${hours === 0 ? '' : hours + 'h'} ${minutes}min`;
};

const HSLData = {getStopsByRadius, formatTime, secondsFromArrival};
export default HSLData;
