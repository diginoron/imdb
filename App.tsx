import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import type { WeatherData, ProcessedHourly, ProcessedDaily } from './types';
import { WMO_CODES } from './wmoCodes';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';
import LocationForm from './components/LocationForm';
import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import AiInterpretation from './components/AiInterpretation';

const App: React.FC = () => {
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [processedHourly, setProcessedHourly] = useState<ProcessedHourly[]>([]);
  const [processedDaily, setProcessedDaily] = useState<ProcessedDaily[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [aiInterpretation, setAiInterpretation] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [isLocationLoading, setIsLocationLoading] = useState<boolean>(true);

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

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported. Showing default location.");
      setLatitude('52.52');
      setLongitude('13.41');
      fetchWeatherData('52.52', '13.41');
      setIsLocationLoading(false);
      return;
    }
    setIsLocationLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lon } = position.coords;
        setLatitude(lat.toFixed(2));
        setLongitude(lon.toFixed(2));
        fetchWeatherData(lat.toFixed(2), lon.toFixed(2));
        setIsLocationLoading(false);
      },
      (err) => {
        setError(`Location access denied: ${err.message}. Showing default location.`);
        setLatitude('52.52');
        setLongitude('13.41');
        fetchWeatherData('52.52', '13.41');
        setIsLocationLoading(false);
      }
    );
  }, [fetchWeatherData]);

  useEffect(() => {
    handleGetLocation();
  }, [handleGetLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (latitude && longitude) {
        fetchWeatherData(latitude, longitude);
    } else {
        setError("Please provide both latitude and longitude.");
    }
  };
    
  return (
    <div className="bg-gray-800 min-h-screen text-white p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-cyan-300 tracking-tight">Weather Forecast</h1>
          <p className="mt-2 text-lg text-gray-400">Get the latest weather updates for your location.</p>
        </header>

        <LocationForm
          latitude={latitude}
          longitude={longitude}
          setLatitude={setLatitude}
          setLongitude={setLongitude}
          handleSubmit={handleSubmit}
          handleGetLocation={handleGetLocation}
          isLocationLoading={isLocationLoading}
        />

        <main>
          {loading && <Loader />}
          {error && !loading && <ErrorMessage message={error} />}
          {weatherData && !loading && !error && (
            <div className="space-y-8">
              <CurrentWeather weatherData={weatherData} />
              <HourlyForecast processedHourly={processedHourly} />
              <DailyForecast processedDaily={processedDaily} />
              <AiInterpretation aiInterpretation={aiInterpretation} isAiLoading={isAiLoading} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
