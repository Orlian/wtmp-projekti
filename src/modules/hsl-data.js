import {fetchPostJson} from './network';

const apiUrl = 'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql';

/**
 * Fetches nearby stops based on user coordinates and their upcoming buses
 *
 * @param {object} location - User's geolocation object
 * @param {number} radius - Search radius in meters
 * @returns {Promise<*>}
 */
const getStopsByRadius = async (location, radius) => {
  const query = `{
    stopsByRadius(lat:${location.latitude}, lon:${location.longitude}, radius:${radius}, first: 5) {
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

const secondsFromArrival = (arrivalTime) =>{
  //let currentTime = new Date()-new Date().setHours(0,0,0,0);
  let now = new Date();
  let hours = now.getHours()*(60*60);
  let minutes = now.getMinutes()*60;
  let seconds = now.getSeconds();

  let secSinceMidnight = hours+minutes+seconds;
  //console.log(currentTime);
  let secondsFromArrival = arrivalTime-(secSinceMidnight);
  return secondsFromArrival;
};


/**
 * Converts HSL time to more readable format
 *
 * @param {number} seconds - since midnight
 * @returns {string} HH:MM
 */
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor(seconds / 60) - (hours * 60);
  return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
};

const HSLData = {getStopsByRadius, formatTime, secondsFromArrival};
export default HSLData;
