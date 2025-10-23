import React from 'react';
import type { WeatherData } from '../types';
import { WMO_CODES } from '../wmoCodes';

interface CurrentWeatherProps {
  weatherData: WeatherData;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ weatherData }) => {
  const weatherInfo = WMO_CODES[weatherData.current.weather_code] || { description: 'Unknown', icon: '❓' };

  return (
    <section aria-labelledby="current-weather-heading" className="bg-gray-700/50 p-6 rounded-xl shadow-lg">
      <h2 id="current-weather-heading" className="text-2xl font-semibold mb-4 text-gray-300">Current Weather in {weatherData.timezone.split('/')[1]?.replace('_', ' ')}</h2>
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div className="text-center sm:text-left">
          <p className="text-6xl font-extrabold">{Math.round(weatherData.current.temperature_2m)}{weatherData.current_units.temperature_2m}</p>
          <p className="text-xl text-gray-400">{weatherInfo.description}</p>
        </div>
        <div className="text-7xl my-4 sm:my-0" role="img" aria-label={weatherInfo.description}>{weatherInfo.icon}</div>
        <div className="text-sm text-gray-400 space-y-2 text-center sm:text-right">
          <p>Feels like: {Math.round(weatherData.current.apparent_temperature)}°</p>
          <p>Humidity: {weatherData.current.relative_humidity_2m}%</p>
          <p>Wind: {weatherData.current.wind_speed_10m} km/h</p>
        </div>
      </div>
    </section>
  );
};

export default CurrentWeather;
