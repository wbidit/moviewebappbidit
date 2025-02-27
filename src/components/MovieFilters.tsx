
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Genre, getGenres, getYearRange } from "@/services/movieService";

interface MovieFiltersProps {
  onFilterChange: (filters: { year?: number; genreId?: number }) => void;
  initialYear?: number;
  initialGenreId?: number;
}

const MovieFilters = ({ onFilterChange, initialYear, initialGenreId }: MovieFiltersProps) => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [year, setYear] = useState<number | undefined>(initialYear);
  const [genreId, setGenreId] = useState<number | undefined>(initialGenreId);
  const years = getYearRange();

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genreData = await getGenres();
        setGenres(genreData);
      } catch (error) {
        console.error("Error fetching genres:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenres();
  }, []);

  const handleYearChange = (value: string) => {
    const selectedYear = value === "all" ? undefined : parseInt(value, 10);
    setYear(selectedYear);
    onFilterChange({ year: selectedYear, genreId });
  };

  const handleGenreChange = (value: string) => {
    const selectedGenreId = value === "all" ? undefined : parseInt(value, 10);
    setGenreId(selectedGenreId);
    onFilterChange({ year, genreId: selectedGenreId });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start">
      <div className="space-y-1 w-full sm:w-48">
        <Label htmlFor="year-filter">Release Year</Label>
        <Select
          value={year?.toString() || "all"}
          onValueChange={handleYearChange}
          disabled={isLoading}
        >
          <SelectTrigger id="year-filter">
            <SelectValue placeholder="All Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1 w-full sm:w-48">
        <Label htmlFor="genre-filter">Genre</Label>
        <Select
          value={genreId?.toString() || "all"}
          onValueChange={handleGenreChange}
          disabled={isLoading}
        >
          <SelectTrigger id="genre-filter">
            <SelectValue placeholder="All Genres" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {genres.map((genre) => (
              <SelectItem key={genre.id} value={genre.id.toString()}>
                {genre.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default MovieFilters;
