import { useState, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchResult } from "@/types/game";
import Link from "next/link";
import Image from "next/image";
import classes from './searchBar.module.css'

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  suggestions?: SearchResult[];
  isLoading: boolean;
  error: string | null;
  onResultClick?: () => void;
  onFocus?: () => void;
  className?: string;
  darkMode?: boolean;
}

export function SearchBar({
  query,
  setQuery,
  results,
  suggestions = [],
  isLoading,
  error,
  onResultClick,
  onFocus,
  className,
  darkMode = false,
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputFocus = () => {
    setIsOpen(true);
    onFocus?.();
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(true);
    setFocusedIndex(-1);
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    setFocusedIndex(-1);
    inputRef.current?.focus();
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setFocusedIndex(-1);
    onResultClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const displayResults = query.trim() ? results : suggestions;
    if (!isOpen || displayResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < displayResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : displayResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < displayResults.length) {
          const game = displayResults[focusedIndex];
          window.location.href = `/game/${game.slug || game.id}`;
          handleResultClick();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const displayResults = query.trim() ? results : suggestions;
  const showDropdown = isOpen && (query.trim() || suggestions.length > 0);

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <div className="relative">
        <Search color="#E7C0DB" className={cn(
          "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
        )} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search games..."
          aria-label="Search for video games"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls="search-results"
          aria-describedby={error ? "search-error" : undefined}
          className={classes.search_input}
        />
        {isLoading && (
          <Loader2 
            className={cn(
              "absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin",
              darkMode ? "text-purple-400" : "text-gray-400"
            )}
            aria-label="Loading search results"
          />
        )}
        {query && !isLoading && (
          <button
            onClick={handleClear}
            className={cn(
              "absolute right-3 top-1/2 transform -translate-y-1/2 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded",
              darkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-400"
            )}
            aria-label="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          id="search-results"
          role="listbox"
          aria-label="Search results"
          className={cn(
            "absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto",
            darkMode 
              ? "bg-gray-800 border-gray-700" 
              : "bg-white border-gray-200"
          )}
        >
          {error && (
            <div 
              id="search-error"
              className={cn(
                "p-4 text-sm",
                darkMode ? "text-red-400" : "text-red-600"
              )}
              role="alert"
            >
              {error}
            </div>
          )}
          
          {!error && displayResults.length === 0 && query.trim() && !isLoading && (
            <div className={cn(
              "p-4 text-sm",
              darkMode ? "text-gray-400" : "text-gray-500"
            )}>
              No games found
            </div>
          )}

          {!query.trim() && suggestions.length > 0 && (
            <div className={cn(
              "p-3 text-sm font-medium border-b",
              darkMode ? "text-gray-300 border-gray-700" : "text-gray-700 border-gray-200"
            )}>
              Popular games
            </div>
          )}

          {displayResults.map((game, index) => (
            <Link
              key={game.id}
              href={`/game/${game.slug || game.id}`}
              onClick={handleResultClick}
              role="option"
              aria-selected={focusedIndex === index}
              className={cn(
                "flex items-center space-x-3 p-3 transition-colors border-b last:border-b-0 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
                darkMode 
                  ? "hover:bg-gray-700 border-gray-700 focus:bg-gray-700" 
                  : "hover:bg-gray-50 border-gray-100 focus:bg-gray-50",
                focusedIndex === index && (darkMode ? "bg-gray-700" : "bg-gray-50")
              )}
            >
              <div className={cn(
                "flex-shrink-0 w-12 h-16 rounded overflow-hidden",
                darkMode ? "bg-gray-700" : "bg-gray-200"
              )}>
                {game.cover ? (
                  <Image
                    src={game.cover.url}
                    alt={`Cover art for ${game.name}`}
                    width={48}
                    height={64}
                    className="w-full h-full object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className={cn(
                    "w-full h-full flex items-center justify-center",
                    darkMode ? "bg-gray-700" : "bg-gray-300"
                  )}>
                    <span className={cn(
                      "text-xs",
                      darkMode ? "text-gray-500" : "text-gray-500"
                    )}>
                      No image
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "text-sm font-medium truncate",
                  darkMode ? "text-white" : "text-gray-900"
                )}>
                  {game.name}
                </h3>
                {game.first_release_date && (
                  <p className={cn(
                    "text-xs",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}>
                    {new Date(game.first_release_date * 1000).getFullYear()}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 