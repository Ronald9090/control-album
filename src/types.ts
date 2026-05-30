export interface Achievement {
  id: string;
  title: string;
  description: string;
  targetCount?: number;
  targetPercent?: number;
  unlockedAt?: string | null;
  iconName: string;
}

export interface Profile {
  name: string;
  avatar: string; // emoji, like 🏆, ⚽, 🦁, 🦖
  favoriteTeam: string;
}

export interface HistoryLog {
  id: string;
  timestamp: string;
  change: number; // e.g. +1, -1, +5
  newCount: number;
}
