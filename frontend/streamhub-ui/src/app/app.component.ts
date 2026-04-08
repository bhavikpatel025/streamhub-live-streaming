import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from './core/services/auth.service';
import { NotificationItem, StreamStartedNotification } from './core/models/notification.model';
import { NotificationService } from './core/services/notification.service';
import { SignalRService } from './core/services/signalr.service';
import { ThemeService } from './core/services/theme.service';
import { UserAvatarComponent } from './features/shared/user-avatar/user-avatar.component';
import { ProfileSettingsComponent } from './features/shared/profile-settings/profile-settings.component';

@Component({
  selector: 'app-root',
  standalone: true,
  host: {
    '[class.app-dark-theme]': 'themeService.isDark',
    '[class.app-light-theme]': '!themeService.isDark'
  },
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    ButtonModule,
    ToastModule,
    TooltipModule,
    UserAvatarComponent,
    ProfileSettingsComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('notificationAnchor') notificationAnchor?: ElementRef<HTMLElement>;
  @ViewChild('profileAnchor') profileAnchor?: ElementRef<HTMLElement>;

  profileSettingsVisible = false;
  notifications: NotificationItem[] = [];
  notificationsOpen = false;
  profileMenuOpen = false;
  activeNotificationMenuId: number | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private notificationService: NotificationService,
    private signalRService: SignalRService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.themeService.initializeTheme();
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.notificationService.notifications$.subscribe((notifications) => {
        this.notifications = notifications;
      }),
      this.authService.currentUser$.subscribe((user) => {
        if (user?.token) {
          this.loadNotifications();
          void this.initializeRealtimeNotifications();
        } else {
          this.closeMenus();
          this.notificationService.clear();
        }
      }),
      this.signalRService.streamStartedNotification$.subscribe((notification) => {
        if (!this.isAuthenticated() || notification.streamerName === this.getUsername()) {
          return;
        }

        this.notificationService.addStreamStartedNotification(notification);
        this.messageService.add({
          key: 'stream-started',
          severity: 'custom',
          summary: `${notification.streamerName} is live now`,
          detail: notification.streamTitle,
          life: 4000,
          data: notification
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  getUsername(): string {
    return this.authService.currentUserValue?.username || 'Guest';
  }

  getUserInitial(): string {
    return this.getUsername().charAt(0).toUpperCase();
  }

  get unreadNotificationsCount(): number {
    return this.notifications.filter((notification) => !notification.isRead).length;
  }

  async initializeRealtimeNotifications(): Promise<void> {
    try {
      await this.signalRService.startStreamConnection();
    } catch (error) {
      console.error('Failed to start stream notifications:', error);
    }
  }

  loadNotifications(): void {
    this.notificationService.loadNotifications().subscribe({
      error: (error) => {
        console.error('Failed to load notifications:', error);
      }
    });
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.notificationsOpen = !this.notificationsOpen;
    this.profileMenuOpen = false;
    this.activeNotificationMenuId = null;

    if (this.notificationsOpen && this.unreadNotificationsCount > 0) {
      this.notificationService.markAllAsRead().subscribe({
        error: (error) => {
          console.error('Failed to mark notifications as read:', error);
        }
      });
    }
  }

  toggleNotificationActions(event: Event, notificationId: number): void {
    event.stopPropagation();
    this.activeNotificationMenuId = this.activeNotificationMenuId === notificationId ? null : notificationId;
  }

  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.profileMenuOpen = !this.profileMenuOpen;
    this.notificationsOpen = false;
    this.activeNotificationMenuId = null;
  }

  watchNotification(notification: StreamStartedNotification): void {
    this.closeMenus();
    void this.router.navigate(['/watch', notification.streamId]);
  }

  deleteNotification(notification: NotificationItem): void {
    this.notificationService.remove(notification.id).subscribe({
      next: () => {
        this.activeNotificationMenuId = null;
      },
      error: (error) => {
        console.error('Failed to delete notification:', error);
      }
    });
  }

  clearAllNotifications(): void {
    this.notificationService.clearAll().subscribe({
      next: () => {
        this.activeNotificationMenuId = null;
      },
      error: (error) => {
        console.error('Failed to clear notifications:', error);
      }
    });
  }

  openProfileSettings(): void {
    this.profileMenuOpen = false;
    this.profileSettingsVisible = true;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.closeMenus();
    this.notificationService.clear();
    void this.signalRService.stopStreamConnection();
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  isNotificationMenuOpen(notificationId: number): boolean {
    return this.activeNotificationMenuId === notificationId;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;

    if (this.notificationsOpen && this.notificationAnchor && target &&
        !this.notificationAnchor.nativeElement.contains(target)) {
      this.notificationsOpen = false;
      this.activeNotificationMenuId = null;
    }

    if (this.profileMenuOpen && this.profileAnchor && target &&
        !this.profileAnchor.nativeElement.contains(target)) {
      this.profileMenuOpen = false;
    }
  }

  private closeMenus(): void {
    this.notificationsOpen = false;
    this.profileMenuOpen = false;
    this.activeNotificationMenuId = null;
  }
}
