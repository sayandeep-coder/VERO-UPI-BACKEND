export interface GetNotificationsQuery {
  userId: string;
  page: number;
  limit: number;
  isRead?: boolean;
}
