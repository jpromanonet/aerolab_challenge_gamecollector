import Image from "next/image";
import Link from "next/link";
import { Heart, HeartOff, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CollectedGame } from "@/types/game";

interface GameCardProps {
  game: CollectedGame;
  isInCollection?: boolean;
  onAddToCollection?: (game: CollectedGame) => any;
  onRemoveFromCollection?: (gameId: number) => void;
  showRemoveButton?: boolean;
  className?: string;
  darkMode?: boolean;
  small?: boolean;
}

export function GameCard({
  game,
  isInCollection = false,
  onAddToCollection,
  onRemoveFromCollection,
  showRemoveButton = false,
  className,
  darkMode = false,
  small = false,
}: GameCardProps) {
  const handleAddToCollection = async (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await onAddToCollection?.(game);
  };

  const handleRemoveFromCollection = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Remove button clicked for game:', game.id, game.name);
    if (onRemoveFromCollection) {
      onRemoveFromCollection(game.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <Link
      href={`/game/${game.slug || game.id}`}
      className={cn(
        "group relative block rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
        darkMode 
          ? "bg-gray-800 hover:bg-gray-700" 
          : "bg-white hover:shadow-lg",
        small ? "max-w-32" : "",
        className
      )}
      aria-label={`View details for ${game.name}`}
      onClick={(e) => {
        // Don't prevent default here, let the link work normally
        // But stop propagation to prevent interference with buttons
        e.stopPropagation();
      }}
    >
      {/* Game Cover */}
      <div className={cn(
        "relative overflow-hidden",
        small ? "aspect-[3/4] w-full" : "aspect-[3/4]",
        darkMode ? "bg-gray-700" : "bg-gray-200"
      )}>
        {game.cover ? (
          <Image
            src={game.cover.url}
            alt={`Cover art for ${game.name}`}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes={small ? "128px" : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
            priority={false}
          />
        ) : (
          <div className={cn(
            "w-full h-full flex items-center justify-center",
            darkMode ? "bg-gray-700" : "bg-gray-300"
          )}>
            <span className={cn(
              "text-sm",
              darkMode ? "text-gray-500" : "text-gray-500"
            )}>
              No image
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute bottom-2 right-2 flex gap-1 z-20">
          {showRemoveButton ? (
            <button
              onClick={handleRemoveFromCollection}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onKeyDown={(e) => handleKeyDown(e, () => onRemoveFromCollection?.(game.id))}
              className="p-1.5 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 z-10 relative"
              title="Remove from collection"
              aria-label={`Remove ${game.name} from collection`}
              type="button"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleAddToCollection}
              onKeyDown={(e) => handleKeyDown(e, () => onAddToCollection?.(game))}
              className={cn(
                "p-1.5 rounded-full transition-colors duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
                isInCollection
                  ? "bg-gray-500 hover:bg-gray-600 text-white"
                  : "bg-pink-500 hover:bg-pink-600 text-white"
              )}
              title={isInCollection ? "Already in collection" : "Add to collection"}
              aria-label={isInCollection ? `${game.name} is already in collection` : `Add ${game.name} to collection`}
            >
              {isInCollection ? (
                <HeartOff className="w-4 h-4" />
              ) : (
                <Heart className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Rating Badge */}
        {game.rating && (
          <div 
            className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded"
            aria-label={`Rating: ${game.rating.toFixed(1)} out of 5 stars`}
          >
            ★ {game.rating.toFixed(1)}
          </div>
        )}
      </div>
     
    </Link>
  );
} 