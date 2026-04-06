import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { SignalRService } from '../../../core/services/signalr.service';
import { StreamService } from '../../../core/services/stream.service';
import { StreamLikeService } from '../../../core/services/stream-like.service';
import { Stream } from '../../../core/models/stream.model';
import { ChatComponent } from '../../shared/chat/chat.component';
import { VideoPlayerComponent } from '../../shared/video-player/video-player.component';
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar.component';

@Component({
  selector: 'app-stream-view',
  standalone: true,
  imports: [
    CommonModule,
    VideoPlayerComponent,
    ChatComponent,
    CardModule,
    AvatarModule,
    ButtonModule,
    TagModule,
    SkeletonModule,
    UserAvatarComponent
  ],
  templateUrl: './stream-view.component.html',
  styleUrls: ['./stream-view.component.scss']
})
export class StreamViewComponent implements OnInit, OnDestroy {
  stream?: Stream;
  loading = true;
  viewerCount = 0;
  likeCount = 0;
  isLiked = false;
  likeLoading = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private streamService: StreamService,
    private streamLikeService: StreamLikeService,
    private signalRService: SignalRService
  ) {}

  ngOnInit(): void {
    const streamId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadStream(streamId);
    this.loadLikes(streamId);
    void this.setupSignalR(streamId);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());

    if (this.stream) {
      void this.signalRService.leaveStream(this.stream.id);
      void this.signalRService.leaveChatRoom(this.stream.id);
    }

    void this.signalRService.stopStreamConnection();
    void this.signalRService.stopChatConnection();
  }

  private loadStream(streamId: number): void {
    this.streamService.getStreamById(streamId).subscribe({
      next: (stream) => {
        this.stream = stream;
        this.viewerCount = stream.viewerCount;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load stream:', error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Stream unavailable',
          detail: 'This stream could not be loaded.'
        });
      }
    });
  }

  private loadLikes(streamId: number): void {
    this.streamLikeService.getLikes(streamId).subscribe({
      next: (result) => {
        this.likeCount = result.totalLikes;
        this.isLiked = result.isLikedByCurrentUser;
      },
      error: (error) => {
        console.error('Failed to load likes:', error);
      }
    });
  }

  toggleLike(): void {
    if (!this.stream || this.likeLoading) return;

    this.likeLoading = true;
    this.streamLikeService.toggleLike(this.stream.id).subscribe({
      next: (result) => {
        this.likeCount = result.totalLikes;
        this.isLiked = result.isLikedByCurrentUser;
        this.likeLoading = false;
      },
      error: (error) => {
        console.error('Failed to toggle like:', error);
        this.likeLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not update like.'
        });
      }
    });
  }

  private async setupSignalR(streamId: number): Promise<void> {
    try {
      await this.signalRService.startStreamConnection();
      await this.signalRService.startChatConnection();
      await this.signalRService.joinStream(streamId);
      await this.signalRService.joinChatRoom(streamId);

      this.subscriptions.push(
        this.signalRService.viewerCount$.subscribe((count) => {
          this.viewerCount = count;
        }),
        this.signalRService.likeCount$.subscribe((count) => {
          if (count > 0 || this.likeCount > 0) {
            this.likeCount = count;
          }
        }),
        this.signalRService.streamEnded$.subscribe((endedStreamId) => {
          if (endedStreamId === streamId) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Stream ended',
              detail: 'The broadcaster has ended this live session.'
            });
            void this.router.navigate(['/streams']);
          }
        })
      );
    } catch (error) {
      console.error('SignalR connection failed:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Realtime unavailable',
        detail: 'Chat and viewer updates could not connect.'
      });
    }
  }

  goBack(): void {
    void this.router.navigate(['/streams']);
  }

  getUserInitial(username?: string): string {
    return username?.charAt(0).toUpperCase() || 'S';
  }
}
