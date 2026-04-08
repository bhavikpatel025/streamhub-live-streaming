import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr/dist/browser/signalr.js';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { ChatMessage } from '../models/chat.model';
import { StreamStartedNotification } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private chatHubConnection?: signalR.HubConnection;
  private streamHubConnection?: signalR.HubConnection;
  private chatStartPromise?: Promise<void>;
  private streamStartPromise?: Promise<void>;
  private activeChatStreamId?: number;
  private activeViewerStreamId?: number;

  public chatMessage$ = new Subject<ChatMessage>();
  public chatHistory$ = new BehaviorSubject<ChatMessage[]>([]);
  public hubError$ = new Subject<string>();
  public viewerCount$ = new BehaviorSubject<number>(0);
  public viewerCountUpdated$ = new Subject<{ streamId: number, viewers: number }>();
  public globalViewerCount$ = new Subject<{ streamId: number, viewers: number }>();
  public likeCount$ = new BehaviorSubject<number>(0);
  public dislikeCount$ = new BehaviorSubject<number>(0);
  public reactionUpdated$ = new Subject<{ streamId: number, likes: number, dislikes: number }>();
  public streamStarted$ = new Subject<number>();
  public streamEnded$ = new Subject<number>();
  public streamStartedNotification$ = new Subject<StreamStartedNotification>();

  constructor(private authService: AuthService) {}

  private normalizeImageUrl(message: ChatMessage): ChatMessage {
    if (message.profileImageUrl && !message.profileImageUrl.startsWith('http')) {
      return {
        ...message,
        profileImageUrl: `${environment.signalRUrl}${message.profileImageUrl}`
      };
    }
    return message;
  }

  startChatConnection(): Promise<void> {
    if (this.chatHubConnection) {
      return this.ensureConnected(this.chatHubConnection, 'chatStartPromise');
    }

    this.getRequiredToken();
    this.chatHubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.signalRUrl}/chatHub`, {
        accessTokenFactory: () => this.getRequiredToken()
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .build();

    this.chatHubConnection.on('ReceiveMessage', (message: ChatMessage) => {
      this.chatMessage$.next(this.normalizeImageUrl(message));
    });

    this.chatHubConnection.on('LoadMessages', (messages: ChatMessage[]) => {
      this.chatHistory$.next(messages.map(m => this.normalizeImageUrl(m)));
    });

    this.chatHubConnection.on('Error', (message: string) => {
      this.hubError$.next(message);
    });

    this.chatHubConnection.onreconnected(async () => {
      if (this.activeChatStreamId) {
        await this.chatHubConnection?.invoke('JoinChat', this.activeChatStreamId);
      }
    });

    this.chatHubConnection.onclose((error) => {
      if (error) {
        this.hubError$.next('Chat connection closed unexpectedly.');
      }
    });

    return this.ensureConnected(this.chatHubConnection, 'chatStartPromise');
  }

  async joinChatRoom(streamId: number): Promise<void> {
    const connection = this.getChatConnection();
    await this.ensureConnected(connection, 'chatStartPromise');
    await connection.invoke('JoinChat', streamId);
    this.activeChatStreamId = streamId;
  }

  async leaveChatRoom(streamId: number): Promise<void> {
    const connection = this.chatHubConnection;
    if (!connection) {
      return;
    }

    if (connection.state === signalR.HubConnectionState.Connected) {
      await connection.invoke('LeaveChat', streamId);
    }

    if (this.activeChatStreamId === streamId) {
      this.activeChatStreamId = undefined;
      this.chatHistory$.next([]);
    }
  }

  async sendChatMessage(streamId: number, message: string): Promise<void> {
    const connection = this.getChatConnection();
    await this.ensureConnected(connection, 'chatStartPromise');
    await connection.invoke('SendMessage', streamId, message.trim());
  }

  async stopChatConnection(): Promise<void> {
    this.activeChatStreamId = undefined;
    this.chatHistory$.next([]);
    this.chatStartPromise = undefined;

    if (this.chatHubConnection) {
      await this.chatHubConnection.stop();
      this.chatHubConnection = undefined;
    }
  }

  startStreamConnection(): Promise<void> {
    if (this.streamHubConnection) {
      return this.ensureConnected(this.streamHubConnection, 'streamStartPromise');
    }

    this.getRequiredToken();
    this.streamHubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.signalRUrl}/streamHub`, {
        accessTokenFactory: () => this.getRequiredToken()
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .build();

    this.streamHubConnection.on('ViewerCountUpdated', (data: { streamId: number, viewers: number }) => {
      this.viewerCountUpdated$.next(data);
      if (this.activeViewerStreamId === data.streamId) {
        this.viewerCount$.next(data.viewers);
      }
    });

    this.streamHubConnection.on('GlobalViewerCountUpdated', (data: { streamId: number, viewers: number }) => {
      this.globalViewerCount$.next(data);
    });

    this.streamHubConnection.on('StreamStarted', (streamId: number) => {
      this.streamStarted$.next(streamId);
    });

    this.streamHubConnection.on('StreamStartedNotification', (notification: StreamStartedNotification) => {
      this.streamStartedNotification$.next(notification);
    });

    this.streamHubConnection.on('StreamEnded', (streamId: number) => {
      this.streamEnded$.next(streamId);
    });

    this.streamHubConnection.on('ReactionUpdated', (data: { streamId: number; likes: number; dislikes: number }) => {
      this.reactionUpdated$.next(data);
      if (this.activeViewerStreamId === data.streamId) {
        this.likeCount$.next(data.likes);
        this.dislikeCount$.next(data.dislikes);
      }
    });

    this.streamHubConnection.onreconnected(async () => {
      if (this.activeViewerStreamId) {
        await this.streamHubConnection?.invoke('JoinStream', this.activeViewerStreamId);
      }
    });

    this.streamHubConnection.onclose((error) => {
      if (error) {
        this.hubError$.next('Stream connection closed unexpectedly.');
      }
    });

    return this.ensureConnected(this.streamHubConnection, 'streamStartPromise');
  }

  async joinStream(streamId: number): Promise<void> {
    const connection = this.getStreamConnection();
    await this.ensureConnected(connection, 'streamStartPromise');
    await connection.invoke('JoinStream', streamId);
    this.activeViewerStreamId = streamId;
  }

  async leaveStream(streamId: number): Promise<void> {
    const connection = this.streamHubConnection;
    if (!connection) {
      return;
    }

    if (connection.state === signalR.HubConnectionState.Connected) {
      await connection.invoke('LeaveStream', streamId);
    }

    if (this.activeViewerStreamId === streamId) {
      this.activeViewerStreamId = undefined;
    }
  }

  async notifyStreamStarted(streamId: number): Promise<void> {
    const connection = this.getStreamConnection();
    await this.ensureConnected(connection, 'streamStartPromise');
    await connection.invoke('NotifyStreamStarted', streamId);
  }

  async notifyStreamEnded(streamId: number): Promise<void> {
    const connection = this.getStreamConnection();
    await this.ensureConnected(connection, 'streamStartPromise');
    await connection.invoke('NotifyStreamEnded', streamId);
  }

  async stopStreamConnection(): Promise<void> {
    this.activeViewerStreamId = undefined;
    this.streamStartPromise = undefined;

    if (this.streamHubConnection) {
      await this.streamHubConnection.stop();
      this.streamHubConnection = undefined;
    }
  }

  private getRequiredToken(): string {
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    return token;
  }

  private getChatConnection(): signalR.HubConnection {
    if (!this.chatHubConnection) {
      throw new Error('Chat connection not established');
    }

    return this.chatHubConnection;
  }

  private getStreamConnection(): signalR.HubConnection {
    if (!this.streamHubConnection) {
      throw new Error('Stream connection not established');
    }

    return this.streamHubConnection;
  }

  private ensureConnected(
    connection: signalR.HubConnection,
    promiseKey: 'chatStartPromise' | 'streamStartPromise'
  ): Promise<void> {
    if (connection.state === signalR.HubConnectionState.Connected) {
      return Promise.resolve();
    }

    const existingPromise = this[promiseKey];
    if (existingPromise) {
      return existingPromise;
    }

    if (connection.state === signalR.HubConnectionState.Connecting ||
        connection.state === signalR.HubConnectionState.Reconnecting) {
      return Promise.reject(new Error('SignalR connection is not ready yet.'));
    }

    const startPromise = connection.start()
      .finally(() => {
        this[promiseKey] = undefined;
      });

    this[promiseKey] = startPromise;
    return startPromise;
  }
}
