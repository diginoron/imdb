import React, { useState, useCallback } from 'react';
import type { MovieDetails } from './types';
import MovieCard from './components/MovieCard';
import Loader from './components/Loader';
import ErrorMessage from './components/ErrorMessage';

const App: React.FC = () => {
  const [imdbId, setImdbId] = useState<string>('');
  const [movieData, setMovieData] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchMovie = useCallback(async (idToFetch: string) => {
    if (!idToFetch.trim()) {
      setError('لطفاً کد IMDb را وارد کنید.');
      return;
    }
    if (!idToFetch.startsWith('tt')) {
      setError('کد IMDb نامعتبر است. باید با "tt" شروع شود.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMovieData(null);

    try {
       const resultText = await new Promise<string>((resolve, reject) => {
        const data = null;
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener('readystatechange', function () {
          if (this.readyState === this.DONE) {
            if (this.status >= 200 && this.status < 400) {
                resolve(this.responseText);
            } else {
                let errorMessage = `خطای سرور: ${this.status}`;
                try {
                    const errorJson = JSON.parse(this.responseText);
                    errorMessage = errorJson.message || errorMessage;
                } catch (e) {
                    // Ignore parsing error
                }
                reject(new Error(errorMessage));
            }
          }
        });
        
        xhr.onerror = () => {
            reject(new Error('خطای شبکه. لطفاً اتصال اینترنت خود را بررسی کنید.'));
        };

        // Reverted to the correct endpoint /api/imdb/ which was proven to work.
        xhr.open('GET', `https://imdb236.p.rapidapi.com/api/imdb/${idToFetch.trim()}`);
        xhr.setRequestHeader('x-rapidapi-key', '04dafa2b45msh0225343c0fcf8c3p1146e8jsn9a70ae94558b');
        xhr.setRequestHeader('x-rapidapi-host', 'imdb236.p.rapidapi.com');

        xhr.send(data);
      });
      
      const responseJson = JSON.parse(resultText);
      let movieDetails: MovieDetails | null = null;

      // Check for a nested success response: { status: true, data: { ... } }
      if (responseJson.status === true && responseJson.data && typeof responseJson.data === 'object') {
          movieDetails = responseJson.data;
      } 
      // Check for a direct movie object response: { title: '...', ... }
      else if (responseJson.title) {
          movieDetails = responseJson;
      }
      // Check for an array response with one movie object inside
      else if (Array.isArray(responseJson) && responseJson.length > 0 && responseJson[0].title) {
        movieDetails = responseJson[0];
      }

      // After checking, validate and set data, or throw an error.
      if (movieDetails && movieDetails.title) {
          setMovieData(movieDetails);
      } else {
          // If no valid movie data structure was found, it's an error.
          // Use the API's message if available, otherwise a generic error.
          throw new Error(responseJson.message || 'فیلمی با این کد پیدا نشد.');
      }

    } catch (err: any) {
      setError(err.message || 'یک خطای ناشناخته رخ داد.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleFetchMovie(imdbId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
            IMDb Movie Fetcher
          </h1>
          <p className="text-lg text-gray-400">
            اطلاعات فیلم مورد نظر خود را فوراً دریافت کنید
          </p>
        </header>

        <main>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-8">
            <input
              type="text"
              value={imdbId}
              onChange={(e) => setImdbId(e.target.value)}
              placeholder="کد IMDb را وارد کنید (مثلا: tt0816692)"
              className="flex-grow bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition duration-300"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'جستجو'}
            </button>
          </form>

          <div className="mt-6">
            {isLoading && <Loader />}
            {error && <ErrorMessage message={error} />}
            {movieData && <MovieCard movie={movieData} />}
            {!isLoading && !error && !movieData && (
              <div className="text-center text-gray-500 bg-gray-800/50 p-8 rounded-lg">
                <p>برای شروع، کد فیلم مورد نظر خود را وارد کرده و دکمه جستجو را بزنید.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;