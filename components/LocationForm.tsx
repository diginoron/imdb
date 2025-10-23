import React from 'react';

interface LocationFormProps {
  latitude: string;
  longitude: string;
  setLatitude: (lat: string) => void;
  setLongitude: (lon: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const LocationForm: React.FC<LocationFormProps> = ({
  latitude,
  longitude,
  setLatitude,
  setLongitude,
  handleSubmit,
}) => {
  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-8 bg-gray-700/50 p-4 rounded-lg">
      <input
        type="text"
        value={latitude}
        onChange={(e) => setLatitude(e.target.value)}
        placeholder="عرض جغرافیایی"
        className="flex-1 bg-gray-800 p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-right"
        aria-label="عرض جغرافیایی"
      />
      <input
        type="text"
        value={longitude}
        onChange={(e) => setLongitude(e.target.value)}
        placeholder="طول جغرافیایی"
        className="flex-1 bg-gray-800 p-3 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-right"
        aria-label="طول جغرافیایی"
      />
      <button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-md transition-colors duration-300">
        دریافت پیش‌بینی
      </button>
    </form>
  );
};

export default LocationForm;