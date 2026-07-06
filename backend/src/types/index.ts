import { Timestamp } from 'firebase-admin/firestore';

// ─── API Response Wrapper ────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Firebase Auth ───────────────────────────────────────────────────────────

/** Decoded Firebase ID token attached to req.user by auth middleware */
export interface AuthUser {
  uid: string;
  email: string | undefined;
  name?: string;
}

// ─── Firestore Documents ─────────────────────────────────────────────────────

export interface FamilyDoc {
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

export interface MemberDoc {
  uid: string;
  name: string;
  email: string;
  role: 'owner' | 'member';
  avatarColor: string;
  joinedAt: Timestamp;
}

export interface UserDoc {
  familyId: string;
  familyName: string;
  name: string;
  email: string;
}

// ─── Request Bodies ──────────────────────────────────────────────────────────

export interface CreateFamilyBody {
  familyName: string;
  displayName: string;
}

export interface JoinFamilyBody {
  inviteCode: string;
  displayName: string;
}

export interface UpdateProfileBody {
  displayName: string;
}

// ─── Response Shapes ─────────────────────────────────────────────────────────

export interface FamilyResponse {
  familyId: string;
  familyName: string;
  inviteCode: string;
  members: MemberPublic[];
  settings: FamilySettings;
}

export interface MemberPublic {
  uid: string;
  name: string;
  role: 'owner' | 'member';
  avatarColor: string;
}

// ─── Weather ─────────────────────────────────────────────────────────────────

export interface WeatherResponse {
  temperature: number;
  feelsLike: number;
  description: string;
  icon: string;
  city: string;
  humidity: number;
  windSpeed: number;
}

// ─── Quotes ──────────────────────────────────────────────────────────────────

export interface QuoteResponse {
  text: string;
  author: string;
}

// ─── Express augmentation — adds req.user ────────────────────────────────────

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
