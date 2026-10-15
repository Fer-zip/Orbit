import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Lineup, Formation, Player } from '../models/Lineup';

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

export const FORMATIONS: Formation[] = [
  {
    id: '4-3-3',
    name: '4-3-3 Clásico',
    players: [
      { id: 'GK', position: 'POR', top: 90, left: 50 },
      { id: 'LB', position: 'LI', top: 75, left: 15 },
      { id: 'LCB', position: 'DFC', top: 75, left: 35 },
      { id: 'RCB', position: 'DFC', top: 75, left: 65 },
      { id: 'RB', position: 'LD', top: 75, left: 85 },
      { id: 'LCM', position: 'MC', top: 55, left: 25 },
      { id: 'CM', position: 'MCD', top: 60, left: 50 },
      { id: 'RCM', position: 'MC', top: 55, left: 75 },
      { id: 'LW', position: 'EI', top: 30, left: 20 },
      { id: 'ST', position: 'DC', top: 25, left: 50 },
      { id: 'RW', position: 'ED', top: 30, left: 80 },
    ]
  },
  {
    id: '4-4-2',
    name: '4-4-2 Clásico',
    players: [
      { id: 'GK', position: 'POR', top: 90, left: 50 },
      { id: 'LB', position: 'LI', top: 75, left: 15 },
      { id: 'LCB', position: 'DFC', top: 75, left: 35 },
      { id: 'RCB', position: 'DFC', top: 75, left: 65 },
      { id: 'RB', position: 'LD', top: 75, left: 85 },
      { id: 'LM', position: 'MI', top: 50, left: 15 },
      { id: 'LCM', position: 'MC', top: 55, left: 35 },
      { id: 'RCM', position: 'MC', top: 55, left: 65 },
      { id: 'RM', position: 'MD', top: 50, left: 85 },
      { id: 'LST', position: 'DC', top: 25, left: 35 },
      { id: 'RST', position: 'DC', top: 25, left: 65 },
    ]
  },
  {
    id: '3-5-2',
    name: '3-5-2 Ofensivo',
    players: [
      { id: 'GK', position: 'POR', top: 90, left: 50 },
      { id: 'LCB', position: 'DFC', top: 75, left: 25 },
      { id: 'CB', position: 'DFC', top: 80, left: 50 },
      { id: 'RCB', position: 'DFC', top: 75, left: 75 },
      { id: 'LWB', position: 'CRI', top: 55, left: 10 },
      { id: 'LCM', position: 'MC', top: 50, left: 35 },
      { id: 'CDM', position: 'MCD', top: 60, left: 50 },
      { id: 'RCM', position: 'MC', top: 50, left: 65 },
      { id: 'RWB', position: 'CRD', top: 55, left: 90 },
      { id: 'LST', position: 'DC', top: 25, left: 35 },
      { id: 'RST', position: 'DC', top: 25, left: 65 },
    ]
  },
  {
    id: '4-2-3-1',
    name: '4-2-3-1',
    players: [
      { id: 'GK', position: 'POR', top: 90, left: 50 },
      { id: 'LB', position: 'LI', top: 75, left: 15 },
      { id: 'LCB', position: 'DFC', top: 75, left: 35 },
      { id: 'RCB', position: 'DFC', top: 75, left: 65 },
      { id: 'RB', position: 'LD', top: 75, left: 85 },
      { id: 'LDM', position: 'MCD', top: 60, left: 35 },
      { id: 'RDM', position: 'MCD', top: 60, left: 65 },
      { id: 'LAM', position: 'MCO', top: 40, left: 20 },
      { id: 'CAM', position: 'MCO', top: 40, left: 50 },
      { id: 'RAM', position: 'MCO', top: 40, left: 80 },
      { id: 'ST', position: 'DC', top: 20, left: 50 },
    ]
  },
  {
    id: '5-3-2',
    name: '5-3-2 Defensivo',
    players: [
      { id: 'GK', position: 'POR', top: 90, left: 50 },
      { id: 'LWB', position: 'CRI', top: 70, left: 10 },
      { id: 'LCB', position: 'DFC', top: 75, left: 30 },
      { id: 'CB', position: 'DFC', top: 80, left: 50 },
      { id: 'RCB', position: 'DFC', top: 75, left: 70 },
      { id: 'RWB', position: 'CRD', top: 70, left: 90 },
      { id: 'LCM', position: 'MC', top: 50, left: 25 },
      { id: 'CM', position: 'MC', top: 55, left: 50 },
      { id: 'RCM', position: 'MC', top: 50, left: 75 },
      { id: 'LST', position: 'DC', top: 25, left: 35 },
      { id: 'RST', position: 'DC', top: 25, left: 65 },
    ]
  },
  {
    id: '4-1-2-1-2',
    name: '4-1-2-1-2 (Rombo)',
    players: [
      { id: 'GK', position: 'POR', top: 90, left: 50 },
      { id: 'LB', position: 'LI', top: 75, left: 15 },
      { id: 'LCB', position: 'DFC', top: 75, left: 35 },
      { id: 'RCB', position: 'DFC', top: 75, left: 65 },
      { id: 'RB', position: 'LD', top: 75, left: 85 },
      { id: 'CDM', position: 'MCD', top: 60, left: 50 },
      { id: 'LM', position: 'MI', top: 50, left: 25 },
      { id: 'RM', position: 'MD', top: 50, left: 75 },
      { id: 'CAM', position: 'MCO', top: 40, left: 50 },
      { id: 'LST', position: 'DC', top: 25, left: 35 },
      { id: 'RST', position: 'DC', top: 25, left: 65 },
    ]
  },
  {
    id: '3-1-2-2-1',
    name: '3-1-2-2-1',
    players: [
      { id: 'GK', position: 'POR', top: 90, left: 50 },
      { id: 'LCB', position: 'DFC', top: 80, left: 25 },
      { id: 'CB', position: 'DFC', top: 80, left: 50 },
      { id: 'RCB', position: 'DFC', top: 80, left: 75 },
      { id: 'CDM', position: 'MCD', top: 65, left: 50 },
      { id: 'LM', position: 'MC', top: 50, left: 30 },
      { id: 'RM', position: 'MC', top: 50, left: 70 },
      { id: 'LAM', position: 'MCO', top: 35, left: 30 },
      { id: 'RAM', position: 'MCO', top: 35, left: 70 },
      { id: 'ST', position: 'DC', top: 20, left: 50 },
    ]
  }
];

interface LineupsState {
  lineups: Lineup[];
  loadLineups: () => Promise<void>;
  saveLineup: (lineup: Omit<Lineup, 'id'> & { id?: string }) => Promise<void>;
  deleteLineup: (id: string) => Promise<void>;
}

export const useLineupsStore = create<LineupsState>((set, get) => ({
  lineups: [],

  loadLineups: async () => {
    try {
      const data = await AsyncStorage.getItem('@orbit_lineups');
      if (data) {
        set({ lineups: JSON.parse(data) });
      }
    } catch (e) {
      console.error('Error loading lineups:', e);
    }
  },

  saveLineup: async (lineupData) => {
    const { lineups } = get();
    let updated;
    
    if (lineupData.id) {
      updated = lineups.map(l => l.id === lineupData.id ? { ...lineupData, id: l.id } as Lineup : l);
    } else {
      updated = [...lineups, { ...lineupData, id: generateId() } as Lineup];
    }
    
    set({ lineups: updated });
    await AsyncStorage.setItem('@orbit_lineups', JSON.stringify(updated));
  },

  deleteLineup: async (id) => {
    const { lineups } = get();
    const updated = lineups.filter(l => l.id !== id);
    set({ lineups: updated });
    await AsyncStorage.setItem('@orbit_lineups', JSON.stringify(updated));
  }
}));
