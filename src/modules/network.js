'use strict';
/**
 * Network functions
 * @module modules/network
 * @author oskarpi <oskarpi@metropolia.fi>
 */
import {networkProxyUrl} from "../settings";

/**
 * Creates HTTP Get request
 * @param {string} url API endpoint
 * @param {boolean} useProxy wheter to use the proxy server
 * @returns {Object} json data
 */
const fetchGetJson = async (url, useProxy = false) => {
  let response;
  try {
    response = await fetch(`${useProxy ? networkProxyUrl : ''}${url}`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('network fetchGet error', error.message);
  }
  const responseJson = await response.json();
  return responseJson;
};

/**
 * Creates HTTP POST request
 * @param {string} url API endpoint
 * @param {string} contentType
 * @param {Object} body request payload
 * @param {boolean} useProxy wheter to use the proxy server
 * @returns {Object} json data
 */
const fetchPostJson = async (url, contentType, body, useProxy = false) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': contentType
    },
    body: body,
  };
  let response;
  try {
    response = await fetch(`${useProxy ? networkProxyUrl : ''}${url}`, options);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('network fetchPost error', error.message);
  }
  const responseJson = await response.json();
  return responseJson;
};

export {fetchGetJson, fetchPostJson};
