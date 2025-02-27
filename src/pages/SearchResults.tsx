
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchMovies, Movie } from "@/services/movieService";
import MovieCard from "@/components/MovieCard";
import Pagination from "@/components/Pagination";
import MovieFilters from "@/components/MovieFilters";
import { useToast } from "@/components/ui/use-toast";

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const pageParam = searchParams.get("page");
  const yearParam = searchParams.get("year");
  const genreParam = searchParams.get("genre");
  
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const { toast } = useToast();
  
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const year = yearParam ? parseInt(yearParam, 10) : undefined;
  const genreId = genreParam ? parseInt(genreParam, 10) : undefined;

  useEffect(() => {
    if (!query) return;

    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        const data = await searchMovies(query, currentPage, year, genreId);
        setMovies(data.results);
        setTotalPages(Math.min(data.total_pages, 500)); // TMDB API limits to 500 pages
      } catch (error) {
        console.error("Error searching movies:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to search movies. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [query, currentPage, year, genreId, toast]);

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterChange = ({ year, genreId }: { year?: number; genreId?: number }) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("page");
    
    if (year) {
      newParams.set("year", year.toString());
    } else {
      newParams.delete("year");
    }
    
    if (genreId) {
      newParams.set("genre", genreId.toString());
    } else {
      newParams.delete("genre");
    }
    
    setSearchParams(newParams);
  };

  return (
    <div className="container px-4 py-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col items-start mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Search Results
        </h1>
        {query && (
          <p className="text-muted-foreground mt-2">
            Found {movies.length > 0 ? "results" : "no results"} for "{query}"
          </p>
        )}
      </div>

      <div className="mb-8">
        <MovieFilters
          onFilterChange={handleFilterChange}
          initialYear={year}
          initialGenreId={genreId}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <div 
              key={index} 
              className="rounded-md overflow-hidden animate-pulse"
            >
              <div className="aspect-[2/3] bg-muted"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 w-1/2 bg-muted rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : movies.length > 0 ? (
        <>
          <div className="movie-grid">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium">No results found</h3>
          <p className="text-muted-foreground mt-2">
            Try different search terms or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
