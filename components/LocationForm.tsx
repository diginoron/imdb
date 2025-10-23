import React from 'react';

interface LocationFormProps {
  latitude: string;
  longitude: string;
  setLatitude: (lat: string) => void;
  setLongitude: (lon: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleGetLocation: () => void;
  isLocationLoading: boolean;
}

const LocationForm: React.FC<LocationFormProps> = ({
  latitude,
  longitude,
  setLatitude,
  setLongitude,
  handleSubmit,
  handleGetLocation,
  isLocationLoading
}) => {
  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-8 bg-gray-700/50 p-4 rounded-lg">
      <input
        type="text"
        value={latitude}
        onChange={(e) => setLatitude(e.target.value)}
        placeholder="Latitude"
        className="flex-1 bg-gray-800 p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        aria-label="Latitude"
      />
      <input
        type="text"
        value={longitude}
        onChange={(e) => setLongitude(e.target.value)}
        placeholder="Longitude"
        className="flex-1 bg-gray-800 p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        aria-label="Longitude"
      />
       <button
        type="button"
        onClick={handleGetLocation}
        disabled={isLocationLoading}
        className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Use my current location"
        title="Use my current location"
      >
        {isLocationLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        )}
      </button>
      <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-md transition-colors duration-300">
        Get Forecast
      </button>
    </form>
  );
};

export default LocationForm;
