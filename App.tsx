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
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const fetchWeather = useCallback(async (lat: string, lon: string): Promise<WeatherData | null> => {
    setLoading(true);
    setError(null);
    setWeatherData(null);
    setAiInterpretation('');
    setProcessedDaily([]);
    setProcessedHourly([]);

    try {
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`
      );

      if (!weatherResponse.ok) {
        const errorData = await weatherResponse.json().catch(() => ({ reason: "پاسخ نامعتبر از سرور" }));
        throw new Error(errorData.reason || "خطا در دریافت اطلاعات آب و هوا");
      }
      const weatherDataResult: WeatherData = await weatherResponse.json();
      
      const now = new Date();
      const currentHourIndex = weatherDataResult.hourly.time.findIndex((t) => new Date(t) >= now) ?? 0;
      const hourly: ProcessedHourly[] = weatherDataResult.hourly.time
        .slice(currentHourIndex, currentHourIndex + 24)
        .map((time, i) => ({
          time,
          temperature_2m: weatherDataResult.hourly.temperature_2m[currentHourIndex + i],
          weather_code: weatherDataResult.hourly.weather_code[currentHourIndex + i],
        }));
      const daily: ProcessedDaily[] = weatherDataResult.daily.time.map((time, i) => ({
        time,
        weather_code: weatherDataResult.daily.weather_code[i],
        temperature_2m_max: weatherDataResult.daily.temperature_2m_max[i],
        temperature_2m_min: weatherDataResult.daily.temperature_2m_min[i],
      }));
      
      setWeatherData(weatherDataResult);
      setProcessedHourly(hourly);
      setProcessedDaily(daily);
      return weatherDataResult;
    } catch (err) {
      console.error("Weather Fetch Error:", err);
      if (err instanceof Error) {
        setError(`خطا در دریافت اطلاعات آب و هوا: ${err.message}`);
      } else {
        setError('یک خطای ناشناخته در دریافت اطلاعات آب و هوا رخ داده است.');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAiInterpretation = useCallback(async (weatherDataResult: WeatherData) => {
    setIsAiLoading(true);
    setAiInterpretation("");
    try {
      // The explicit check for the API key has been removed.
      // We now rely on the GenAI SDK to handle the case where process.env.API_KEY is undefined,
      // which will provide a more direct and transparent error message to the developer.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
          بر اساس داده‌های آب و هوای زیر برای شهر "${weatherDataResult.timezone.split("/")[1]?.replace("_", " ")}"، یک تحلیل جذاب به زبان فارسی ارائه دهید.
          داده‌های آب و هوا:
          - دمای فعلی: ${Math.round(weatherDataResult.current.temperature_2m)}°C
          - وضعیت فعلی: ${WMO_CODES[weatherDataResult.current.weather_code]?.description || 'نامشخص'}
          - دمای احساسی: ${Math.round(weatherDataResult.current.apparent_temperature)}°C
          - رطوبت: ${weatherDataResult.current.relative_humidity_2m}%
          - سرعت باد: ${weatherDataResult.current.wind_speed_10m} km/h
          - پیش‌بینی امروز: حداکثر ${Math.round(weatherDataResult.daily.temperature_2m_max[0])}°C، حداقل ${Math.round(weatherDataResult.daily.temperature_2m_min[0])}°C
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
          const match = responseText.match(/` + "```" + `json\n([\\s\\S]*?)\n` + "```" + `/);
          if (match && match[1]) {
            aiJsonResponse = JSON.parse(match[1]);
          } else {
             throw new Error("خطا در پردازش پاسخ هوش مصنوعی.");
          }
      }
  
      if (!aiJsonResponse.summary || !aiJsonResponse.suggestion) {
          throw new Error("پاسخ هوش مصنوعی فاقد فیلدهای مورد نیاز است.");
      }
  
      const interpretation = `${aiJsonResponse.summary}\n\nپیشنهاد خلاقانه:\n${aiJsonResponse.suggestion}`;
      setAiInterpretation(interpretation);

    } catch (aiError) {
      console.error("AI Interpretation Error:", aiError);
      if (aiError instanceof Error) {
        setAiInterpretation(`تحلیل هوش مصنوعی با خطا مواجه شد. لطفاً کنسول مرورگر را برای جزئیات فنی بررسی کنید. پیام خطا: ${aiError.message}`);
      } else {
        setAiInterpretation("متاسفانه تحلیل هوش مصنوعی در حال حاضر در دسترس نیست. یک خطای ناشناخته رخ داده است.");
      }
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  const handleFetchData = useCallback(async (lat: string, lon: string) => {
    const weatherDataResult = await fetchWeather(lat, lon);
    if (weatherDataResult) {
      await fetchAiInterpretation(weatherDataResult);
    }
  }, [fetchWeather, fetchAiInterpretation]);

  useEffect(() => {
    const defaultLat = '52.52';
    const defaultLon = '13.41';
    setLatitude(defaultLat);
    setLongitude(defaultLon);
    handleFetchData(defaultLat, defaultLon);
  }, [handleFetchData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (latitude && longitude) {
        handleFetchData(latitude, longitude);
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
              <AiInterpretation aiInterpretation={aiInterpretation} isLoading={isAiLoading} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;