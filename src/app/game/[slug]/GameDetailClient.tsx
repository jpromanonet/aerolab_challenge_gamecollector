"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { GameCard } from "@/components/GameCard";
import { SearchBar } from "@/components/SearchBar/SearchBar";
import { Logo } from "@/components/Logo/Logo";
import { ArrowLeft, Heart, Calendar, Star, Monitor, Image as ImageIcon } from "lucide-react";
import { Game, CollectedGame } from "@/types/game";
import { useGameCollection } from "@/hooks/useGameCollection";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/Auth/AuthModal";
import { UserMenu } from "@/components/Auth/UserMenu";
import { MobileMenu } from "@/components/Auth/MobileMenu";
import Image from "next/image";
import { format } from "date-fns";


interface GameDetailClientProps {
  slug: string;
}

export default function GameDetailClient({ slug }: GameDetailClientProps) {
  const [game, setGame] = useState<Game | null>(null);
  const [similarGames, setSimilarGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const router = useRouter();
  const { user } = useAuth();
  const { addToCollection, removeFromCollection, isInCollection } = useGameCollection();

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let gameId: number | null = null;

        // First, check if the slug is actually a numeric ID
        const parsedId = parseInt(slug);
        if (!isNaN(parsedId)) {
          gameId = parsedId;
        } else {
          // If it's not a number, try to search for the game
          // Convert slug format (e.g., "grand-theft-auto-v" to "grand theft auto v")
          const searchQuery = slug.replace(/-/g, ' ');
          
          console.log("Searching for game with query:", searchQuery);
          
          const searchResponse = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
          if (!searchResponse.ok) {
            throw new Error("Failed to search for game");
          }

          const searchResults = await searchResponse.json();
          console.log("Search results:", searchResults);

          if (searchResults.length === 0) {
            throw new Error("Game not found");
          }

          // Try to find the best match
          // First, try exact slug match
          let bestMatch = searchResults.find((result: any) => result.slug === slug);
          
          // If no exact slug match, try name similarity
          if (!bestMatch) {
            const normalizedQuery = searchQuery.toLowerCase();
            bestMatch = searchResults.find((result: any) => 
              result.name.toLowerCase().includes(normalizedQuery) ||
              normalizedQuery.includes(result.name.toLowerCase())
            );
          }

          // If still no match, use the first result
          if (!bestMatch && searchResults.length > 0) {
            bestMatch = searchResults[0];
          }

          if (!bestMatch) {
            throw new Error("Game not found");
          }

          gameId = bestMatch.id;
        }

        if (!gameId) {
          throw new Error("Could not determine game ID");
        }

        console.log("Fetching game details for ID:", gameId);
        
        const gameResponse = await fetch(`/api/games/${gameId}`);
        if (!gameResponse.ok) {
          throw new Error("Failed to fetch game details");
        }

        const gameData = await gameResponse.json();
        
        if (!gameData.game) {
          throw new Error("Game not found");
        }

        setGame(gameData.game);
        setSimilarGames(gameData.similarGames || []);
      } catch (err) {
        console.error("Error fetching game details:", err);
        setError(err instanceof Error ? err.message : "Failed to load game details");
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchGameDetails();
    }
  }, [slug]);

  const handleAddToCollection = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!game) return;

    try {
      await addToCollection(game);
    } catch (error) {
      console.error("Error adding to collection:", error);
    }
  };

  const handleRemoveFromCollection = async () => {
    if (!game) return;

    try {
      await removeFromCollection(game.id);
    } catch (error) {
      console.error("Error removing from collection:", error);
    }
  };

  const handleSignInClick = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleSignUpClick = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  const isCollected = game ? isInCollection(game.id) : false;

  if (isLoading) {
    return (
      <div className="min-h-screen main animate__animated animate__fadeIn flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game details...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen main animate__animated animate__fadeIn flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Game Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The game you're looking for doesn't exist."}</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen main animate__animated animate__fadeIn">
      <header className="pt-4 md:pt-20">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/")}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-lg p-2"
                aria-label="Go back to home"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
              
              <div className="flex-1 max-w-md">
                <SearchBar
                  query=""
                  setQuery={() => {}}
                  results={[]}
                  isLoading={false}
                  error={null}
                  className="w-full"
                />
              </div>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              {user && <UserMenu />}
            </div>

            {/* Mobile Menu */}
            <MobileMenu onSignInClick={handleSignInClick} onSignUpClick={handleSignUpClick} />
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-4xl mx-auto px-4 py-8" role="main">
        {/* Game Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Game Cover */}
          <div className="md:col-span-1">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-lg">
              <Image
                src={game.cover.url}
                alt={`Cover art for ${game.name}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
            </div>
          </div>

          {/* Game Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {game.name}
              </h1>
              
              {game.rating && (
                <div className="flex items-center space-x-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-lg font-semibold text-gray-700">
                    {game.rating.toFixed(1)}/5
                  </span>
                </div>
              )}
            </div>

            {/* Game Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {game.first_release_date && (
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">
                    {format(new Date(game.first_release_date * 1000), "MMMM yyyy")}
                  </span>
                </div>
              )}
              
              {game.platforms && game.platforms.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Monitor className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">
                    {game.platforms.map(p => p.name).join(", ")}
                  </span>
                </div>
              )}
            </div>

            {/* Collection Button */}
            <button
              onClick={isCollected ? handleRemoveFromCollection : handleAddToCollection}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                isCollected
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
            >
              <Heart className={`w-5 h-5 ${isCollected ? "fill-current" : ""}`} />
              <span>{isCollected ? "Remove from collection" : (user ? 'Collect game' : 'Sign in to collect')}</span>
            </button>
          </div>
        </div>

        {/* Game Screenshots */}
        {game.screenshots && game.screenshots.length > 0 && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <ImageIcon className="w-6 h-6" />
              <span>Screenshots</span>
            </h2>
            
            <div className="relative">
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
                <Image
                  src={game.screenshots[currentScreenshotIndex].url}
                  alt={`Screenshot ${currentScreenshotIndex + 1} of ${game.name}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              
              {game.screenshots.length > 1 && (
                <div className="flex justify-center space-x-2 mt-4">
                  {game.screenshots.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentScreenshotIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        index === currentScreenshotIndex
                          ? "bg-purple-600"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                      aria-label={`Go to screenshot ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Similar Games */}
        {similarGames.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Similar Games</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {similarGames.map((similarGame) => (
                <GameCard
                  key={similarGame.id}
                  game={similarGame}
                  isInCollection={isInCollection(similarGame.id)}
                  onAddToCollection={() => addToCollection(similarGame)}
                  small={true}
                />
              ))}
            </div>
          </section>
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