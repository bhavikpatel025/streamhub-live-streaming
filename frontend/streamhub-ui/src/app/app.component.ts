import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { AuthService } from './core/services/auth.service';
import { UserAvatarComponent } from './features/shared/user-avatar/user-avatar.component';
import { ProfileSettingsComponent } from './features/shared/profile-settings/profile-settings.component';

@Component({
  selector: 'app-root',
  standalone: true,
  host: {
    class: 'app-dark-theme'
  },
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    ButtonModule,
    MenuModule,
    OverlayPanelModule,
    UserAvatarComponent,
    ProfileSettingsComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  profileSettingsVisible = false;
  menuItems: MenuItem[] = [
    {
      label: 'Profile Settings',
      icon: 'pi pi-cog',
      command: () => this.openProfileSettings()
    },
    {
      separator: true
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ];

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated;
  }

  getUsername(): string {
    return this.authService.currentUserValue?.username || 'Guest';
  }

  getUserInitial(): string {
    return this.getUsername().charAt(0).toUpperCase();
  }

  openProfileSettings(): void {
    this.profileSettingsVisible = true;
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
