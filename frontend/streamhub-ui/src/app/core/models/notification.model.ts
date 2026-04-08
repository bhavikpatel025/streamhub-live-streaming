export interface StreamStartedNotification {
  id: number;
  streamId: number;
  streamTitle: string;
  streamerName: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export type NotificationItem = StreamStartedNotification;
