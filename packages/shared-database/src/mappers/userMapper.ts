import type { User as PrismaUser, UserDevice as PrismaUserDevice, UserSession as PrismaUserSession } from "@prisma/client";
import type { PublicUserProfile, User, UserDevice, UserSession } from "@vero/shared-types";

export const toUser = (record: PrismaUser): User => ({
  id: record.id,
  mobileNumber: record.mobileNumber,
  fullName: record.fullName,
  email: record.email,
  profilePicture: record.profilePicture,
  status: record.status as User["status"],
  isVerified: record.isVerified,
  lastLoginAt: record.lastLoginAt,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
  deletedAt: record.deletedAt
});

export const toPublicUserProfile = (record: PrismaUser): PublicUserProfile => ({
  id: record.id,
  mobileNumber: record.mobileNumber,
  fullName: record.fullName,
  email: record.email,
  profilePicture: record.profilePicture,
  status: record.status as PublicUserProfile["status"],
  isVerified: record.isVerified,
  lastLoginAt: record.lastLoginAt,
  createdAt: record.createdAt
});

export const toUserDevice = (record: PrismaUserDevice): UserDevice => ({
  id: record.id,
  userId: record.userId,
  deviceId: record.deviceId,
  deviceName: record.deviceName,
  deviceModel: record.deviceModel,
  operatingSystem: record.operatingSystem,
  appVersion: record.appVersion,
  isActive: record.isActive,
  lastSeenAt: record.lastSeenAt,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt
});

export const toUserSession = (record: PrismaUserSession): UserSession => ({
  id: record.id,
  userId: record.userId,
  refreshToken: record.refreshToken,
  deviceId: record.deviceId,
  ipAddress: record.ipAddress,
  userAgent: record.userAgent,
  expiresAt: record.expiresAt,
  revokedAt: record.revokedAt,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt
});
