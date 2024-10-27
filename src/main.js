const API_KEY = 'aa2e5ec578a180c792872490febac252';
const GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/direct?q=`;
const CURRENT_WEATHER_URL = `https://api.openweathermap.org/data/2.5/weather?units=metric&lat=`;
const FORECAST_URL = `https://api.openweathermap.org/data/2.5/forecast/daily?units=metric&lat=`;
const ICON_URL = `https://openweathermap.org/img/wn/`;

let selectedLat = null;
let selectedLon = null;

// DOM section
const placeInputField = document.getElementById('placeInput');
placeInputField.addEventListener('input', handlePlaceSearch);

const daySelection = document.getElementById('daySelection');
daySelection.addEventListener('change', getForecast);

const resultsWrapper = document.getElementById('placeResults');
const currentWeatherResults = document.getElementById('currentWeatherResults');
const forecastResults = document.getElementById('forecastResults');
const favoritesResults = document.getElementById('favoritesResults');

let favorites = [];
loadFavorites();

// Utility functions for DOM manipulation
function clearContainer(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

function createElement(type, className, innerText) {
  const element = document.createElement(type);
  if (className) element.className = className;
  if (innerText) element.innerText = innerText;
  return element;
}

function appendChildren(parent, children) {
  children.forEach(child => parent.appendChild(child));
}

// Rounding function
function roundToTwoDecimal(value) {
  return Math.round(value * 100) / 100;
}

// Places search section
async function handlePlaceSearch(event) {
  const value = event.target.value;
  if (value !== "") {
    resultsWrapper.innerHTML = '<p>Fetching results, please hold...</p>';
    try {
      const response = await axios.get(`${GEOCODING_URL}${value}&limit=5&appid=${API_KEY}`);
      updatePlaces(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  } else {
    updatePlaces(null);
  }
}

function updatePlaces(data) {
  clearContainer(resultsWrapper);
  if (data) {
    data.forEach((place, i) => {
      const button = createElement('button', null, `${place.name}, ${place.country}`);
      button.id = `placeResult${i}`;
      button.setAttribute('data-lat', roundToTwoDecimal(place.lat));
      button.setAttribute('data-lon', roundToTwoDecimal(place.lon));
      button.addEventListener('click', () => pickPlace(button));
      const li = createElement('li', null, null);
      li.appendChild(button);
      resultsWrapper.appendChild(li);
    });
  }
}

function pickPlace(button) {
  placeInputField.value = button.innerText;
  selectedLat = roundToTwoDecimal(parseFloat(button.getAttribute('data-lat')));
  selectedLon = roundToTwoDecimal(parseFloat(button.getAttribute('data-lon')));
  clearContainer(resultsWrapper);
  clearContainer(currentWeatherResults);
  clearContainer(forecastResults);
  getCurrentWeather(false);
  setInterval(getCurrentWeather, 600000);
  if(daySelection.value != ''){
    getForecast();
  };
}

// Current weather section
async function getCurrentWeather(isFavorite) {
  if (!isFavorite) {
    currentWeatherResults.innerHTML = '<p>Fetching results, please hold...</p>';
  }
  try {
    const response = await axios.get(`${CURRENT_WEATHER_URL}${selectedLat}&lon=${selectedLon}&appid=${API_KEY}`);
    if (!isFavorite) {
      clearContainer(currentWeatherResults);
    }
    showWeatherResult(response.data, isFavorite);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Forecast section
async function getForecast() {
  const numberOfDays = daySelection.value;
  if(selectedLat === null || selectedLon === null){
    forecastResults.innerHTML = '<p>Please select a city to look up the forecast</p>';
    return;
  }
  forecastResults.innerHTML = '<p>Fetching results, please hold...</p>';
  try {
    const response = await axios.get(`${FORECAST_URL}${selectedLat}&lon=${selectedLon}&cnt=${numberOfDays}&appid=${API_KEY}`);
    clearContainer(forecastResults);
    response.data.list.forEach(day => showForecastResult(response.data.city, day));
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Weather presentation section
function showWeatherResult(data, isFavorite) {
  const wrapper = createElement('div', 'border border-blue-700 rounded-lg p-4 my-4 bg-white bg-opacity-30');
  
  const headline = createElement('h3', 'text-xl font-bold mb-2', 'Current Weather');
  const cityInfo = createElement('div', 'flex items-center mb-2 justify-between');

  const cityNameWrapper = createElement('div', 'flex items-center');
  const cityIcon = createElement('i', 'fas fa-city mr-2');
  const cityName = createElement('h5', 'text-lg font-semibold', data.name);
  appendChildren(cityNameWrapper, [cityIcon, cityName]);

  const favoriteButton = createElement('button');
  const locationData = [roundToTwoDecimal(selectedLat), roundToTwoDecimal(selectedLon)];
  const contains = favorites.some(ele => JSON.stringify(ele) === JSON.stringify(locationData));
  
  favoriteButton.className = contains ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
  favoriteButton.addEventListener('click', () => {
    if (contains) {
      unfavoriteCity(data.coord.lat, data.coord.lon, favoriteButton);
    } else {
      favoriteCity(roundToTwoDecimal(data.coord.lat), roundToTwoDecimal(data.coord.lon), favoriteButton);
    }
  });

  cityInfo.appendChild(cityNameWrapper);
  cityInfo.appendChild(favoriteButton);

  const infoWrapper = createElement('div', 'grid grid-cols-2 gap-4');
  
  const icon = createElement('img');
  icon.src = `${ICON_URL}${data.weather[0].icon}.png`;
  icon.className = 'col-span-2 mx-auto';

  const details = [
    createElement('p', null, `Description: ${data.weather[0].description}`),
    createElement('p', null, `Temp: ${data.main.temp} °C`),
    createElement('p', null, `Wind: ${data.wind.speed} m/s ${data.wind.deg}°`),
    createElement('p', null, `Humidity: ${data.main.humidity}%`),
    createElement('p', null, `Pressure: ${data.main.pressure} hPa`)
  ];

  appendChildren(infoWrapper, [icon, ...details]);
  appendChildren(wrapper, [headline, cityInfo, infoWrapper]);

  if (isFavorite) {
    favoritesResults.appendChild(wrapper);
  } else {
    currentWeatherResults.appendChild(wrapper);
    currentWeatherResults.setAttribute('data-lat', roundToTwoDecimal(data.coord.lat));
    currentWeatherResults.setAttribute('data-lon', roundToTwoDecimal(data.coord.lon));
  }
}

function showForecastResult(city, data) {
  const wrapper = createElement('div', 'border border-blue-700 rounded-lg p-4 my-4 bg-white bg-opacity-30');

  const headline = createElement('h3', 'text-xl font-bold mb-2', `Forecast: ${convertTimestampToDateTime(data.dt)}`);
  const cityInfo = createElement('div', 'flex items-center mb-2 justify-between');
  const cityNameWrapper = createElement('div', 'flex items-center');
  
  const cityIcon = createElement('i', 'fas fa-city mr-2');
  const cityName = createElement('h5', 'text-lg font-semibold', city.name);
  appendChildren(cityNameWrapper, [cityIcon, cityName]);

  cityInfo.appendChild(cityNameWrapper);

  const infoWrapper = createElement('div', 'grid grid-cols-2 gap-4');

  const details = [
    createElement('p', null, `Description: ${data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)}`),
    createElement('p', null, `Temp Max: ${data.temp.max} °C`),
    createElement('p', null, `Temp Min: ${data.temp.min} °C`),
    createElement('p', null, `Wind: ${data.speed} m/s ${data.deg}°`),
    createElement('p', null, `Humidity: ${data.humidity}%`),
    createElement('p', null, `Pressure: ${data.pressure} hPa`)
  ];

  const icon = createElement('img');
  icon.src = `${ICON_URL}${data.weather[0].icon}.png`;
  icon.className = 'col-span-2 mx-auto';

  appendChildren(infoWrapper, [icon, ...details]);
  appendChildren(wrapper, [headline, cityInfo, infoWrapper]);
  
  forecastResults.appendChild(wrapper);
}

function convertTimestampToDateTime(dt) {
  const date = new Date(dt * 1000);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

// Favoriting section
function favoriteCity(lat, lon, button) {
  favorites.push([roundToTwoDecimal(lat), roundToTwoDecimal(lon)]);
  button.className = 'fa-solid fa-heart';
  manageCookie('favoriteCities', JSON.stringify(favorites), 7);
  loadFavorites();
}

function unfavoriteCity(lat, lon, button) {
  const index = favorites.findIndex(fav => 
    fav[0] === roundToTwoDecimal(lat) && fav[1] === roundToTwoDecimal(lon)
  );
  favorites.splice(index, 1);
  button.className = 'fa-regular fa-heart';
  manageCookie('favoriteCities', JSON.stringify(favorites), 7);
  loadFavorites();
  checkCurrentResults(roundToTwoDecimal(lat), roundToTwoDecimal(lon));
}

function loadFavorites() {
  clearContainer(favoritesResults);
  const cookie = getCookie('favoriteCities');
  if (cookie != null) {
    favorites = JSON.parse(cookie);
    if (favorites.length === 0) {
      const headline = createElement('h3', 'text-xl font-bold mb-2', 'No favorites added yet');
      favoritesResults.appendChild(headline);
      return;
    }
    favorites.forEach(fav => {
      selectedLat = roundToTwoDecimal(fav[0]);
      selectedLon = roundToTwoDecimal(fav[1]);
      getCurrentWeather(true);
    });
  } else {
    const headline = createElement('h3', 'text-xl font-bold mb-2', 'No favorites added yet');
    favoritesResults.appendChild(headline);
  }
}

function checkCurrentResults(favLat, favLon) {
  const lat = roundToTwoDecimal(parseFloat(currentWeatherResults.getAttribute('data-lat')));
  const lon = roundToTwoDecimal(parseFloat(currentWeatherResults.getAttribute('data-lon')));
  if (lat && lon && favLat === lat && favLon === lon) {
    selectedLat = lat;
    selectedLon = lon;
    clearContainer(currentWeatherResults);
    getCurrentWeather(false);
    selectedLat = null;
    selectedLon = null;
  }
}

// Cookie management utility functions
function manageCookie(name, value, days) {
  if (value !== undefined) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = `${name}=${value || ""}${expires}; path=/`;
  } else {
    return getCookie(name);
  }
}

function getCookie(name) {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function eraseAllCookies() {
  const cookies = document.cookie.split(";");
  cookies.forEach(cookie => {
    const name = cookie.split("=")[0].trim();
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  });
}
