import type { Timestamp } from 'firebase/firestore';

// ─── Firebase / App Types ─────────────────────────────────────────────────────

/** Utility type that replaces Firestore Timestamps with JavaScript Dates */
export type WithDate<T> = {
  [K in keyof T]: T[K] extends Timestamp ? Date : T[K] extends Timestamp | null ? Date | null : T[K];
};

// ─── Family ───────────────────────────────────────────────────────────────────

export interface Family {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: Timestamp;
  createdBy: string;
  settings: FamilySettings;
}

export interface FamilySettings {
  timezone: string;
  weatherLat?: number;
  weatherLon?: number;
  weatherCity?: string;
  themeMode: 'dark' | 'light' | 'system';
}

// ─── Member ───────────────────────────────────────────────────────────────────

export interface Member {
  uid: string;
  name: string;
  email: string;
  role: 'owner' | 'member';
  avatarColor: string;
  joinedAt: Timestamp;
}

export interface UserProfile {
  uid: string;
  familyId?: string;
  familyName?: string;
  name: string;
  email: string;
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export type NoteColor = 'purple' | 'teal' | 'coral' | 'amber' | 'green';

export interface Note {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  createdBy: string;
  createdByName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NoteInput {
  title: string;
  content: string;
  color: NoteColor;
}

// ─── Shopping ─────────────────────────────────────────────────────────────────

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  purchased: boolean;
  addedBy: string;
  addedByName: string;
  addedAt: Timestamp;
}

export interface ShoppingItemInput {
  name: string;
  quantity: number;
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  dueDate: Timestamp | null;
  completed: boolean;
  priority: TaskPriority;
  createdBy: string;
  createdAt: Timestamp;
}

export interface TaskInput {
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  dueDate: Date | null;
  priority: TaskPriority;
}

// ─── Calendar Events ──────────────────────────────────────────────────────────

export type EventType = 'birthday' | 'appointment' | 'event';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Timestamp;
  type: EventType;
  repeatsAnnually: boolean;
  createdBy: string;
}

export interface EventInput {
  title: string;
  description: string;
  date: Date;
  type: EventType;
  repeatsAnnually: boolean;
}

// ─── Announcements ────────────────────────────────────────────────────────────

export interface Announcement {
  id: string;
  message: string;
  from: string;
  fromName: string;
  pinned: boolean;
  createdAt: Timestamp;
}

export interface AnnouncementInput {
  message: string;
  pinned: boolean;
}

// ─── Rewards ─────────────────────────────────────────────────────────────────

export interface RewardPoint {
  id: string;
  memberId: string;
  memberName: string;
  points: number;
  reason: string;
  awardedBy: string;
  createdAt: Timestamp;
}

export interface RewardInput {
  memberId: string;
  memberName: string;
  points: number;
  reason: string;
}

// ─── Widget Types ─────────────────────────────────────────────────────────────

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  description: string;
  icon: string;
  city: string;
  humidity: number;
  windSpeed: number;
}

export interface DailyQuote {
  text: string;
  author: string;
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  uid: string;
  name: string;
  avatarColor: string;
  totalPoints: number;
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

export type Theme = 'dark' | 'light';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
