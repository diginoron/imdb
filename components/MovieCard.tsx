
import React from 'react';
import type { MovieDetails } from '../types';

interface MovieCardProps {
  movie: MovieDetails;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden animate-fade-in">
      <div className="md:flex">
        <div className="md:flex-shrink-0">
          <img
            className="h-full w-full object-cover md:w-64"
            src={movie.poster}
            alt={`Poster of ${movie.title}`}
          />
        </div>
        <div className="p-6 sm:p-8">
          <div className="uppercase tracking-wide text-sm text-yellow-400 font-semibold">
            {movie.year} &bull; {movie.length}
          </div>
          <h1 className="block mt-1 text-2xl sm:text-3xl leading-tight font-bold text-white">
            {movie.title}
          </h1>
          {movie.rating && (
            <div className="flex items-center mt-2">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-white font-bold text-lg ml-2">{movie.rating} / 10</span>
            </div>
          )}
          <p className="mt-4 text-gray-300 leading-relaxed">
            {movie.plot}
          </p>
          
          <div className="mt-6">
            <h3 className="text-white font-semibold mb-2">بازیگران اصلی:</h3>
            <ul className="list-disc list-inside text-gray-400 space-y-1">
              {movie.cast?.slice(0, 5).map((member, index) => (
                <li key={index}>
                  <span className="font-medium text-gray-300">{member.actor}</span> as {member.character}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
