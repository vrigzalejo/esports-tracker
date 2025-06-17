export interface VideoGame {
  id: number;
  name: string;
  slug: string;
}

export interface Player {
  active: boolean;
  age: number | null;
  birthday: string | null;
  first_name: string;
  id: number;
  image_url: string | null;
  last_name: string;
  modified_at: string;
  name: string;
  nationality: string | null;
  role: string | null;
  slug: string;
  current_videogame?: VideoGame;
  current_team?: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

export interface Roster {
  acronym: string;
  current_videogame: VideoGame;
  id: number;
  image_url: string;
  location: string;
  modified_at: string;
  name: string;
  players: Player[];
  slug: string;
}

// Response when type is "Team" - contains team rosters
export interface TeamRosterResponse {
  rosters: Roster[];
  type: "Team";
}

// Response when type is "Player" - contains individual players
export interface PlayerRosterResponse {
  rosters: Player[];
  type: "Player";
}

// Union type for all possible roster responses
export type RosterResponse = TeamRosterResponse | PlayerRosterResponse;

/**
 * Example usage:
 * 
 * // Handle roster response with type discrimination
 * const handleRosterResponse = (data: RosterResponse, teamId?: number, playerId?: number) => {
 *   if (data.type === 'Team') {
 *     // data.rosters is Roster[] - contains teams with players
 *     const teamRoster = data.rosters.find(r => r.id === teamId);
 *     return teamRoster?.players || [];
 *   } else if (data.type === 'Player') {
 *     // data.rosters is Player[] - contains individual players
 *     if (playerId) {
 *       // Filter by specific player ID if explicitly provided
 *       return data.rosters.filter(p => p.id === playerId);
 *     } else if (teamId) {
 *       // When type is "Player", teamId might actually be a playerId
 *       const playerById = data.rosters.find(p => p.id === teamId);
 *       if (playerById) {
 *         // teamId was actually a playerId
 *         return [playerById];
 *       } else {
 *         // teamId is actually a team ID, try to filter by current team
 *         const playersForTeam = data.rosters.filter(p => p.current_team?.id === teamId);
 *         return playersForTeam.length > 0 ? playersForTeam : data.rosters;
 *       }
 *     }
 *     // Return all players if no filters
 *     return data.rosters;
 *   }
 *   return [];
 * };
 */ 
