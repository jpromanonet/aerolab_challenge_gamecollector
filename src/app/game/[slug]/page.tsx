import GameDetailClient from "./GameDetailClient";
import { Metadata } from "next";

interface GameDetailPageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for the game detail page
export async function generateMetadata({ params }: GameDetailPageProps): Promise<Metadata> {
  const { slug } = params;
  
  try {
    // Try to get game details for metadata
    let gameId: number | null = null;
    
    // Check if the slug is a number (ID)
    const parsedId = parseInt(slug);
    if (!isNaN(parsedId)) {
      gameId = parsedId;
    } else {
      // If it's not a number, search for the game
      try {
        const searchQuery = slug.replace(/-/g, ' ');
        const searchResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/search?q=${encodeURIComponent(searchQuery)}&limit=1`);
        if (searchResponse.ok) {
          const searchResults = await searchResponse.json();
          if (searchResults.length > 0) {
            gameId = searchResults[0].id;
          }
        }
      } catch (error) {
        console.error("Error searching for game metadata:", error);
      }
    }

    if (gameId) {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/games/${gameId}`);
      if (response.ok) {
        const data = await response.json();
        const game = data.game;
        
        const title = `${game.name} - Gaming Haven Z`;
        const description = game.name ? 
          `Discover ${game.name} - a video game with ${game.rating ? `a rating of ${game.rating.toFixed(1)}/5` : 'amazing gameplay'}. ${game.first_release_date ? `Released in ${new Date(game.first_release_date * 1000).getFullYear()}.` : ''} Add it to your collection today!` :
          'Discover amazing video games and build your collection';
        
        const imageUrl = game.cover?.url || '/logo.svg';
        
        return {
          title,
          description,
          openGraph: {
            title,
            description,
            type: 'website',
            url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/game/${slug}`,
            images: [
              {
                url: imageUrl,
                width: 1200,
                height: 630,
                alt: `Cover art for ${game.name}`,
              },
            ],
            siteName: 'Gaming Haven Z',
            locale: 'en_US',
          },
          twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
          },
        };
      }
    }
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  // Fallback metadata
  return {
    title: 'Game Details - Gaming Haven Z',
    description: 'Discover amazing video games and build your collection',
    openGraph: {
      title: 'Game Details - Gaming Haven Z',
      description: 'Discover amazing video games and build your collection',
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/game/${slug}`,
      images: ['/logo.svg'],
      siteName: 'Gaming Haven Z',
    },
  };
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { slug } = params;
  return <GameDetailClient slug={slug} />;
}