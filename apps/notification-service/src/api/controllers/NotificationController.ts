import { asyncHandler } from "@vero/shared-http";
import { parseOrThrow, z } from "@vero/shared-validation";
import type { RequestHandler, Response } from "express";
import type { GetNotificationPreferencesService } from "../../application/services/GetNotificationPreferencesService.js";
import type { GetNotificationsService } from "../../application/services/GetNotificationsService.js";
import type { MarkAllNotificationsReadService } from "../../application/services/MarkAllNotificationsReadService.js";
import type { MarkNotificationReadService } from "../../application/services/MarkNotificationReadService.js";
import type { UpdateNotificationPreferencesService } from "../../application/services/UpdateNotificationPreferencesService.js";
import { NOTIFICATION_DEFAULTS } from "../../constants/notificationConstants.js";
import type { UpdateNotificationPreferenceInput } from "../../domain/repositories/NotificationPreferenceRepository.js";
import type { AuthenticatedRequest } from "../../types/AuthenticatedRequest.js";

const listNotificationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(NOTIFICATION_DEFAULTS.page),
  limit: z.coerce.number().int().min(1).max(NOTIFICATION_DEFAULTS.maxLimit).default(NOTIFICATION_DEFAULTS.limit),
  isRead: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional()
});

const idParamsSchema = z.object({
  id: z.string().uuid()
});

const updatePreferencesSchema = z.object({
  pushEnabled: z.boolean().optional(),
  paymentNotifications: z.boolean().optional(),
  moneyReceivedNotifications: z.boolean().optional(),
  moneySentNotifications: z.boolean().optional(),
  securityNotifications: z.boolean().optional(),
  promotionalNotifications: z.boolean().optional(),
  goalNotifications: z.boolean().optional(),
  aiInsightNotifications: z.boolean().optional()
});

export class NotificationController {
  public constructor(
    private readonly getNotificationsService: GetNotificationsService,
    private readonly markNotificationReadService: MarkNotificationReadService,
    private readonly markAllNotificationsReadService: MarkAllNotificationsReadService,
    private readonly getPreferencesService: GetNotificationPreferencesService,
    private readonly updatePreferencesService: UpdateNotificationPreferencesService
  ) {}

  public getNotifications: RequestHandler = asyncHandler(async (request, response: Response) => {
    const authenticated = request as AuthenticatedRequest;
    const query = parseOrThrow(
      listNotificationsSchema as unknown as z.Schema<{ page: number; limit: number; isRead?: boolean }>,
      request.query
    );
    const result = await this.getNotificationsService.list({
      userId: authenticated.principal.userId,
      page: query.page ?? NOTIFICATION_DEFAULTS.page,
      limit: query.limit ?? NOTIFICATION_DEFAULTS.limit,
      ...(query.isRead !== undefined ? { isRead: query.isRead } : {})
    });
    response.status(200).json({ data: result });
  });

  public getUnreadCount: RequestHandler = asyncHandler(async (request, response: Response) => {
    const authenticated = request as AuthenticatedRequest;
    const result = await this.getNotificationsService.unreadCount(authenticated.principal.userId);
    response.status(200).json({ data: result });
  });

  public markRead: RequestHandler = asyncHandler(async (request, response: Response) => {
    const authenticated = request as AuthenticatedRequest;
    const params = parseOrThrow(idParamsSchema, request.params);
    const result = await this.markNotificationReadService.markRead(params.id, authenticated.principal.userId);
    response.status(200).json({ data: result });
  });

  public markAllRead: RequestHandler = asyncHandler(async (request, response: Response) => {
    const authenticated = request as AuthenticatedRequest;
    const result = await this.markAllNotificationsReadService.markAllRead(authenticated.principal.userId);
    response.status(200).json({ data: result });
  });

  public getPreferences: RequestHandler = asyncHandler(async (request, response: Response) => {
    const authenticated = request as AuthenticatedRequest;
    const result = await this.getPreferencesService.get(authenticated.principal.userId);
    response.status(200).json({ data: result });
  });

  public updatePreferences: RequestHandler = asyncHandler(async (request, response: Response) => {
    const authenticated = request as AuthenticatedRequest;
    const body = parseOrThrow(updatePreferencesSchema, request.body);
    const input: UpdateNotificationPreferenceInput = {};

    if (body.pushEnabled !== undefined) input.pushEnabled = body.pushEnabled;
    if (body.paymentNotifications !== undefined) input.paymentNotifications = body.paymentNotifications;
    if (body.moneyReceivedNotifications !== undefined) {
      input.moneyReceivedNotifications = body.moneyReceivedNotifications;
    }
    if (body.moneySentNotifications !== undefined) input.moneySentNotifications = body.moneySentNotifications;
    if (body.securityNotifications !== undefined) input.securityNotifications = body.securityNotifications;
    if (body.promotionalNotifications !== undefined) {
      input.promotionalNotifications = body.promotionalNotifications;
    }
    if (body.goalNotifications !== undefined) input.goalNotifications = body.goalNotifications;
    if (body.aiInsightNotifications !== undefined) input.aiInsightNotifications = body.aiInsightNotifications;

    const result = await this.updatePreferencesService.update(authenticated.principal.userId, input);
    response.status(200).json({ data: result });
  });
}
