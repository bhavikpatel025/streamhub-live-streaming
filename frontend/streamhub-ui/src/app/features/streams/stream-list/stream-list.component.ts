import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { StreamListItem } from '../../../core/models/stream.model';
import { StreamService } from '../../../core/services/stream.service';
import { SignalRService } from '../../../core/services/signalr.service';
import { Subscription } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar.component';

@Component({
  selector: 'app-stream-list',
  standalone: true,
  imports: [CommonModule, TooltipModule, UserAvatarComponent],
  templateUrl: './stream-list.component.html',
  styleUrls: ['./stream-list.component.scss']
})
export class StreamListComponent implements OnInit, OnDestroy {
  streams: StreamListItem[] = [];
  loading = true;
  isExpanded = false;
  private searchQuery = '';
  private refreshHandle?: ReturnType<typeof setInterval>;
  private subscriptions: Subscription[] = [];

  constructor(
    private streamService: StreamService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private signalRService: SignalRService
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        const query = params['search'] || '';
        if (query !== this.searchQuery) {
          this.searchQuery = query;
          this.isExpanded = false;
          this.loadStreams();
        }
      })
    );

    this.loadStreams();
    this.refreshHandle = setInterval(() => this.loadStreams(), 30000);

    if (this.authService.isAuthenticated) {
      this.signalRService.startStreamConnection()
        .then(() => {
          this.subscriptions.push(this.signalRService.globalViewerCount$.subscribe((data) => {
            const stream = this.streams.find(s => s.id === data.streamId);
            if (stream) {
              stream.viewerCount = data.viewers;
            }
          }));
        })
        .catch(err => console.error('SignalR streams list connect error:', err));
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshHandle);
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  get visibleStreams(): StreamListItem[] {
    if (this.isExpanded || this.streams.length <= 4) {
      return this.streams;
    }
    return this.streams.slice(0, 4);
  }

  get hasMoreStreams(): boolean {
    return this.streams.length > 4;
  }

  get totalViewers(): number {
    return this.streams.reduce((sum, stream) => sum + stream.viewerCount, 0);
  }

  toggleStreams(): void {
    this.isExpanded = !this.isExpanded;
  }

  loadStreams(): void {
    const source$ = this.searchQuery
      ? this.streamService.searchStreams(this.searchQuery)
      : this.streamService.getLiveStreams();

    source$.subscribe({
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
