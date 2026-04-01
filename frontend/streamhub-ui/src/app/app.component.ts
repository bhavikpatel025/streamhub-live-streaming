import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <a class="navbar-brand" routerLink="/">
          <i class="bi bi-broadcast"></i> StreamHub
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/streams" routerLinkActive="active">Browse Streams</a>
            </li>
            @if (isAuthenticated()) {
              <li class="nav-item">
                <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
              </li>
            }
          </ul>
          <ul class="navbar-nav">
            @if (isAuthenticated()) {
              <li class="nav-item">
                <span class="navbar-text me-3">
                  {{ getUsername() }}
                </span>
              </li>
              <li class="nav-item">
                <button class="btn btn-outline-light" (click)="logout()">Logout</button>
              </li>
            } @else {
              <li class="nav-item">
                <a class="nav-link" routerLink="/login">Login</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/register">Register</a>
              </li>
            }
          </ul>
        </div>
      </div>
    </nav>

    <router-outlet />
  `,
  styles: [`
    .navbar-brand {
      font-size: 1.5rem;
      font-weight: bold;
    }
  `]
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
    return this.authService.currentUserValue?.username || '';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}