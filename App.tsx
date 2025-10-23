import React, { useState, useEffect, useCallback } from 'react';
import type { WeatherData, ProcessedHourly, ProcessedDaily } from './types';
import { GoogleGenAI, Type } from "@google/genai";
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

  const fetchWeatherAndInterpretation = useCallback(async (lat: string, lon: string) => {
    setLoading(true);
    setError(null);
    setWeatherData(null);
    setAiInterpretation('');
    setProcessedDaily([]);
    setProcessedHourly([]);
    try {
      // 1. Fetch weather data from Open-Meteo
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`
      );
      if (!weatherResponse.ok) {
        const errorData = await weatherResponse.json();
        throw new Error(errorData.reason || "خطا در دریافت اطلاعات آب و هوا");
      }
      const weatherData: WeatherData = await weatherResponse.json();

      // 2. Process weather data for display
      const now = new Date();
      const currentHourIndex = weatherData.hourly.time.findIndex((t) => new Date(t) >= now) ?? 0;
      const hourly: ProcessedHourly[] = weatherData.hourly.time
        .slice(currentHourIndex, currentHourIndex + 24)
        .map((time, i) => ({
          time,
          temperature_2m: weatherData.hourly.temperature_2m[currentHourIndex + i],
          weather_code: weatherData.hourly.weather_code[currentHourIndex + i],
        }));
      const daily: ProcessedDaily[] = weatherData.daily.time.map((time, i) => ({
        time,
        weather_code: weatherData.daily.weather_code[i],
        temperature_2m_max: weatherData.daily.temperature_2m_max[i],
        temperature_2m_min: weatherData.daily.temperature_2m_min[i],
      }));

      // 3. Get AI interpretation from Gemini
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        throw new Error("کلید API یافت نشد.");
      }
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
          بر اساس داده‌های آب و هوای زیر برای شهر "${weatherData.timezone.split("/")[1]?.replace("_", " ")}"، یک تحلیل جذاب به زبان فارسی ارائه دهید.
          داده‌های آب و هوا:
          - دمای فعلی: ${Math.round(weatherData.current.temperature_2m)}°C
          - وضعیت فعلی: ${WMO_CODES[weatherData.current.weather_code]?.description || 'نامشخص'}
          - دمای احساسی: ${Math.round(weatherData.current.apparent_temperature)}°C
          - رطوبت: ${weatherData.current.relative_humidity_2m}%
          - سرعت باد: ${weatherData.current.wind_speed_10m} km/h
          - پیش‌بینی امروز: حداکثر ${Math.round(weatherData.daily.temperature_2m_max[0])}°C، حداقل ${Math.round(weatherData.daily.temperature_2m_min[0])}°C
          `;
      const geminiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: "یک پاراگراف خوانا و مفید درباره وضعیت فعلی و پیش‌بینی امروز به زبان فارسی.",
              },
              suggestion: {
                type: Type.STRING,
                description: "یک پیشنهاد سرگرم‌کننده یا یک نکته جالب مرتبط با این آب و هوا به زبان فارسی.",
              },
            },
            required: ["summary", "suggestion"],
          },
        },
      });
      
      const responseText = geminiResponse.text.trim();
      let aiJsonResponse;
      try {
          aiJsonResponse = JSON.parse(responseText);
      } catch (parseError) {
          const match = responseText.match(/```json\n([\s\S]*?)\n```/);
          if (match && match[1]) {
            aiJsonResponse = JSON.parse(match[1]);
          } else {
             throw new Error("خطا در پردازش پاسخ هوش مصنوعی.");
          }
      }
  
      if (!aiJsonResponse.summary || !aiJsonResponse.suggestion) {
          throw new Error("پاسخ هوش مصنوعی فاقد فیلدهای مورد نیاز است.");
      }
  
      const interpretation = `${aiJsonResponse.summary}\n\n**پیشنهاد خلاقانه:**\n${aiJsonResponse.suggestion}`;
      
      // 4. Update state with all data
      setWeatherData(weatherData);
      setProcessedHourly(hourly);
      setProcessedDaily(daily);
      setAiInterpretation(interpretation);

    } catch (err) {
      console.error("Full error object:", err); // Log the full error for debugging
      if (err instanceof Error) {
        setError(`خطا در دریافت اطلاعات: ${err.message}`);
      } else {
        setError('یک خطای ناشناخته رخ داده است.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const defaultLat = '52.52';
    const defaultLon = '13.41';
    setLatitude(defaultLat);
    setLongitude(defaultLon);
    fetchWeatherAndInterpretation(defaultLat, defaultLon);
  }, [fetchWeatherAndInterpretation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (latitude && longitude) {
        fetchWeatherAndInterpretation(latitude, longitude);
    } else {
        setError("لطفا عرض و طول جغرافیایی را به درستی وارد کنید.");
    }
  };
    
  return (
    <div className="bg-gray-800 min-h-screen text-white p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-cyan-300 tracking-tight">پیش‌بینی آب و هوا</h1>
          <p className="mt-2 text-lg text-gray-400">آخرین به‌روزرسانی‌های آب و هوا را برای موقعیت مکانی خود دریافت کنید.</p>
        </header>

        <LocationForm
          latitude={latitude}
          longitude={longitude}
          setLatitude={setLatitude}
          setLongitude={setLongitude}
          handleSubmit={handleSubmit}
        />

        <main>
          {loading && <Loader />}
          {error && !loading && <ErrorMessage message={error} />}
          {weatherData && !loading && !error && (
            <div className="space-y-8">
              <CurrentWeather weatherData={weatherData} />
              <HourlyForecast processedHourly={processedHourly} />
              <DailyForecast processedDaily={processedDaily} />
              <AiInterpretation aiInterpretation={aiInterpretation} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;