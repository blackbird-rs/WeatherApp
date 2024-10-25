const API_KEY = 'aa2e5ec578a180c792872490febac252'
const GEOCODING_URL = 'http://api.openweathermap.org/geo/1.0/direct?q='
const CURRENT_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather?units=metric&lat='
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast/daily?units=metric&lat='

var selectedLat = ''
var selectedLon = ''

var favorites = []; 
loadFavorites();

//Dom section
var placeInputField = document.getElementById('placeInput');
placeInputField.addEventListener('input', function(){
  placeSearch(placeInputField.value);
});

var daySelection = document.getElementById('daySelection');
daySelection.addEventListener('change', getForecast);

var resultsWrapper = document.getElementById('placeResults');
var currentWeatherResults = document.getElementById('currentWeatherResults');
var forecastResults = document.getElementById('forecastResults');
var favoritesResults = document.getElementById('favoritesResults');

//Places search section
function placeSearch(value) {
  if(value != ""){
    axios.get(GEOCODING_URL + value + '&limit=5&appid=' + API_KEY)
      .then(response => {
        updatePlaces(response.data);
        })
      .catch(error => {
        console.error('Error fetching data:', error);
        });
    }
  else{
    updatePlaces(null);
  }
}

function updatePlaces(data) {
  if (resultsWrapper) {
    while(resultsWrapper.firstChild){
      resultsWrapper.removeChild(resultsWrapper.firstChild);
    }
    if(data != null){
      for (var i = 0; i < data.length; i++) {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.id = 'placeResult' + i;
        button.setAttribute('data-lat', data[i].lat);
        button.setAttribute('data-lon', data[i].lon);
        button.onclick = function(){
          pickPlace(this);
        };
        button.innerText = data[i].name + ", " + data[i].country;
        li.appendChild(button);
        resultsWrapper.appendChild(li);
      }    
    }
  } 
  else {
    console.error(`No element found with id: placeResults`);
  }
}

function pickPlace(button){
  placeInputField.value = button.innerText;
  selectedLat = button.getAttribute('data-lat');
  selectedLon = button.getAttribute('data-lon');
  while(resultsWrapper.firstChild){
    resultsWrapper.removeChild(resultsWrapper.firstChild);
  }
  getCurrentWeather(false);
  setInterval(getCurrentWeather, 600000);
  favoriteCity();
}

//Current weather section
function getCurrentWeather(isFavorite){
  console.log('updated weather');
  axios.get(CURRENT_WEATHER_URL + selectedLat + '&lon=' + selectedLon + '&appid=' + API_KEY)
      .then(response => {
        showWeatherResult(response.data, isFavorite);
        })
      .catch(error => {
        console.error('Error fetching data:', error);
        });
}

//Forecast section
function getForecast(){
  var numberOfDays = daySelection.value;
  axios.get(FORECAST_URL + selectedLat + '&lon=' + selectedLon + '&cnt=' + numberOfDays + '&appid=' + API_KEY)
      .then(response => {
          for(var i = 0; i < response.data.list.length; i++){
            showForecastResult(response.data.city, response.data.list[i]);
          }
        })
      .catch(error => {
        console.error('Error fetching data:', error);
        });  
}

// Weather presentation section
function showWeatherResult(data, isFavorite) {
  var wrapper = document.createElement('div');
  wrapper.className = 'border border-blue-700 rounded-lg p-4 my-4 bg-white bg-opacity-30';

  var headline = document.createElement('h3');
  headline.innerText = 'Current Weather';
  headline.className = 'text-xl font-bold mb-2';

  var cityInfo = document.createElement('div');
  cityInfo.className = 'flex items-center mb-2';

  var cityIcon = document.createElement('i');
  cityIcon.className = 'fas fa-city mr-2';

  var cityName = document.createElement('h5');
  cityName.innerText = data.name;
  cityName.className = 'text-lg font-semibold';

  cityInfo.appendChild(cityIcon);
  cityInfo.appendChild(cityName);

  var infoWrapper = document.createElement('div');
  infoWrapper.className = 'grid grid-cols-2 gap-4';

  var descriptiveInformation = document.createElement('p');
  descriptiveInformation.innerText = 'Description: ' + data.weather[0].description;

  var temperature = document.createElement('p');
  temperature.innerText = 'Temp: ' + data.main.temp + ' °C';

  var wind = document.createElement('p');
  wind.innerText = 'Wind: ' + data.wind.speed + ' m/s ' + data.wind.deg + '°';

  var humidity = document.createElement('p');
  humidity.innerText = 'Humidity: ' + data.main.humidity + '%';

  var pressure = document.createElement('p');
  pressure.innerText = 'Pressure: ' + data.main.pressure + ' hPa';

  var icon = document.createElement('img');
  icon.src = 'https://openweathermap.org/img/wn/' + data.weather[0].icon + '.png';
  icon.className = 'col-span-2 mx-auto';

  infoWrapper.appendChild(icon);
  infoWrapper.appendChild(descriptiveInformation);
  infoWrapper.appendChild(temperature);
  infoWrapper.appendChild(wind);
  infoWrapper.appendChild(humidity);
  infoWrapper.appendChild(pressure);

  wrapper.appendChild(headline);
  wrapper.appendChild(cityInfo);
  wrapper.appendChild(infoWrapper);

  if (isFavorite) {
    favoritesResults.appendChild(wrapper);
  } else {
    currentWeatherResults.appendChild(wrapper);
  }
}

function showForecastResult(city, data) {
  var wrapper = document.createElement('div');
  wrapper.className = 'border border-blue-700 rounded-lg p-4 my-4 bg-white bg-opacity-30';

  var headline = document.createElement('h3');
  headline.innerText = 'Forecast: ' + convertTimestampToDateTime(data.dt);
  headline.className = 'text-xl font-bold mb-2';

  var cityInfo = document.createElement('div');
  cityInfo.className = 'flex items-center mb-2';

  var cityIcon = document.createElement('i');
  cityIcon.className = 'fas fa-city mr-2';

  var cityName = document.createElement('h5');
  cityName.innerText = city.name;
  cityName.className = 'text-lg font-semibold';

  cityInfo.appendChild(cityIcon);
  cityInfo.appendChild(cityName);

  var infoWrapper = document.createElement('div');
  infoWrapper.className = 'grid grid-cols-2 gap-4';

  var descriptiveInformation = document.createElement('p');
  descriptiveInformation.innerText = 'Description: ' + data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1);

  var temperatureMax = document.createElement('p');
  temperatureMax.innerText = 'Temp Max: ' + data.temp.max + ' °C';

  var temperatureMin = document.createElement('p');
  temperatureMin.innerText = 'Temp Min: ' + data.temp.min + ' °C';

  var wind = document.createElement('p');
  wind.innerText = 'Wind: ' + data.speed + ' m/s ' + data.deg + '°';

  var humidity = document.createElement('p');
  humidity.innerText = 'Humidity: ' + data.humidity + '%';

  var pressure = document.createElement('p');
  pressure.innerText = 'Pressure: ' + data.pressure + ' hPa';

  var icon = document.createElement('img');
  icon.src = 'https://openweathermap.org/img/wn/' + data.weather[0].icon + '.png';
  icon.className = 'col-span-2 mx-auto';

  infoWrapper.appendChild(icon);
  infoWrapper.appendChild(descriptiveInformation);
  infoWrapper.appendChild(temperatureMax);
  infoWrapper.appendChild(temperatureMin);
  infoWrapper.appendChild(wind);
  infoWrapper.appendChild(humidity);
  infoWrapper.appendChild(pressure);

  wrapper.appendChild(headline);
  wrapper.appendChild(cityInfo);
  wrapper.appendChild(infoWrapper);

  forecastResults.appendChild(wrapper);
}

function convertTimestampToDateTime(dt) {
  const date = new Date(dt * 1000);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = String(date.getFullYear()).slice(-2);

  return `${day}/${month}/${year}`;
}

//Favoriting section
function favoriteCity(){
  favorites.push([selectedLat, selectedLon]);
  setCookie('favoriteCities', JSON.stringify(favorites), 7);
  console.log(favorites);
}

function loadFavorites() {
  //eraseAllCookies();

  var cookie = getCookie('favoriteCities');
  if(cookie != null){
    favorites = JSON.parse(cookie);
    for(var i = 0; i < favorites.length; i++){
      selectedLat = favorites[i][0];
      selectedLon = favorites[i][1];
      getCurrentWeather(true);
    }
  }
  console.log(favorites);
}

function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function eraseAllCookies() {
  var cookies = document.cookie.split(";");

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var eqPos = cookie.indexOf("=");
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  }
}

