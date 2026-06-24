import type { NotificationPreferenceRepository } from "../../domain/repositories/NotificationPreferenceRepository.js";
import type { NotificationRepository } from "../../domain/repositories/NotificationRepository.js";

export const createMockNotificationRepository = (): NotificationRepository => ({
  create: async () => {
    throw new Error("Mock not implemented");
  },
  findById: async () => null,
  findByUser: async () => [],
  countUnread: async () => 0,
  markRead: async () => null,
  markAllRead: async () => 0
});

export const createMockNotificationPreferenceRepository = (): NotificationPreferenceRepository => ({
  getOrCreate: async () => {
    throw new Error("Mock not implemented");
  },
  update: async () => {
    throw new Error("Mock not implemented");
  }
});
