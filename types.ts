
export interface WeatherData {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    relative_humidity_2m: string;
    apparent_temperature: string;
    weather_code: string;
    wind_speed_10m: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  hourly_units: {
    time: string;
    temperature_2m: string;
    weather_code: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  daily_units: {
    time: string;
    weather_code: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    sunrise: string;
    sunset: string;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
  };
}

export interface ProcessedHourly {
    time: string;
    temperature_2m: number;
    weather_code: number;
}

export interface ProcessedDaily {
    time: string;
    weather_code: number;
    temperature_2m_max: number;
    temperature_2m_min: number;
}

export interface CombinedWeatherData {
    weatherData: WeatherData;
    processedHourly: ProcessedHourly[];
    processedDaily: ProcessedDaily[];
    aiInterpretation: string;
}
