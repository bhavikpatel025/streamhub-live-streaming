import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SignalRService } from '../../../core/services/signalr.service';
import { StreamService } from '../../../core/services/stream.service';
import { Stream } from '../../../core/models/stream.model';
import { ChatComponent } from '../../shared/chat/chat.component';
import { VideoPlayerComponent } from '../../shared/video-player/video-player.component';

@Component({
  selector: 'app-stream-view',
  standalone: true,
  imports: [CommonModule, VideoPlayerComponent, ChatComponent],
  template: `
    <div class="container-fluid mt-4">
      @if (loading) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>
      } @else if (stream) {
        <div class="row">
          <div class="col-lg-9">
            <app-video-player [streamKey]="stream.streamKey"></app-video-player>

            <div class="stream-info mt-3">
              <div class="d-flex justify-content-between align-items-start">
                <div>
                  <h3>{{ stream.title }}</h3>
                  <p class="text-muted">{{ stream.description }}</p>
                  <div class="d-flex gap-3 align-items-center">
                    <span class="streamer-name">
                      <i class="bi bi-person-circle"></i> {{ stream.username }}
                    </span>
                    <span class="badge bg-danger">
                      <i class="bi bi-circle-fill pulse"></i> LIVE
                    </span>
                    <span class="viewer-count">
                      <i class="bi bi-eye-fill"></i> {{ viewerCount }} viewers
                    </span>
                  </div>
                </div>
                <button class="btn btn-outline-secondary" (click)="goBack()">
                  <i class="bi bi-arrow-left"></i> Back
                </button>
              </div>
            </div>
          </div>

          <div class="col-lg-3">
            <app-chat [streamId]="stream.id"></app-chat>
          </div>
        </div>
      } @else {
        <div class="alert alert-warning">
          Stream not found or no longer available.
        </div>
      }
    </div>
  `,
  styles: [`
    .stream-info {
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .streamer-name {
      font-weight: 500;
      color: #007bff;
      font-size: 1.1rem;
    }

    .viewer-count {
      font-size: 1rem;
      color: #666;
    }

    .pulse {
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `]
})
export class StreamViewComponent implements OnInit, OnDestroy {
  stream?: Stream;
  loading = true;
  viewerCount = 0;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private streamService: StreamService,
    private signalRService: SignalRService
  ) {}

  ngOnInit(): void {
    const streamId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadStream(streamId);
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
        this.signalRService.streamEnded$.subscribe((endedStreamId) => {
          if (endedStreamId === streamId) {
            alert('Stream has ended');
            void this.router.navigate(['/streams']);
          }
        })
      );
    } catch (error) {
      console.error('SignalR connection failed:', error);
    }
  }

  goBack(): void {
    void this.router.navigate(['/streams']);
  }
}
