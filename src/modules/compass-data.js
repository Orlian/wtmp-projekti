import compassWeekMenu from '../assets/jsons/compass-data.json';

/**
 * Returns a daily menu array from compass json data
 * @param {Object} menuData
 * @param {number} dayOfWeek = Number of weekday, monday 0 - sunday 6
 * @returns {Array} daily menu
 */
const parseDailyMenu = (menuData, dayOfWeek) => {

  let dailyMenu = menuData.LunchMenus[dayOfWeek].SetMenus.map(setMenu => {
    console.log(setMenu);
    let mealName = setMenu.Name;
    let mealPrice = setMenu.Price ? setMenu.Price : '-';
    let dishes = setMenu.Meals.map(dish => {
      return `${dish.Name} (${dish.Diets ? dish.Diets.join(', ') : '-'})`;
    });
    return mealName ? `${mealName}: ${dishes.join(', ')} ${mealPrice}€` : `${dishes.join(', ')} ${mealPrice}€`;
  });
  return dailyMenu;
};

/**
 * Get daily menu from static compass-data.json file
 * @param {number} restaurant - Id of the restaurant
 * @param {string} lang - active language
 * @param {string} date in ISO format (YYYY-MM-DD)
 * @returns {Array} parsed daily menu
 */
const getDailyMenu = (restaurant, lang, date) => {
  // Get number of the weekday (0: Sun, 1: Mon, etc.)
  let dayOfWeek = new Date().getDay();
  // Fazer's index for Monday is 0, in JS it is 1
  dayOfWeek -= 1;
  if (dayOfWeek === -1) {
    dayOfWeek = 6;
  }
  let menuData = compassWeekMenu;
  console.log(menuData);
  return  parseDailyMenu(menuData, dayOfWeek);
};


const CompassData = {getDailyMenu};
export default CompassData;
