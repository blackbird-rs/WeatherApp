const API_KEY = 'aa2e5ec578a180c792872490febac252'
const GEOCODING_URL = 'http://api.openweathermap.org/geo/1.0/direct?q='

var placeInputField = document.getElementById('placeInput');
placeInputField.addEventListener('input', function() {
  placeSearch(placeInputField.value);
});

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
  var resultsWrapper = document.getElementById('placeResults');
  if (resultsWrapper) {
    while(resultsWrapper.firstChild){
      resultsWrapper.removeChild(resultsWrapper.firstChild);
    }
    if(data != null){
      for (var i = 0; i < data.length; i++) {
        const li = document.createElement('li');
        li.textContent = data[i].name + ", " + data[i].country + ", " + data[i].lat + ", " + data[i].lon;
        resultsWrapper.appendChild(li);
      }
    }
  } 
  else {
    console.error(`No element found with id: placeResults`);
  }
}