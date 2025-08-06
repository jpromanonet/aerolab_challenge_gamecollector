import type { Metadata } from "next";

interface GameLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const { slug } = await Promise.resolve(params);
  
  // Primero intenta parsear el slug como ID numérico
  const gameId = parseInt(slug);
  const isNumericId = !isNaN(gameId);
  
  try {
    let apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/games/${slug}`;
    
    // Si el slug no es numérico, intenta buscar por nombre
    if (!isNumericId) {
      const searchResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/search?q=${encodeURIComponent(slug.replace(/-/g, ' '))}&limit=1`);
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.length > 0) {
          apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/games/${searchData[0].id}`;
        }
      }
    }

    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 },
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error(`API Error for ${apiUrl}:`, response.status, response.statusText);
      return {
        title: `${slug.replace(/-/g, ' ')} | Aerolab Game Collector`,
        description: "Game details",
      };
    }
    
    const data = await response.json();
    
    if (!data?.game) {
      console.error('Game data missing in response:', data);
      return {
        title: `${slug.replace(/-/g, ' ')} | Aerolab Game Collector`,
        description: "Game details",
      };
    }

    const game = data.game;
    const title = `${game.name} | Aerolab Game Collector`;
    const releaseYear = game.first_release_date ? new Date(game.first_release_date * 1000).getFullYear() : null;
    const description = `Discover ${game.name}${game.rating ? ` with rating ${game.rating.toFixed(1)}/10` : ''}${releaseYear ? `, released in ${releaseYear}` : ''}.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        images: game.cover?.url ? [
          {
            url: game.cover.url,
            width: 600,
            height: 800,
            alt: game.name,
          }
        ] : undefined,
      },
      twitter: {
        card: game.cover?.url ? "summary_large_image" : "summary",
        title,
        description,
        images: game.cover?.url ? [game.cover.url] : undefined,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: `${slug.replace(/-/g, ' ')} | Aerolab Game Collector`,
      description: "Game details",
    };
  }
}

export default function GameLayout({ children }: GameLayoutProps) {
  return children;
}