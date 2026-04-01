import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-body">
              <h2 class="card-title text-center mb-4">Login to StreamHub</h2>
              
              @if (errorMessage) {
                <div class="alert alert-danger">{{ errorMessage }}</div>
              }

              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    formControlName="email"
                    [class.is-invalid]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
                  @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                    <div class="invalid-feedback">
                      Please enter a valid email
                    </div>
                  }
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="password" 
                    formControlName="password"
                    [class.is-invalid]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                  @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                    <div class="invalid-feedback">
                      Password is required
                    </div>
                  }
                </div>

                <button 
                  type="submit" 
                  class="btn btn-primary w-100" 
                  [disabled]="loginForm.invalid || loading">
                  @if (loading) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                  }
                  Login
                </button>
              </form>

              <div class="text-center mt-3">
                <p>Don't have an account? <a routerLink="/register">Register</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/streams']);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Login failed';
          this.loading = false;
        }
      });
    }
  }
}