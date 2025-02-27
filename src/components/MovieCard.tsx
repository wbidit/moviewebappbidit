
import { useState } from "react";
import { Link } from "react-router-dom";
import { Movie, getImageUrl } from "@/services/movieService";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/context/FavoritesContext";
import { Heart } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  
  const isMovieFavorite = isFavorite(movie.id);

  const releaseYear = movie.release_date 
    ? new Date(movie.release_date).getFullYear() 
    : "Unknown";

  const rating = movie.vote_average 
    ? (movie.vote_average / 2).toFixed(1) 
    : "N/A";

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the link navigation
    
    if (isMovieFavorite) {
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

  return (
    <Link to={`/movie/${movie.id}`} className="block">
      <Card className={`movie-card h-full overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 ${
        isMovieFavorite ? 'border-primary bg-primary/5' : 'bg-card'
      }`}>
        <div className="relative overflow-hidden">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted animate-pulse-subtle">
              <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
          )}
          
          <img
            src={getImageUrl(movie.poster_path, "w500")}
            alt={movie.title}
            className={`movie-poster rounded-t-md transition-opacity duration-300 ${
              imageLoaded && !imageError ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
          
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground aspect-[2/3]">
              <span className="text-sm font-medium">No Image</span>
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="icon" 
            className={`absolute top-2 right-2 rounded-full bg-background/80 backdrop-blur-sm ${
              isMovieFavorite ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-primary'
            }`}
            onClick={handleFavoriteToggle}
          >
            <Heart className={isMovieFavorite ? 'fill-current' : ''} />
            <span className="sr-only">
              {isMovieFavorite ? 'Remove from favorites' : 'Add to favorites'}
            </span>
          </Button>
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium leading-tight line-clamp-2 text-base sm:text-lg">
              {movie.title}
            </h3>
            <Badge variant="outline" className="shrink-0 text-xs">
              {releaseYear}
            </Badge>
          </div>
          
          <div className="mt-2 flex items-center text-sm text-muted-foreground">
            <span className="flex items-center">
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
              {rating}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default MovieCard;
