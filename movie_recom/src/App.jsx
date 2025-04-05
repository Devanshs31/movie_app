import React, { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import Search from './components/search.jsx';
import Spinner from './components/spinner.jsx';
import MovieCard from './components/MovieCard.jsx';
import { getTrendingMovies, updateSearchCount } from './appwrite.js';

const API_BASE_URL = 'https://api.themoviedb.org/3'; // Base URL for The Movie Database API
const API_KEY = import.meta.env.VITE_TMDB_API_KEY; // API key stored in environment variables for security

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json', // Accept JSON responses
    Authorization: `Bearer ${API_KEY}`, // Bearer token for API authentication
  },
};

const App = () => {
  // State to store the debounced version of the search term
  const [debounceSearchTerm, setDebounceSearchTerm] = useState('');
  // State to track the user's search input
  const [searchTerm, setSearchTerm] = useState('');
  // State to store the list of movies fetched from the API
  const [movieList, setMovieList] = useState([]);
  // State to store error messages
  const [errorMessage, setErrorMessage] = useState('');
  // State to track the loading state
  const [isloading, setIsLoading] = useState(false);
  // State to store the list of trending movies
  const [trendingMovies, setTrendingMovies] = useState([]);

  // Debounce the search term to delay API calls until the user stops typing
  useDebounce(() => setDebounceSearchTerm(searchTerm), 500, [searchTerm]);

  // Function to fetch movies from the API
  const fetchMovies = async (query = '') => {
    setIsLoading(true); // Set loading state to true
    setErrorMessage(''); // Clear any previous error messages

    try {
      // Determine the endpoint based on whether a search query is provided
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` // Search endpoint
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`; // Default endpoint for popular movies

      // Fetch data from the API
      const response = await fetch(endpoint, API_OPTIONS);

      // Throw an error if the response is not OK
      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      // Parse the JSON response
      const data = await response.json();

      // Handle API-specific errors
      if (data.response === false) {
        setErrorMessage(data.error || 'Failed to fetch movies');
        setMovieList([]); // Clear the movie list
        return;
      }

      // Update the movie list with the fetched data
      setMovieList(data.results || []);

      // Update the search count if a query is provided and results are available
      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      // Log and set the error message
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Failed to fetch movies. Please try again later.');
    } finally {
      setIsLoading(false); // Set loading state to false
    }
  };

  // Function to load trending movies
  const loadTrendingMovies = async () => {
    try {
      // Fetch trending movies from the backend
      const movies = await getTrendingMovies();
      setTrendingMovies(movies); // Update the trending movies state
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };

  // Fetch movies whenever the debounced search term changes
  useEffect(() => {
    fetchMovies(debounceSearchTerm);
  }, [debounceSearchTerm]);

  // Load trending movies on component mount
  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src="/hero-img.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>

          {isloading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
