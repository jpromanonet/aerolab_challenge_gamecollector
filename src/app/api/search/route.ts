import { NextRequest, NextResponse } from "next/server";

const IGDB_CLIENT_ID = process.env.NEXT_PUBLIC_IGDB_CLIENT_ID;
const IGDB_CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;

let accessToken: string | null = null;
let tokenExpiry: number = 0;

// Cache for search results
const searchCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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

async function getPopularGames(limit: number = 10) {
  // Check cache first
  const cacheKey = `popular-${limit}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const body = `
    fields name,cover.url,first_release_date,slug,rating;
    sort rating desc;
    where category = 0 & rating != null;
    limit ${limit};
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
    const processedResults = results.map((game: { id: number; name: string; cover?: { id: number; url: string }; first_release_date?: number; slug?: string; rating?: number }) => ({
      id: game.id,
      name: game.name,
      cover: game.cover ? {
        id: game.cover.id,
        url: game.cover.url.replace("t_thumb", "t_cover_big").replace("//", "https://"),
      } : undefined,
      first_release_date: game.first_release_date,
      slug: game.slug,
      rating: game.rating,
    }));

    // Cache the results
    searchCache.set(cacheKey, {
      data: processedResults,
      timestamp: Date.now()
    });

    return processedResults;
  } catch (error) {
    console.error("Error fetching popular games:", error);
    return [];
  }
}

async function searchGames(query: string, limit: number = 10) {
  if (!query.trim()) return [];

  // Check cache first
  const cacheKey = `${query.toLowerCase()}-${limit}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  const body = `
    search "${query}";
    fields name,cover.url,first_release_date,slug;
    limit ${limit};
    where category = 0;
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
    const processedResults = results.map((game: { id: number; name: string; cover?: { id: number; url: string }; first_release_date?: number; slug?: string }) => ({
      id: game.id,
      name: game.name,
      cover: game.cover ? {
        id: game.cover.id,
        url: game.cover.url.replace("t_thumb", "t_cover_big").replace("//", "https://"),
      } : undefined,
      first_release_date: game.first_release_date,
      slug: game.slug,
    }));

    // Cache the results
    searchCache.set(cacheKey, {
      data: processedResults,
      timestamp: Date.now()
    });

    return processedResults;
  } catch (error) {
    console.error("Error searching games:", error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "10");

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  try {
    let results;
    
    // Handle popular games query
    if (query.toLowerCase() === 'popular') {
      results = await getPopularGames(limit);
    } else {
      results = await searchGames(query, limit);
    }
    
    // Add caching headers
    const response = NextResponse.json(results);
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    
    return response;
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Failed to search games" }, { status: 500 });
  }
} 