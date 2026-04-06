export interface User {
  userId: number;
  username: string;
  email: string;
  profileImageUrl?: string;
  token: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  profileImageUrl?: string;
  createdAt: string;
}