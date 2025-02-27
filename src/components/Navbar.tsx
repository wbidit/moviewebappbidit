
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import SearchBar from "./SearchBar";
import { useFavorites } from "@/context/FavoritesContext";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { favorites } = useFavorites();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="border-b sticky top-0 z-30 bg-background backdrop-blur-lg bg-opacity-80">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-lg sm:text-xl">CineSearch</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-1">
          <Link
            to="/"
            className="px-4 py-2 rounded-md hover:bg-accent transition-colors"
          >
            Home
          </Link>
          <Link
            to="/trending"
            className="px-4 py-2 rounded-md hover:bg-accent transition-colors"
          >
            Trending
          </Link>
          <Link
            to="/favorites"
            className="px-4 py-2 rounded-md hover:bg-accent transition-colors flex items-center gap-1"
          >
            Favorites
            {favorites.length > 0 && (
              <span className="px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                {favorites.length}
              </span>
            )}
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:block w-72">
            <SearchBar onSearch={handleSearch} />
          </div>

          <button
            className="md:hidden flex items-center"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="container mx-auto px-4 py-4 space-y-4">
            <SearchBar onSearch={(q) => {
              handleSearch(q);
              setIsMobileMenuOpen(false);
            }} />
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                className="px-4 py-2 rounded-md hover:bg-accent transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/trending"
                className="px-4 py-2 rounded-md hover:bg-accent transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Trending
              </Link>
              <Link
                to="/favorites"
                className="px-4 py-2 rounded-md hover:bg-accent transition-colors flex items-center gap-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Favorites
                {favorites.length > 0 && (
                  <span className="px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
                    {favorites.length}
                  </span>
                )}
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
