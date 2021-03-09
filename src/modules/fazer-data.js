'use strict';
/**
 * Functions for managing Fazer menu data
 * @module modules/fazer-data
 * @author oskarpi <oskarpi@metropolia.fi>
 */
import {fazerProxyUrl} from "../settings";
import {fetchGetJson} from "./network";

const weeklyUrlEn = `${fazerProxyUrl}/api/restaurant/menu/week?language=en&restaurantPageId=270540&weekDate=`;
const weeklyUrlFi = `${fazerProxyUrl}/api/restaurant/menu/week?language=fi&restaurantPageId=270540&weekDate=`;

/**
 * Returns a daily menu array from Fazer weekly json data
 * @param {Object} menuData
 * @param {Number} dayOfWeek week day 0-6
 * @returns {Array} daily menu
 */
const parseDailyMenu = (menuData, dayOfWeek) => {

  let dailyMenu = menuData.LunchMenus[dayOfWeek].SetMenus.map(setMenu => {
    // console.log(setMenu);
    let mealName = setMenu.Name;
    let mealPrice = setMenu.Price ? setMenu.Price : '-';
    let dishes = setMenu.Meals.map(dish => {
      return `${dish.Name} (${dish.Diets.join(', ')}) ${mealPrice}`;
    });
    return mealName ? `${mealName}: ${dishes.join(', ')}` : dishes.join(', ');
  });
  return dailyMenu;
};

/**
 * Get daily menu from Fazer API
 * @async
 * @param {number} restaurantId - Id of the restaurant
 * @param {string} lang
 * @param {string} date in ISO format (YYYY-MM-DD)
 * @return {Promise<string>} Daily menu data
 */
const getDailyMenu = async (restaurantId, lang, date) => {
  let dayOfWeek = new Date().getDay();

  dayOfWeek -= 1;
  if (dayOfWeek === -1) {
    dayOfWeek = 6;
  }
  let menuData;
  try {
    menuData = await fetchGetJson(`${lang === 'fi' ? weeklyUrlFi:weeklyUrlEn}${date}`);
  } catch (error) {
    throw new Error(error.message);
  }
  return parseDailyMenu(menuData, dayOfWeek);
};

const FazerData = {getDailyMenu};
export default FazerData;
