export interface Stream {
  id: number;
  userId: number;
  username: string;
  profileImageUrl?: string;
  title: string;
  description: string;
  streamKey: string;
  isLive: boolean;
  viewerCount: number;
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
}

export interface StreamListItem {
  id: number;
  username: string;
  profileImageUrl?: string;
  title: string;
  description: string;
  isLive: boolean;
  viewerCount: number;
  startedAt?: Date;
}

export interface CreateStreamRequest {
  title: string;
  description: string;
}

export interface StreamKeyResponse {
  streamKey: string;
  rtmpUrl: string;
}