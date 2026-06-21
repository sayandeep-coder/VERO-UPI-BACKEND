export type UserStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export interface User {
  id: string;
  mobileNumber: string;
  fullName: string | null;
  email: string | null;
  profilePicture: string | null;
  status: UserStatus;
  isVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface UserDevice {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string | null;
  deviceModel: string | null;
  operatingSystem: string | null;
  appVersion: string | null;
  isActive: boolean;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  refreshToken: string;
  deviceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicUserProfile {
  id: string;
  mobileNumber: string;
  fullName: string | null;
  email: string | null;
  profilePicture: string | null;
  status: UserStatus;
  isVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}
