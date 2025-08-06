"use client";

import { useState } from "react";
import { useGameCollection } from "@/hooks/useGameCollection";
import { useGameSearch } from "@/hooks/useGameSearch";
import { GameCard } from "@/components/GameCard";
import { SearchBar } from "@/components/SearchBar/SearchBar";
import { SortTabs } from "@/components/SortTabs/SortTabs";
import { EmptyState } from "@/components/EmptyState";
import { Logo } from "@/components/Logo/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/Auth/AuthModal";
import { UserMenu } from "@/components/Auth/UserMenu";
import { MobileMenu } from "@/components/Auth/MobileMenu";

export default function HomePage() {
  const [sortBy, setSortBy] = useState("dateAdded");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const { user, loading: authLoading } = useAuth();
  const { collection, isLoading: collectionLoading, removeFromCollection, isInCollection } = useGameCollection();
  const { query, setQuery, results, suggestions, isLoading: isSearching, error, loadSuggestions } = useGameSearch();

  const handleSignInClick = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleSignUpClick = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const sortedCollection = collection.sort((a, b) => {
    switch (sortBy) {
      case "dateAdded":
        return b.collectedAt - a.collectedAt;
      case "releaseDate":
        if (!a.first_release_date && !b.first_release_date) return 0;
        if (!a.first_release_date) return 1;
        if (!b.first_release_date) return -1;
        return b.first_release_date - a.first_release_date;
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  if (authLoading) {
    return (
      <div className="min-h-screen main animate__animated animate__fadeIn flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen main animate__animated animate__fadeIn">
      <header role="banner">
        <div className="max-w-4xl mx-auto px-4 pt-4 md:pt-20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex justify-start md:justify-center flex-1">
              <Logo />
            </div>
            
            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              {user ? (
                <UserMenu />
              ) : (
                <>
                  <button
                    onClick={handleSignInClick}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-lg"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={handleSignUpClick}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-lg"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu */}
            <MobileMenu onSignInClick={handleSignInClick} onSignUpClick={handleSignUpClick} />
          </div>
          
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <SearchBar
                query={query}
                setQuery={setQuery}
                results={results}
                suggestions={suggestions}
                isLoading={isSearching}
                error={error}
                onFocus={loadSuggestions}
              />
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-4xl mx-auto px-4 py-4" role="main">
        <h1 className="text-lg font-bold text-black saved_games_title inline-block">
          {user ? 'Your Collection' : 'Saved games'}
        </h1>
        
        {!user && (
          <p className="text-sm text-gray-600 mt-1 mb-4">
            Sign in to save games to your collection and sync across devices
          </p>
        )}

        {collectionLoading ? (
          <div className="mt-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your collection...</p>
          </div>
        ) : sortedCollection.length > 0 ? (
          <>
            <SortTabs value={sortBy} onChange={setSortBy} />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
              {sortedCollection.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  isInCollection={isInCollection(game.id)}
                  onRemoveFromCollection={() => removeFromCollection(game.id)}
                  showRemoveButton={true}
                  small={true}
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  );
}
