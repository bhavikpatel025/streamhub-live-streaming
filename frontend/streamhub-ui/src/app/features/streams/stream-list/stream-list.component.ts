import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { StreamService } from '../../../core/services/stream.service';
import { StreamListItem } from '../../../core/models/stream.model';

@Component({
  selector: 'app-stream-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Live Streams</h2>
        <button class="btn btn-primary" (click)="navigateToDashboard()">
          Go to Dashboard
        </button>
      </div>

      @if (loading) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else if (streams.length === 0) {
        <div class="alert alert-info">
          <h4>No live streams at the moment</h4>
          <p>Check back later or start your own stream!</p>
        </div>
      } @else {
        <div class="row">
          @for (stream of streams; track stream.id) {
            <div class="col-md-4 mb-4">
              <div class="card stream-card" (click)="watchStream(stream.id)">
                <div class="card-img-top stream-thumbnail">
                  <div class="live-badge">
                    <span class="badge bg-danger">
                      <i class="bi bi-circle-fill pulse"></i> LIVE
                    </span>
                  </div>
                  <div class="viewer-count">
                    <i class="bi bi-eye-fill"></i> {{ stream.viewerCount }}
                  </div>
                </div>
                <div class="card-body">
                  <h5 class="card-title">{{ stream.title }}</h5>
                  <p class="card-text text-muted">{{ stream.description }}</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="streamer-name">
                      <i class="bi bi-person-circle"></i> {{ stream.username }}
                    </span>
                    <small class="text-muted">
                      Started {{ getTimeAgo(stream.startedAt) }}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .stream-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stream-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }

    .stream-thumbnail {
      height: 200px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 3rem;
    }

    .live-badge {
      position: absolute;
      top: 10px;
      left: 10px;
    }

    .pulse {
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .viewer-count {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.7);
      padding: 5px 10px;
      border-radius: 4px;
      color: white;
      font-size: 0.9rem;
    }

    .streamer-name {
      font-weight: 500;
      color: #007bff;
    }
  `]
})
export class StreamListComponent implements OnInit {
  streams: StreamListItem[] = [];
  loading = true;

  constructor(
    private streamService: StreamService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStreams();
    // Refresh streams every 30 seconds
    setInterval(() => this.loadStreams(), 30000);
  }

  loadStreams(): void {
    this.streamService.getLiveStreams().subscribe({
      next: (streams) => {
        this.streams = streams;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load streams:', error);
        this.loading = false;
      }
    });
  }

  watchStream(streamId: number): void {
    this.router.navigate(['/watch', streamId]);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  getTimeAgo(date?: Date): string {
    if (!date) return 'recently';
    
    const now = new Date();
    const streamDate = new Date(date);
    const diffMs = now.getTime() - streamDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
}