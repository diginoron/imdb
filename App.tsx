
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
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
  const [aiInterpretation, setAiInterpretation] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const getAiInterpretation = useCallback(async (data: WeatherData) => {
    setIsAiLoading(true);
    setAiInterpretation('');

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const prompt = `
        شما یک دستیار هواشناسی خوش‌برخورد و خلاق هستید. بر اساس داده‌های آب و هوای زیر برای شهر "${data.timezone.split('/')[1]?.replace('_', ' ')}"، یک تحلیل جذاب به زبان فارسی ارائه دهید.

        تحلیل شما باید شامل دو بخش باشد:
        1.  **خلاصه وضعیت:** یک پاراگراف خوانا و مفید درباره وضعیت فعلی و پیش‌بینی امروز.
        2.  **پیشنهاد خلاقانه:** بعد از خلاصه، یک پیشنهاد سرگرم‌کننده یا یک نکته جالب مرتبط با این آب و هوا ارائه دهید. این بخش را با عنوان **"پیشنهاد خلاقانه:"** شروع کنید.

        داده‌های آب و هوا:
        - دمای فعلی: ${Math.round(data.current.temperature_2m)}°C
        - وضعیت فعلی: ${WMO_CODES[data.current.weather_code]?.description}
        - دمای احساسی: ${Math.round(data.current.apparent_temperature)}°C
        - رطوبت: ${data.current.relative_humidity_2m}%
        - سرعت باد: ${data.current.wind_speed_10m} km/h
        - پیش‌بینی امروز: حداکثر ${Math.round(data.daily.temperature_2m_max[0])}°C، حداقل ${Math.round(data.daily.temperature_2m_min[0])}°C
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        setAiInterpretation(response.text);

    } catch (err) {
        console.error("Error generating AI interpretation:", err);
        let errorMessage = "متاسفانه در دریافت تحلیل هوش مصنوعی خطایی رخ داد.";
        if (err instanceof Error && err.message.toLowerCase().includes('api key')) {
          errorMessage = "خطا: کلید API برای Gemini تنظیم نشده یا نامعتبر است. لطفاً متغیر محیطی API_KEY را بررسی کنید.";
        }
        setAiInterpretation(errorMessage);
    } finally {
        setIsAiLoading(false);
    }
  }, []);

  const fetchWeatherData = useCallback(async (lat: string, lon: string) => {
    setLoading(true);
    setError(null);
    setWeatherData(null);
    setAiInterpretation('');

    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.reason || 'Failed to fetch weather data');
      }
      const data: WeatherData = await response.json();
      setWeatherData(data);

      const now = new Date();
      const currentHourIndex = data.hourly.time.findIndex(t => new Date(t) >= now) ?? 0;
      
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

      await getAiInterpretation(data);

    } catch (err) {
      if (err instanceof Error) {
        setError(`Error fetching data: ${err.message}`);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, [getAiInterpretation]);
  
  useEffect(() => {
    fetchWeatherData('52.52', '13.41');
  }, [fetchWeatherData]); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeatherData(latitude, longitude);
  };
    
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
            aria-label="Latitude"
          />
          <input
            type="text"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="Longitude (e.g., 13.41)"
            className="flex-1 bg-gray-800 p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            aria-label="Longitude"
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
              <section aria-labelledby="current-weather-heading" className="bg-gray-700/50 p-6 rounded-xl shadow-lg">
                <h2 id="current-weather-heading" className="text-2xl font-semibold mb-4 text-gray-300">Current Weather in {weatherData.timezone.split('/')[1]?.replace('_', ' ')}</h2>
                <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div className="text-center sm:text-left">
                        <p className="text-6xl font-extrabold">{Math.round(weatherData.current.temperature_2m)}{weatherData.current_units.temperature_2m}</p>
                        <p className="text-xl text-gray-400">{WMO_CODES[weatherData.current.weather_code]?.description}</p>
                    </div>
                    <div className="text-7xl my-4 sm:my-0" role="img" aria-label={WMO_CODES[weatherData.current.weather_code]?.description}>{WMO_CODES[weatherData.current.weather_code]?.icon}</div>
                    <div className="text-sm text-gray-400 space-y-2 text-center sm:text-right">
                        <p>Feels like: {Math.round(weatherData.current.apparent_temperature)}°</p>
                        <p>Humidity: {weatherData.current.relative_humidity_2m}%</p>
                        <p>Wind: {weatherData.current.wind_speed_10m} km/h</p>
                    </div>
                </div>
              </section>

              {/* Hourly Forecast */}
              <section aria-labelledby="hourly-forecast-heading" className="bg-gray-700/50 p-6 rounded-xl shadow-lg">
                <h2 id="hourly-forecast-heading" className="text-2xl font-semibold mb-4 text-gray-300">Hourly Forecast</h2>
                <div className="flex overflow-x-auto space-x-4 pb-4">
                  {processedHourly.map((hour, i) => (
                    <div key={i} className="flex-shrink-0 text-center bg-gray-800/60 p-4 rounded-lg w-24">
                      <p className="font-medium">{new Date(hour.time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}</p>
                      <p className="text-3xl my-2" role="img" aria-label={WMO_CODES[hour.weather_code]?.description}>{WMO_CODES[hour.weather_code]?.icon}</p>
                      <p className="font-bold text-lg">{Math.round(hour.temperature_2m)}°</p>
                    </div>
                  ))}
                </div>
              </section>
              
              {/* 7-Day Forecast */}
              <section aria-labelledby="daily-forecast-heading" className="bg-gray-700/50 p-6 rounded-xl shadow-lg">
                <h2 id="daily-forecast-heading" className="text-2xl font-semibold mb-4 text-gray-300">7-Day Forecast</h2>
                <div className="space-y-2">
                  {processedDaily.map((day, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-800/60 rounded-lg">
                      <p className="font-semibold w-1/4">{new Date(day.time).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                      <div className="flex items-center gap-3 w-1/4 justify-center">
                        <span className="text-3xl" role="img" aria-label={WMO_CODES[day.weather_code]?.description}>{WMO_CODES[day.weather_code]?.icon}</span>
                      </div>
                       <p className="text-gray-400 w-1/4 text-right">L: {Math.round(day.temperature_2m_min)}°</p>
                       <p className="font-semibold w-1/4 text-right">H: {Math.round(day.temperature_2m_max)}°</p>
                    </div>
                  ))}
                </div>
              </section>
                
              {/* AI Interpretation */}
               <section aria-labelledby="ai-interpretation-heading" className="bg-gray-700/50 p-6 rounded-xl shadow-lg">
                <h2 id="ai-interpretation-heading" className="text-2xl font-semibold mb-4 text-cyan-300 flex items-center gap-3" dir="rtl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M12 21v-1m0-16a7 7 0 110 14 7 7 0 010-14z" />
                    </svg>
                    تحلیل هوش مصنوعی
                </h2>
                {isAiLoading ? (
                  <div className="flex justify-center items-center py-4" aria-live="polite" aria-busy="true">
                     <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                     <span className="sr-only">Loading AI interpretation</span>
                  </div>
                ) : (
                  <p className="text-gray-300 leading-relaxed text-right whitespace-pre-line" dir="rtl">
                    {aiInterpretation}
                  </p>
                )}
              </section>

            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
