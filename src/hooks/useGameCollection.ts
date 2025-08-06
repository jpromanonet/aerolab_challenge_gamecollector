import { useState, useEffect } from "react";
import { CollectedGame, Game } from "@/types/game";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

const COLLECTION_KEY = "aerolab-game-collection";

export function useGameCollection() {
  const [collection, setCollection] = useState<CollectedGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, session } = useAuth();

  useEffect(() => {
    loadCollection();
  }, [user]);

  const loadCollection = async () => {
    setIsLoading(true);
    
    if (user && session) {
      // Load from Supabase for authenticated users
      await loadFromSupabase();
    } else {
      // Load from localStorage for guests (read-only)
      loadFromLocalStorage();
    }
    
    setIsLoading(false);
  };

  const loadFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
      const savedCollection = localStorage.getItem(COLLECTION_KEY);
      if (savedCollection) {
        try {
          setCollection(JSON.parse(savedCollection));
        } catch (error) {
          console.error("Error parsing saved collection:", error);
        }
      }
    }
  };

  const loadFromSupabase = async () => {
    if (!user) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/user/collections', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Convert Supabase data to CollectedGame format
      const games = data.map((item: any) => ({
        ...item.game_data,
        collectedAt: new Date(item.created_at).getTime(),
      }));

      setCollection(games);
    } catch (error) {
      console.error('Error loading collection from Supabase:', error);
      // Fallback to localStorage if Supabase fails
      loadFromLocalStorage();
    }
  };

  const saveCollection = (newCollection: CollectedGame[]) => {
    try {
      if (user && session) {
        // Save to Supabase for authenticated users
        // This will be handled by the addToCollection function
      } else {
        // Save to localStorage for guests
        if (typeof window !== 'undefined') {
          localStorage.setItem(COLLECTION_KEY, JSON.stringify(newCollection));
          console.log("Collection saved to localStorage:", newCollection.length, "games");
        }
      }
      setCollection(newCollection);
    } catch (error) {
      console.error("Error saving collection:", error);
    }
  };

  const getGameDetails = async (gameId: number): Promise<Game | null> => {
    try {
      const response = await fetch(`/api/games/${gameId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.game;
    } catch (error) {
      console.error("Error getting game details:", error);
      return null;
    }
  };

  const addToCollection = async (game: CollectedGame) => {
    // Require authentication for adding games
    if (!user || !session) {
      toast.error("Please sign in to add games to your collection");
      return false;
    }

    try {
      console.log("Adding game to collection:", game.name);
      const isAlreadyCollected = collection.some(g => g.id === game.id);
      if (!isAlreadyCollected) {
        // Get full game details if we don't have them
        let gameToAdd = game;
        if (!game.rating || !game.platforms || !game.screenshots) {
          const fullGameDetails = await getGameDetails(game.id);
          if (fullGameDetails) {
            gameToAdd = { ...fullGameDetails, collectedAt: Date.now() };
          } else {
            // If we can't get full details, use the basic game info
            gameToAdd = { ...game, collectedAt: Date.now() };
          }
        } else {
          gameToAdd = { ...game, collectedAt: Date.now() };
        }
        
        // Save to Supabase (user is authenticated)
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No session');

        const response = await fetch('/api/user/collections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            game_id: gameToAdd.id,
            game_data: gameToAdd,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add to collection');
        }

        // Update local state after successful API call
        setCollection(prev => [...prev, gameToAdd]);
        
        console.log("Game added successfully:", game.name);
        toast.success(`${game.name} added to your collection!`);
        return true;
      } else {
        console.log("Game already in collection:", game.name);
        toast.error(`${game.name} is already in your collection`);
        return false;
      }
    } catch (error: any) {
      console.error("Error adding game to collection:", error);
      toast.error(error.message || "Failed to add game to collection");
      return false;
    }
  };

  const removeFromCollection = async (gameId: number) => {
    // Require authentication for removing games
    if (!user || !session) {
      toast.error("Please sign in to remove games from your collection");
      return;
    }

    const gameToRemove = collection.find(g => g.id === gameId);
    
    // Remove from Supabase (user is authenticated)
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch(`/api/user/collections?game_id=${gameId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove from collection');
      }

      // Update local state after successful API call
      setCollection(prev => prev.filter(g => g.id !== gameId));
    } catch (error) {
      console.error('Error removing from Supabase:', error);
      toast.error('Failed to remove from collection');
      return;
    }
    
    if (gameToRemove) {
      toast.success(`${gameToRemove.name} removed from your collection`);
    }
  };

  const isInCollection = (gameId: number) => {
    return collection.some(g => g.id === gameId);
  };

  const getCollectionSize = () => collection.length;

  const sortCollection = (sortBy: "dateAdded" | "releaseDate" | "name") => {
    const sorted = [...collection];
    switch (sortBy) {
      case "dateAdded":
        sorted.sort((a, b) => b.collectedAt - a.collectedAt);
        break;
      case "releaseDate":
        sorted.sort((a, b) => {
          if (!a.first_release_date && !b.first_release_date) return 0;
          if (!a.first_release_date) return 1;
          if (!b.first_release_date) return -1;
          return b.first_release_date - a.first_release_date;
        });
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return sorted;
  };

  return {
    collection,
    isLoading,
    addToCollection,
    removeFromCollection,
    isInCollection,
    getCollectionSize,
    sortCollection,
  };
} 