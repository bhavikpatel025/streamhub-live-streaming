export interface ChatMessage {
  id: number;
  streamId: number;
  userId: number;
  username: string;
  message: string;
  sentAt: Date;
}

export interface SendMessageRequest {
  streamId: number;
  message: string;
}