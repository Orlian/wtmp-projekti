/**
 * Functions for managing Sodexo menu data
 * @module modules/sodexo-data
 * @author oskarpi <oskarpi@metropolia.fi>
 *
 */
import {fetchGetJson} from "./network";

const dailyUrl = `https://www.sodexo.fi/ruokalistat/output/daily_json`;

/**
 * Parses couse arrays from Sodexo json file
 *
 * @param {Object} sodexoDailyMenu in json format
 * @returns {Object} parsed menu arrays
 *
 */
const parseSodexoMenu = (sodexoDailyMenu) => {
  const coursesEn = [];
  const coursesFi = [];
  const courses = Object.values(sodexoDailyMenu);
  for (const course of courses) {
    coursesEn.push(`${course.title_en} (${course.dietcodes}, ${course.additionalDietInfo ? course.additionalDietInfo.allergens : 'No allergens'}) ${course.price}`);
    coursesFi.push(`${course.title_fi} (${course.dietcodes}, ${course.additionalDietInfo ? course.additionalDietInfo.allergens : 'Ei allergeenejä'}) ${course.price}`);
  }
  return {fi: coursesFi, en: coursesEn};
};

/**
 * Get daily menu from Sodexo API
 *
 * @async
 * @param {number} restaurantId
 * @param {string} lang
 * @param {string} date in ISO format (YYYY-MM-DD)
 * @return {Promise<Array>} Daily menu data
 */
const getDailyMenu = async (restaurantId, lang, date) => {
  let menuData;
  try {
    menuData = await fetchGetJson(`${dailyUrl}/${restaurantId}/${date}`);
  } catch (error) {
    throw new Error(error.message);
  }
  const parsedMenu = parseSodexoMenu(menuData.courses);
  return (lang === 'fi') ? parsedMenu.fi : parsedMenu.en;
};

const SodexoData = {getDailyMenu};
export default SodexoData;
