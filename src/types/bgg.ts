export type ItemType = 'standalone' | 'expansion';

export type WeightBracket = 'light' | 'medium-light' | 'medium-heavy' | 'heavy';

export interface GameRecord {
  id: number;
  name: string;
  originalName: string;
  year: number | null;
  type: ItemType;
  rank: number | null;
  rating: number;          // BGG community average rating (0-10)
  geekRating: number;      // BGG Bayesian weighted average rating (0-10)
  weight: number;          // 1.0 to 5.0
  weightBracket: WeightBracket;
  minPlayers: number;
  maxPlayers: number;
  bestPlayers: number[];   // e.g. [3, 4]
  recPlayers: number[];    // e.g. [2, 3, 4, 5]
  playTime: number;        // minutes
  minPlayTime: number;
  maxPlayTime: number;
  age: string;             // e.g. "12+"
  languageDependence: string;
  languageLevel: number;   // 0: Unspecified, 1: No text, 2: Some, 3: Moderate, 4: Extensive, 5: Unplayable
  numOwned: number;
  comment: string;         // user comments / storage location
  privateComment: string;
  invLocation: string;
  thumbnail?: string;      // BGG box art thumbnail
  image?: string;          // full BGG box art image
  description?: string;    // Full BGG game description
  shortDescription?: string;
  mechanics?: string[];    // BGG mechanics: "Worker Placement", "Deck Building", etc.
  categories?: string[];   // BGG categories: "Economic", "Fantasy", etc.
  searchTokens: string;    // Precomputed lowercase string for fuzzy matching
  owners?: { userId: string; userName: string; avatarColor: string }[]; // Group members who own this game
}

export type LibraryScope = 'user' | 'group';

export type ViewMode = 'grid' | 'table';

export type SortField =
  | 'rank'
  | 'name'
  | 'rating'
  | 'geekRating'
  | 'weight'
  | 'playTime'
  | 'year'
  | 'minPlayers'
  | 'maxPlayers';

export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  searchQuery: string;
  itemType: 'all' | 'standalone' | 'expansion';
  playerCount: number | null;        // null means any
  onlyBestPlayers: boolean;          // if true, playerCount must be in bestPlayers
  weightBrackets: WeightBracket[];   // selected brackets
  weightRange: [number, number];     // min, max (1.0 to 5.0)
  durationRange: [number, number];   // min, max (0 to 360)
  durationBracket: 'all' | 'quick' | 'mid' | 'main' | 'epic';
  selectedMechanics: string[];       // e.g. ["Deck Building", "Worker Placement"]
  selectedCategory: string;          // e.g. "Card Game" or ""
  languageLevels: number[];          // 1: No text, 2: Some, 3: Moderate, 4: Extensive, 5: Unplayable
  commentQuery: string;              // text query in comment / storage
  yearRange: [number, number];
}

export interface CollectionMetrics {
  totalCount: number;
  standaloneCount: number;
  expansionCount: number;
  avgWeight: number;
  avgRating: number;
  medianPlayTime: number;
  topRankedGame: GameRecord | null;
  mechanicsDistribution: Record<string, number>;
  playerCountCoverage: Record<number, number>;
}

// User Authentication & Profile
export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarColor: string; // e.g. 'orange', 'emerald', 'sky', 'purple', 'rose'
  bggUsername?: string;
  bio?: string;
  isPublic: boolean;   // if true, other group members can browse their library in read-only mode
  passwordHash?: string; // SHA-256 hashed password/PIN to protect account & profile editing
  role?: 'admin' | 'user'; // 'admin' grants super admin control over all profiles and settings
  createdAt: number;
}

// In-app messaging
export interface ChatMessage {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserColor: string;
  toUserId?: string;   // undefined or 'all' = Group Chat, or specific userId
  content: string;
  linkedGameId?: number;
  linkedGameName?: string;
  createdAt: number;
}

// Game Night Meetup & RSVP
export type MeetingRsvpStatus = 'confirmed' | 'maybe' | 'declined';

export interface MeetingParticipant {
  userId: string;
  userName: string;
  avatarColor: string;
  status: MeetingRsvpStatus;
  updatedAt: number;
}

export interface GameMeeting {
  id: string;
  hostUserId: string;
  hostUserName: string;
  hostAvatarColor: string;
  title: string;
  gameId?: number;
  gameName: string;
  gameThumbnail?: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:MM (e.g. "19:00")
  location: string;   // e.g. "Carlos' House", "The Dice Cafe"
  maxPlayers: number;
  description?: string;
  participants: MeetingParticipant[];
  createdAt: number;
}

