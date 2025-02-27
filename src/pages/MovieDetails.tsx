
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMovieDetails, getImageUrl, MovieDetailsResponse, Cast } from "@/services/movieService";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFavorites } from "@/context/FavoritesContext";
import { Heart } from "lucide-react";

const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [posterLoaded, setPosterLoaded] = useState(false);
  const [backdropLoaded, setBackdropLoaded] = useState(false);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await getMovieDetails(parseInt(id, 10));
        setMovie(data);
      } catch (error) {
        console.error(`Error fetching movie details for ID ${id}:`, error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load movie details. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id, toast]);

  const handleFavoriteToggle = () => {
    if (!movie) return;
    
    if (isFavorite(movie.id)) {
      removeFavorite(movie.id);
      toast({
        description: `Removed "${movie.title}" from favorites`,
      });
    } else {
      addFavorite(movie);
      toast({
        description: `Added "${movie.title}" to favorites`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container px-4 py-12 max-w-5xl mx-auto text-center">
        <h1 className="text-3xl font-bold">Movie Not Found</h1>
        <p className="mt-4 text-muted-foreground">
          We couldn't find the movie you're looking for.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  const isMovieFavorite = isFavorite(movie.id);
  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "Unknown";
  
  const rating = movie.vote_average 
    ? (movie.vote_average / 2).toFixed(1) 
    : "N/A";
  
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : "Unknown";

  const cast = movie.credits?.cast || [];

  return (
    <div className="animate-fade-in">
      {/* Backdrop Image */}
      <div className="relative w-full h-[40vh] md:h-[50vh] overflow-hidden">
        {!backdropLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse"></div>
        )}
        {movie.backdrop_path ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10"></div>
            <img
              src={getImageUrl(movie.backdrop_path, "original")}
              alt={movie.title}
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                backdropLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setBackdropLoaded(true)}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-muted"></div>
        )}
      </div>

      <div className="container px-4 py-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 -mt-16 md:-mt-24 relative z-20">
          {/* Movie Poster */}
          <div className="shrink-0 w-40 md:w-64 mx-auto md:mx-0">
            <div className="relative rounded-lg overflow-hidden shadow-xl aspect-[2/3]">
              {!posterLoaded && (
                <div className="absolute inset-0 bg-muted animate-pulse"></div>
              )}
              <img
                src={getImageUrl(movie.poster_path, "w500")}
                alt={movie.title}
                className={`w-full h-full object-cover transition-opacity duration-500 ${
                  posterLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setPosterLoaded(true)}
              />
            </div>
            
            <Button 
              className="w-full mt-4 gap-2"
              variant={isMovieFavorite ? "secondary" : "outline"}
              onClick={handleFavoriteToggle}
            >
              <Heart className={isMovieFavorite ? "fill-current" : ""} />
              {isMovieFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </Button>
          </div>

          {/* Movie Info */}
          <div className="flex-1 mt-4 md:mt-20">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex flex-wrap gap-2 items-center">
              {movie.title}
              <span className="text-2xl font-normal text-muted-foreground">
                ({releaseYear})
              </span>
            </h1>

            <div className="flex flex-wrap gap-2 mt-4">
              {movie.genres.map((genre) => (
                <Badge key={genre.id} variant="secondary" className="text-xs">
                  {genre.name}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-6 mt-4 text-sm">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1 h-3.5 w-3.5 text-yellow-500"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <span>
                  {rating} ({movie.vote_count.toLocaleString()} votes)
                </span>
              </div>
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1 h-3.5 w-3.5"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{runtime}</span>
              </div>
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1 h-3.5 w-3.5"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{new Date(movie.release_date).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Overview</h2>
              <p className="text-muted-foreground">{movie.overview || "No overview available."}</p>
            </div>
          </div>
        </div>

        {/* Cast */}
        {cast.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold mb-6">Cast</h2>
            <ScrollArea className="whitespace-nowrap pb-4">
              <div className="flex space-x-4">
                {cast.slice(0, 20).map((person: Cast) => (
                  <div key={person.id} className="w-32 shrink-0">
                    <div className="rounded-lg overflow-hidden aspect-[2/3] bg-muted mb-2">
                      {person.profile_path ? (
                        <img
                          src={getImageUrl(person.profile_path, "w185")}
                          alt={person.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="font-medium text-sm truncate">{person.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {person.character}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
        
        <div className="mt-12 flex justify-center gap-4">
          <Button asChild variant="outline" className="w-full max-w-xs">
            <Link to="/" className="flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Back to Home
            </Link>
          </Button>
          
          <Button asChild className="w-full max-w-xs">
            <Link to="/favorites" className="flex items-center justify-center">
              <Heart className="mr-2" />
              View Favorites
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
