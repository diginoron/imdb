import React from 'react';
import type { ProcessedDaily } from '../types';
import { WMO_CODES } from '../wmoCodes';

interface DailyForecastProps {
  processedDaily: ProcessedDaily[];
}

const DailyForecast: React.FC<DailyForecastProps> = ({ processedDaily }) => {
  return (
    <section aria-labelledby="daily-forecast-heading" className="bg-gray-700/50 p-6 rounded-xl shadow-lg">
      <h2 id="daily-forecast-heading" className="text-2xl font-semibold mb-4 text-gray-300">7-Day Forecast</h2>
      <div className="space-y-2">
        {processedDaily.map((day, i) => {
          const weatherInfo = WMO_CODES[day.weather_code] || { description: 'Unknown', icon: '❓' };
          return (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-800/60 rounded-lg">
              <p className="font-semibold w-1/4">{new Date(day.time).toLocaleDateString('en-US', { weekday: 'long' })}</p>
              <div className="flex items-center gap-3 w-1/4 justify-center">
                <span className="text-3xl" role="img" aria-label={weatherInfo.description}>{weatherInfo.icon}</span>
              </div>
              <p className="text-gray-400 w-1/4 text-right">L: {Math.round(day.temperature_2m_min)}°</p>
              <p className="font-semibold w-1/4 text-right">H: {Math.round(day.temperature_2m_max)}°</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default DailyForecast;
