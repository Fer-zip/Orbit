export interface Player {
  id: string; // Unique for the position in the formation (e.g. 'GK', 'LB')
  name: string; // User input
  position: string; // Label like 'GK', 'ST'
  top: number; // percentage 0-100 (y-axis)
  left: number; // percentage 0-100 (x-axis)
}

export interface Formation {
  id: string; // e.g. "4-3-3"
  name: string;
  players: Omit<Player, 'name'>[]; // Base layout of the formation without names
}

export interface Lineup {
  id: string;
  name: string;
  formationId: string;
  players: Player[]; // Merged with names
}
