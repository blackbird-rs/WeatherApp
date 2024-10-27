# Weather App

A simple weather application that allows users to search for current weather and forecast information for different locations. The app also supports adding favorite locations for quick access.

## Features

- **Search Locations**: Search for a location and get the current weather.
- **Current Weather**: View the current weather details including temperature, humidity, wind speed, and description.
- **Weather Forecast**: Get a multi-day weather forecast.
- **Favorite Locations**: Add locations to your favorites for quick access.
  
## Technologies Used

- **HTML5**
- **CSS**
- **JavaScript**
- **Axios**: For making HTTP requests.
- **OpenWeather API**: For fetching weather data.

## Getting Started

### Prerequisites

- Node.js and npm installed on your local machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/blackbird-rs/WeatherApp.git
   ```
2. Navigate into the project directory:
   ```bash
   cd WeatherApp/src
   ```

### Usage

1. Open the `index.html` file in your browser to view the app.

### Project Structure

- `index.html`: Main HTML file.
- `main.js`: JavaScript file containing the app logic.
- `styles.css`: Styling for the app.

### Main Functions

- **placeSearch(value)**: Searches for locations based on input value.
- **getCurrentWeather(isFavorite)**: Fetches current weather for the selected location.
- **getForecast()**: Fetches weather forecast for the selected location.
- **favoriteCity(lat, lon, button)**: Adds a location to favorites.
- **unfavoriteCity(lat, lon, button)**: Removes a location from favorites.
- **loadFavorites()**: Loads favorite locations from cookies.

## Contact

For any questions or suggestions, please contact me via email.
