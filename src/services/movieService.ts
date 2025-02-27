
// Open Movie Database (OMDb) API service

// API key should be in an environment variable in a real application
const API_KEY = "292c6a41"; // Updated OMDb API key
const BASE_URL = "https://www.omdbapi.com/";
const POSTER_BASE_URL = "https://img.omdbapi.com/";

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genres?: Genre[];
  runtime?: number;
  genre_ids?: number[];
  imdbID?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface MovieDetailsResponse extends Movie {
  genres: Genre[];
  runtime: number;
  credits?: {
    cast: Cast[];
  };
}

export interface SearchMoviesResponse {
  page: number;
  results: Movie[];
  total_results: number;
  total_pages: number;
}

export interface GenresResponse {
  genres: Genre[];
}

// Helper to create API URLs with API key
const createApiUrl = (queryParams: Record<string, string>) => {
  const url = new URL(BASE_URL);
  url.searchParams.append("apikey", API_KEY);
  
  // Add any additional query parameters
  Object.entries(queryParams).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  return url.toString();
};

// Get movie poster image URL
export const getImageUrl = (path: string | null, size: string = "w500") => {
  if (!path) return "/placeholder.svg";
  if (path.startsWith("http")) return path; // If it's already a full URL
  
  // For OMDb, we don't need size parameter as it doesn't support different sizes
  return path;
};

// Convert OMDb movie object to our Movie interface
const convertOmdbToMovie = (omdbMovie: any): Movie => {
  return {
    id: omdbMovie.imdbID ? parseInt(omdbMovie.imdbID.replace('tt', ''), 10) : 0,
    imdbID: omdbMovie.imdbID,
    title: omdbMovie.Title || '',
    poster_path: omdbMovie.Poster !== "N/A" ? omdbMovie.Poster : null,
    backdrop_path: null, // OMDb doesn't provide backdrop images
    overview: omdbMovie.Plot || '',
    release_date: omdbMovie.Released || omdbMovie.Year || '',
    vote_average: omdbMovie.imdbRating ? parseFloat(omdbMovie.imdbRating) * 2 : 0, // Convert from 10-point to 20-point scale
    vote_count: omdbMovie.imdbVotes ? parseInt(omdbMovie.imdbVotes.replace(/,/g, ''), 10) : 0,
    runtime: omdbMovie.Runtime ? parseInt(omdbMovie.Runtime, 10) : 0,
    genres: omdbMovie.Genre ? omdbMovie.Genre.split(',').map((name: string, index: number) => ({
      id: index + 1,
      name: name.trim()
    })) : []
  };
};

// Search movies by title
export const searchMovies = async (
  query: string,
  page: number = 1,
  year?: number,
  genreId?: number
): Promise<SearchMoviesResponse> => {
  try {
    const params: Record<string, string> = {
      s: query,
      type: "movie",
      page: page.toString(),
    };

    if (year) {
      params.y = year.toString();
    }

    const response = await fetch(createApiUrl(params));
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.Response === "False") {
      return {
        page: page,
        results: [],
        total_results: 0,
        total_pages: 0
      };
    }
    
    // Convert OMDb movies to our format
    const results = data.Search.map(convertOmdbToMovie);
    
    // Filter by genre if specified (note: basic filtering since OMDb doesn't support genre filtering directly)
    const filteredResults = genreId 
      ? results.filter(movie => {
          const genreNames = GENRE_MAP[genreId];
          if (!genreNames || !movie.genres) return false;
          return movie.genres.some(g => genreNames.includes(g.name.toLowerCase()));
        })
      : results;
    
    return {
      page: page,
      results: filteredResults,
      total_results: parseInt(data.totalResults, 10) || 0,
      total_pages: Math.ceil(parseInt(data.totalResults, 10) / 10) || 0
    };
  } catch (error) {
    console.error("Error searching movies:", error);
    throw error;
  }
};

// Get trending movies (OMDb doesn't have trending, so we'll use some popular movie searches)
export const getTrendingMovies = async (page: number = 1): Promise<SearchMoviesResponse> => {
  try {
    // Use popular search terms per page to simulate trending
    const popularSearches = [
      "marvel", "star wars", "harry potter", "lord of the rings",
      "jurassic", "fast furious", "mission impossible", "batman",
      "spider-man", "avengers"
    ];
    
    const searchIndex = (page - 1) % popularSearches.length;
    const searchTerm = popularSearches[searchIndex];
    
    return await searchMovies(searchTerm, page);
  } catch (error) {
    console.error("Error fetching trending movies:", error);
    throw error;
  }
};

// Get movie details
export const getMovieDetails = async (movieId: number): Promise<MovieDetailsResponse> => {
  try {
    const imdbId = `tt${movieId.toString().padStart(7, '0')}`;
    
    const params: Record<string, string> = {
      i: imdbId,
      plot: "full"
    };
    
    const response = await fetch(createApiUrl(params));
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.Response === "False") {
      throw new Error(`Movie not found: ${data.Error}`);
    }
    
    const movie = convertOmdbToMovie(data);
    
    // Generate fake cast for demo purposes (OMDb doesn't provide cast in the free tier)
    const fakeCast: Cast[] = [];
    if (data.Actors) {
      const actors = data.Actors.split(',');
      actors.forEach((actor: string, index: number) => {
        fakeCast.push({
          id: index + 1,
          name: actor.trim(),
          character: "Character " + (index + 1),
          profile_path: null
        });
      });
    }
    
    return {
      ...movie,
      credits: {
        cast: fakeCast
      }
    } as MovieDetailsResponse;
  } catch (error) {
    console.error(`Error fetching movie details for ID ${movieId}:`, error);
    throw error;
  }
};

// Map of genre IDs to names (simplified version since OMDb doesn't have genre IDs)
const GENRE_MAP: Record<number, string[]> = {
  28: ["action"],
  12: ["adventure"],
  16: ["animation"],
  35: ["comedy"],
  80: ["crime"],
  99: ["documentary"],
  18: ["drama"],
  10751: ["family"],
  14: ["fantasy"],
  36: ["history"],
  27: ["horror"],
  10402: ["music"],
  9648: ["mystery"],
  10749: ["romance"],
  878: ["sci-fi", "science fiction"],
  53: ["thriller"],
  10752: ["war"],
  37: ["western"]
};

// Get all genres
export const getGenres = async (): Promise<Genre[]> => {
  try {
    // Since OMDb doesn't have a genres endpoint, we'll return a static list
    return Object.entries(GENRE_MAP).map(([id, names]) => ({
      id: parseInt(id, 10),
      name: names[0].charAt(0).toUpperCase() + names[0].slice(1)
    }));
  } catch (error) {
    console.error("Error fetching genres:", error);
    throw error;
  }
};

// Get year range for filter (from 1900 to current year)
export const getYearRange = (): number[] => {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let year = currentYear; year >= 1900; year--) {
    years.push(year);
  }
  return years;
};
