const API_KEY = 'aa2e5ec578a180c792872490febac252'
const GEOCODING_URL = 'http://api.openweathermap.org/geo/1.0/direct?q='
const CURRENT_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather?units=metric&lat='
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast/daily?units=metric&lat='

var selectedLat = ''
var selectedLon = ''

//eraseAllCookies();

var favorites = [];
var cookie = getCookie('favoriteCities');
if(cookie != null){
  favorites = JSON.parse(cookie);
  for(var i = 0; i < favorites.length; i++){
    selectedLat = favorites[i][0];
    selectedLon = favorites[i][1];
    getCurrentWeather();
  }
}
console.log(favorites);

//Dom section
var placeInputField = document.getElementById('placeInput');
placeInputField.addEventListener('input', function(){
  placeSearch(placeInputField.value);
});

var daySelection = document.getElementById('daySelection');
daySelection.addEventListener('change', getForecast);

var resultsWrapper = document.getElementById('placeResults');

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
  getCurrentWeather();
  setInterval(getCurrentWeather, 600000);
  favoriteCity();
}

//Current weather section
function getCurrentWeather(){
  console.log('updated weather');
  axios.get(CURRENT_WEATHER_URL + selectedLat + '&lon=' + selectedLon + '&appid=' + API_KEY)
      .then(response => {
        showWeatherResult(response.data);
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

//Weather presentation section
function showWeatherResult(data){
  var wrapper = document.createElement('div');
  var cityName = document.createElement('h5');
  var descriptiveInformation = document.createElement('p');
  var temperature = document.createElement('p');
  var wind = document.createElement('p');
  var humidity = document.createElement('p');
  var pressure = document.createElement('p');
  var icon = document.createElement('img');

  cityName.innerText = data.name;
  descriptiveInformation.innerText = data.weather[0].description;
  icon.src = 'https://openweathermap.org/img/wn/' + data.weather[0].icon + '.png';
  temperature.innerText = data.main.temp
  wind.innerText = data.wind.speed + "@" + data.wind.deg
  humidity.innerText = data.main.humidity
  pressure.innerText = data.main.pressure

  wrapper.appendChild(cityName);
  wrapper.appendChild(icon);
  wrapper.appendChild(descriptiveInformation);
  wrapper.appendChild(temperature);
  wrapper.appendChild(wind);
  wrapper.appendChild(humidity);
  wrapper.appendChild(pressure);

  resultsWrapper.appendChild(wrapper);
}


function showForecastResult(city, data){
  var wrapper = document.createElement('div');
  var cityName = document.createElement('h5');
  var descriptiveInformation = document.createElement('p');
  var temperatureMax = document.createElement('p');
  var temperatureMin = document.createElement('p');
  var wind = document.createElement('p');
  var humidity = document.createElement('p');
  var pressure = document.createElement('p');
  var icon = document.createElement('img');

  cityName.innerText = city.name;
  descriptiveInformation.innerText = data.weather[0].description;
  icon.src = 'https://openweathermap.org/img/wn/' + data.weather[0].icon + '.png';
  temperatureMax.innerText = data.temp.max;
  temperatureMin.innerText = data.temp.min;
  wind.innerText = data.speed + "@" + data.deg
  humidity.innerText = data.humidity
  pressure.innerText = data.pressure

  wrapper.appendChild(cityName);
  wrapper.appendChild(icon);
  wrapper.appendChild(descriptiveInformation);
  wrapper.appendChild(temperatureMax);
  wrapper.appendChild(temperatureMin);
  wrapper.appendChild(wind);
  wrapper.appendChild(humidity);
  wrapper.appendChild(pressure);

  resultsWrapper.appendChild(wrapper);

}

//Favoriting section
function favoriteCity(){
  favorites.push([selectedLat, selectedLon]);
  setCookie('favoriteCities', JSON.stringify(favorites), 7);
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
