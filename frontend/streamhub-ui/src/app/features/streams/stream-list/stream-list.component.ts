import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { StreamListItem } from '../../../core/models/stream.model';
import { StreamService } from '../../../core/services/stream.service';

@Component({
  selector: 'app-stream-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stream-list.component.html',
  styleUrls: ['./stream-list.component.scss']
})
export class StreamListComponent implements OnInit, OnDestroy {
  streams: StreamListItem[] = [];
  loading = true;
  private refreshHandle?: ReturnType<typeof setInterval>;

  constructor(
    private streamService: StreamService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStreams();
    this.refreshHandle = setInterval(() => this.loadStreams(), 30000);
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshHandle);
  }

  get totalViewers(): number {
    return this.streams.reduce((sum, stream) => sum + stream.viewerCount, 0);
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
    void this.router.navigate(['/watch', streamId]);
  }

  navigateToDashboard(): void {
    void this.router.navigate(['/dashboard']);
  }

  login(): void {
    void this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  getViewerLabel(viewerCount: number): string {
    return `${viewerCount} viewer${viewerCount === 1 ? '' : 's'}`;
  }

  getUserInitial(username: string): string {
    return username.charAt(0).toUpperCase();
  }

  getTimeAgo(date?: Date): string {
    if (!date) {
      return 'just started';
    }

    const now = new Date();
    const streamDate = new Date(date);
    const diffMs = now.getTime() - streamDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
      return 'just now';
    }

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    }

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours}h ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
}
