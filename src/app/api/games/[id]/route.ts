import { NextRequest, NextResponse } from "next/server";

const IGDB_CLIENT_ID = process.env.NEXT_PUBLIC_IGDB_CLIENT_ID;
const IGDB_CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;

let accessToken: string | null = null;
let tokenExpiry: number = 0;

// Cache for game details
const gameCache = new Map<number, { data: any; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: IGDB_CLIENT_ID!,
      client_secret: IGDB_CLIENT_SECRET!,
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get access token");
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 minute buffer

  return accessToken!;
}

async function getGameDetails(gameId: number) {
  // Check cache first
  const cached = gameCache.get(gameId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const body = `
    fields name,cover.url,first_release_date,rating,platforms.name,screenshots.url,similar_games,slug,involved_companies.company.name,involved_companies.developer;
    where id = ${gameId};
  `;

  try {
    const token = await getAccessToken();
    const response = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": IGDB_CLIENT_ID!,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`IGDB API error: ${response.status}`);
    }

    const results = await response.json();
    if (results.length === 0) return null;

    const game = results[0];
    
    // Extract developer information
    let developer = "Unknown Developer";
    if (game.involved_companies && game.involved_companies.length > 0) {
      const developerCompany = game.involved_companies.find((ic: any) => ic.developer);
      if (developerCompany && developerCompany.company) {
        developer = developerCompany.company.name;
      }
    }

    const processedGame = {
      id: game.id,
      name: game.name,
      cover: game.cover ? {
        id: game.cover.id,
        url: game.cover.url.replace("t_thumb", "t_cover_big").replace("//", "https://"),
      } : undefined,
      first_release_date: game.first_release_date,
      rating: game.rating,
      platforms: game.platforms?.map((p: { id: number; name: string }) => ({
        id: p.id,
        name: p.name,
      })) || [],
      screenshots: game.screenshots?.map((s: { id: number; url: string }) => ({
        id: s.id,
        url: s.url.replace("t_thumb", "t_screenshot_huge").replace("//", "https://"),
      })) || [],
      similar_games: game.similar_games || [],
      slug: game.slug,
      developer: developer,
    };

    // Cache the result
    gameCache.set(gameId, {
      data: processedGame,
      timestamp: Date.now()
    });

    return processedGame;
  } catch (error) {
    console.error("Error getting game details:", error);
    return null;
  }
}

async function getSimilarGames(gameIds: number[]) {
  if (gameIds.length === 0) return [];

  const body = `
    fields name,cover.url,first_release_date,slug;
    where id = (${gameIds.join(",")});
    limit 6;
  `;

  try {
    const token = await getAccessToken();
    const response = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": IGDB_CLIENT_ID!,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body,
    });

    if (!response.ok) {
      throw new Error(`IGDB API error: ${response.status}`);
    }

    const results = await response.json();
    return results.map((game: { id: number; name: string; cover?: { id: number; url: string }; first_release_date?: number; slug?: string }) => ({
      id: game.id,
      name: game.name,
      cover: game.cover ? {
        id: game.cover.id,
        url: game.cover.url.replace("t_thumb", "t_cover_big").replace("//", "https://"),
      } : undefined,
      first_release_date: game.first_release_date,
      slug: game.slug,
    }));
  } catch (error) {
    console.error("Error getting similar games:", error);
    return [];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const gameId = parseInt(resolvedParams.id);

  if (isNaN(gameId)) {
    return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
  }

  try {
    const game = await getGameDetails(gameId);
    
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Get similar games if available
    let similarGames: { id: number; name: string; cover?: { id: number; url: string }; first_release_date?: number; slug?: string }[] = [];
    if (game.similar_games && game.similar_games.length > 0) {
      similarGames = await getSimilarGames(game.similar_games);
    }

    const responseData = {
      game,
      similarGames,
    };

    // Add caching headers
    const response = NextResponse.json(responseData);
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1200');
    
    return response;
  } catch (error) {
    console.error("Game details API error:", error);
    return NextResponse.json({ error: "Failed to get game details" }, { status: 500 });
  }
} 