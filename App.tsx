import React, { useState, useEffect, useCallback } from 'react';
import type { WeatherData, ProcessedHourly, ProcessedDaily } from './types';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';

const WMO_CODES: { [key: number]: { description: string; icon: string; } } = {
  0: { description: 'Clear sky', icon: '☀️' },
  1: { description: 'Mainly clear', icon: '🌤️' },
  2: { description: 'Partly cloudy', icon: '⛅️' },
  3: { description: 'Overcast', icon: '☁️' },
  45: { description: 'Fog', icon: '🌫️' },
  48: { description: 'Depositing rime fog', icon: '🌫️' },
  51: { description: 'Light drizzle', icon: '🌦️' },
  53: { description: 'Moderate drizzle', icon: '🌦️' },
  55: { description: 'Dense drizzle', icon: '🌧️' },
  56: { description: 'Light freezing drizzle', icon: '🌨️' },
  57: { description: 'Dense freezing drizzle', icon: '🌨️' },
  61: { description: 'Slight rain', icon: '🌦️' },
  63: { description: 'Moderate rain', icon: '🌧️' },
  65: { description: 'Heavy rain', icon: '🌧️' },
  66: { description: 'Light freezing rain', icon: '🌨️' },
  67: { description: 'Heavy freezing rain', icon: '🌨️' },
  71: { description: 'Slight snow fall', icon: '🌨️' },
  73: { description: 'Moderate snow fall', icon: '❄️' },
  75: { description: 'Heavy snow fall', icon: '❄️' },
  77: { description: 'Snow grains', icon: '🌨️' },
  80: { description: 'Slight rain showers', icon: '🌦️' },
  81: { description: 'Moderate rain showers', icon: '🌧️' },
  82: { description: 'Violent rain showers', icon: '🌧️' },
  85: { description: 'Slight snow showers', icon: '🌨️' },
  86: { description: 'Heavy snow showers', icon: '❄️' },
  95: { description: 'Thunderstorm', icon: '⛈️' },
  96: { description: 'Thunderstorm with slight hail', icon: '⛈️' },
  99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' },
};

const App: React.FC = () => {
  const [latitude, setLatitude] = useState<string>('52.52');
  const [longitude, setLongitude] = useState<string>('13.41');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [processedHourly, setProcessedHourly] = useState<ProcessedHourly[]>([]);
  const [processedDaily, setProcessedDaily] = useState<ProcessedDaily[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = useCallback(async (lat: string, lon: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.reason || 'Failed to fetch weather data');
      }
      const data: WeatherData = await response.json();
      setWeatherData(data);

      const now = new Date();
      const currentHourIndex = data.hourly.time.findIndex(t => new Date(t) > now);
      
      const hourly = data.hourly.time.slice(currentHourIndex, currentHourIndex + 24).map((time, i) => ({
          time,
          temperature_2m: data.hourly.temperature_2m[currentHourIndex + i],
          weather_code: data.hourly.weather_code[currentHourIndex + i],
      }));
      setProcessedHourly(hourly);

      const daily = data.daily.time.map((time, i) => ({
          time,
          weather_code: data.daily.weather_code[i],
          temperature_2m_max: data.daily.temperature_2m_max[i],
          temperature_2m_min: data.daily.temperature_2m_min[i],
      }));
      setProcessedDaily(daily);

    } catch (err) {
      if (err instanceof Error) {
        setError(`Error fetching data: ${err.message}`);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchWeatherData(latitude, longitude);
  }, [fetchWeatherData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeatherData(latitude, longitude);
  };
  
  const currentHourData = weatherData && processedHourly.length > 0 ? weatherData.hourly.time.findIndex(t => t === processedHourly[0].time) : 0;
  
  return (
    <div className="bg-gray-800 min-h-screen text-white p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-cyan-300 tracking-tight">Weather Forecast</h1>
          <p className="mt-2 text-lg text-gray-400">Get the latest weather updates for any location.</p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-8 bg-gray-700/50 p-4 rounded-lg">
          <input
            type="text"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="Latitude (e.g., 52.52)"
            className="flex-1 bg-gray-800 p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <input
            type="text"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="Longitude (e.g., 13.41)"
            className="flex-1 bg-gray-800 p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-md transition-colors duration-300">
            Get Forecast
          </button>
        </form>

        <main>
          {loading && <Loader />}
          {error && <ErrorMessage message={error} />}
          {weatherData && !loading && !error && (
            <div className="space-y-8">
              {/* Current Weather */}
              <div className="bg-gray-700/50 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-gray-300">Current Weather in {weatherData.timezone.split('/')[1]?.replace('_', ' ')}</h2>
                <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div className="text-center sm:text-left">
                        <p className="text-6xl font-extrabold">{Math.round(weatherData.hourly.temperature_2m[currentHourData])}{weatherData.hourly_units.temperature_2m}</p>
                        <p className="text-xl text-gray-400">{WMO_CODES[weatherData.hourly.weather_code[currentHourData]]?.description}</p>
                    </div>
                    <div className="text-7xl my-4 sm:my-0">{WMO_CODES[weatherData.hourly.weather_code[currentHourData]]?.icon}</div>
                    <div className="text-sm text-gray-400 space-y-2 text-center sm:text-right">
                        <p>Feels like: {Math.round(weatherData.hourly.apparent_temperature[currentHourData])}°</p>
                        <p>Humidity: {weatherData.hourly.relative_humidity_2m[currentHourData]}%</p>
                        <p>Wind: {weatherData.hourly.wind_speed_10m[currentHourData]} km/h</p>
                    </div>
                </div>
              </div>

              {/* Hourly Forecast */}
              <div className="bg-gray-700/50 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-gray-300">Hourly Forecast</h2>
                <div className="flex overflow-x-auto space-x-4 pb-4">
                  {processedHourly.map((hour, i) => (
                    <div key={i} className="flex-shrink-0 text-center bg-gray-800/60 p-4 rounded-lg w-24">
                      <p className="font-medium">{new Date(hour.time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}</p>
                      <p className="text-3xl my-2">{WMO_CODES[hour.weather_code]?.icon}</p>
                      <p className="font-bold text-lg">{Math.round(hour.temperature_2m)}°</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 7-Day Forecast */}
              <div className="bg-gray-700/50 p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-gray-300">7-Day Forecast</h2>
                <div className="space-y-2">
                  {processedDaily.map((day, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-800/60 rounded-lg">
                      <p className="font-semibold w-1/4">{new Date(day.time).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                      <div className="flex items-center gap-3 w-1/4 justify-center">
                        <span className="text-3xl">{WMO_CODES[day.weather_code]?.icon}</span>
                      </div>
                       <p className="text-gray-400 w-1/4 text-right">L: {Math.round(day.temperature_2m_min)}°</p>
                       <p className="font-semibold w-1/4 text-right">H: {Math.round(day.temperature_2m_max)}°</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
