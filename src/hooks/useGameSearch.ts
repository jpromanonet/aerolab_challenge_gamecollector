import { useState, useEffect, useCallback } from "react";
import { SearchResult } from "@/types/game";

export function useGameSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: unknown) => {
      if (typeof searchQuery !== 'string' || !searchQuery.trim()) {
        setResults([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const searchResults = await response.json();
        setResults(searchResults);
      } catch {
        setError("Error searching games. Please try again.");
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const loadSuggestions = useCallback(async () => {
    try {
      // Load popular games as suggestions
      const response = await fetch(`/api/search?q=popular&limit=5`);
      if (response.ok) {
        const suggestionResults = await response.json();
        setSuggestions(suggestionResults);
      }
    } catch (error) {
      console.error("Error loading suggestions:", error);
    }
  }, []);

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setError(null);
  };

  return {
    query,
    setQuery,
    results,
    suggestions,
    isLoading,
    error,
    clearSearch,
    loadSuggestions,
  };
}

// Debounce utility function
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
} 