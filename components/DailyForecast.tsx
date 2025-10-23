import React from 'react';
import type { ProcessedDaily } from '../types';
import { WMO_CODES } from '../wmoCodes';

interface DailyForecastProps {
  processedDaily: ProcessedDaily[];
}

const DailyForecast: React.FC<DailyForecastProps> = ({ processedDaily }) => {
  return (
    <section aria-labelledby="daily-forecast-heading" className="bg-gray-700/50 p-6 rounded-xl shadow-lg">
      <h2 id="daily-forecast-heading" className="text-2xl font-semibold mb-4 text-gray-300">پیش‌بینی ۷ روز آینده</h2>
      <div className="space-y-2">
        {processedDaily.map((day, i) => {
          const weatherInfo = WMO_CODES[day.weather_code] || { description: 'نامشخص', icon: '❓' };
          return (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-800/60 rounded-lg">
              <p className="font-semibold w-1/3 text-right">{new Date(day.time).toLocaleDateString('fa-IR', { weekday: 'long' })}</p>
              <div className="flex items-center gap-3 w-1/3 justify-center">
                <span className="text-3xl" role="img" aria-label={weatherInfo.description}>{weatherInfo.icon}</span>
              </div>
              <div className="flex w-1/3 justify-end items-center gap-4">
                 <p className="font-semibold">حداکثر: {Math.round(day.temperature_2m_max)}°</p>
                 <p className="text-gray-400">حداقل: {Math.round(day.temperature_2m_min)}°</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DailyForecast;