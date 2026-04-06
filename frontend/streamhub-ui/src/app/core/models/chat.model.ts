export interface ChatMessage {
  id: number;
  streamId: number;
  userId: number;
  username: string;
  profileImageUrl?: string;
  message: string;
  sentAt: Date;
}

export interface SendMessageRequest {
  streamId: number;
  message: string;
}