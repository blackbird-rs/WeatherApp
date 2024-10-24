const API_KEY = 'aa2e5ec578a180c792872490febac252'
const GEOCODING_URL = 'http://api.openweathermap.org/geo/1.0/direct?q='
const CURRENT_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather?lat='
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast/daily?lat='

var selectedLat = ''
var selectedLon = ''

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
}

//Current weather section
function getCurrentWeather(){
  console.log('updated weather');
  axios.get(CURRENT_WEATHER_URL + selectedLat + '&lon=' + selectedLon + '&appid=' + API_KEY)
      .then(response => {
        console.log(response.data);
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
        console.log(response.data);
        })
      .catch(error => {
        console.error('Error fetching data:', error);
        });  
}

