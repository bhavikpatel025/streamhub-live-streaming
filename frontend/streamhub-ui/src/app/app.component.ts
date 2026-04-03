import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  host: {
    class: 'app-dark-theme'
  },
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private authService: AuthService,
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

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
