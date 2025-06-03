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
  image_url: string;
  last_name: string;
  modified_at: string;
  name: string;
  nationality: string | null;
  role: string;
  slug: string;
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

export interface RosterResponse {
  rosters: Roster[];
  type: string;
} 
