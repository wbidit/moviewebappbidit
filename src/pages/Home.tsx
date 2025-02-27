
import { useEffect, useState } from "react";
import { getTrendingMovies, Movie } from "@/services/movieService";
import MovieCard from "@/components/MovieCard";
import Pagination from "@/components/Pagination";
import { useToast } from "@/components/ui/use-toast";

const Home = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTrendingMovies = async () => {
      try {
        setIsLoading(true);
        const data = await getTrendingMovies(currentPage);
        setMovies(data.results);
        setTotalPages(Math.min(data.total_pages, 500)); // TMDB API limits to 500 pages
      } catch (error) {
        console.error("Error fetching trending movies:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load trending movies. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingMovies();
  }, [currentPage, toast]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container px-4 py-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col items-start mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Trending Movies
        </h1>
        <p className="text-muted-foreground mt-2">
          Discover what's popular right now
        </p>
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
          <h3 className="text-xl font-medium">No movies found</h3>
          <p className="text-muted-foreground mt-2">
            Try again later or check your connection.
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
