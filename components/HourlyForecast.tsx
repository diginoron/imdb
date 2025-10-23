import React from 'react';
import type { ProcessedHourly } from '../types';
import { WMO_CODES } from '../wmoCodes';

interface HourlyForecastProps {
  processedHourly: ProcessedHourly[];
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({ processedHourly }) => {
  return (
    <section aria-labelledby="hourly-forecast-heading" className="bg-gray-700/50 p-6 rounded-xl shadow-lg">
      <h2 id="hourly-forecast-heading" className="text-2xl font-semibold mb-4 text-gray-300">Hourly Forecast</h2>
      <div className="flex overflow-x-auto space-x-4 pb-4">
        {processedHourly.map((hour, i) => {
          const weatherInfo = WMO_CODES[hour.weather_code] || { description: 'Unknown', icon: '❓' };
          return (
            <div key={i} className="flex-shrink-0 text-center bg-gray-800/60 p-4 rounded-lg w-24">
              <p className="font-medium">{new Date(hour.time).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })}</p>
              <p className="text-3xl my-2" role="img" aria-label={weatherInfo.description}>{weatherInfo.icon}</p>
              <p className="font-bold text-lg">{Math.round(hour.temperature_2m)}°</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default HourlyForecast;
