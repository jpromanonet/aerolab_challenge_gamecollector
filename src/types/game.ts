export interface Game {
  id: number;
  name: string;
  cover?: {
    id: number;
    url: string;
  };
  first_release_date?: number;
  rating?: number;
  platforms?: Platform[];
  screenshots?: Screenshot[];
  similar_games?: number[];
  slug?: string;
  developer?: string;
}

export interface Platform {
  id: number;
  name: string;
}

export interface Screenshot {
  id: number;
  url: string;
}

export interface SearchResult {
  id: number;
  name: string;
  cover?: {
    id: number;
    url: string;
  };
  first_release_date?: number;
  slug?: string;
}

export interface CollectedGame extends Game {
  collectedAt: number;
} 