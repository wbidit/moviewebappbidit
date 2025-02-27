
import { useState } from "react";
import { useFavorites } from "@/context/FavoritesContext";
import MovieCard from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const FavoritesPage = () => {
  const { favorites } = useFavorites();
  const [sortBy, setSortBy] = useState<"title" | "rating">("title");

  const sortedFavorites = [...favorites].sort((a, b) => {
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    } else {
      return b.vote_average - a.vote_average;
    }
  });

  return (
    <div className="container px-4 py-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col items-start mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          My Favorites
        </h1>
        <p className="text-muted-foreground mt-2">
          Your collection of favorite movies
        </p>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start">
        <div className="space-y-1">
          <label htmlFor="sort-by" className="text-sm font-medium">Sort by</label>
          <div className="flex space-x-2">
            <Button 
              variant={sortBy === "title" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSortBy("title")}
            >
              Title
            </Button>
            <Button 
              variant={sortBy === "rating" ? "default" : "outline"} 
              size="sm"
              onClick={() => setSortBy("rating")}
            >
              Rating
            </Button>
          </div>
        </div>
      </div>

      {favorites.length > 0 ? (
        <div className="movie-grid">
          {sortedFavorites.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium">No favorites yet</h3>
          <p className="text-muted-foreground mt-2 mb-6">
            Start adding movies to your favorites collection
          </p>
          <Button asChild>
            <Link to="/">Browse Movies</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
