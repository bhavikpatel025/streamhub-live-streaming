import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, RegisterRequest, UserProfile } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.currentUserSubject.next(this.normalizeImageUrl(user));
    }
  }

  private normalizeImageUrl(user: User): User {
    if (user.profileImageUrl && !user.profileImageUrl.startsWith('http')) {
      return {
        ...user,
        profileImageUrl: `${environment.signalRUrl}${user.profileImageUrl}`
      };
    }
    return user;
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserValue?.token;
  }

  register(request: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/register`, request)
      .pipe(
        tap(user => {
          user = this.normalizeImageUrl(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  login(request: LoginRequest): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/auth/login`, request)
      .pipe(
        tap(user => {
          user = this.normalizeImageUrl(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return this.currentUserValue?.token || null;
  }

  getMyProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${environment.apiUrl}/users/me`).pipe(
      tap(profile => {
        if (this.currentUserValue) {
          let imageUrl = profile.profileImageUrl;
          if (imageUrl && !imageUrl.startsWith('http')) {
            imageUrl = `${environment.signalRUrl}${imageUrl}`;
          }
          const updatedUser = { ...this.currentUserValue, profileImageUrl: imageUrl };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);
        }
      })
    );
  }

  uploadProfilePicture(file: File): Observable<{ profileImageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ profileImageUrl: string }>(`${environment.apiUrl}/users/profile-picture`, formData)
      .pipe(
        tap(response => {
          if (this.currentUserValue) {
            let imageUrl = response.profileImageUrl;
            if (!imageUrl.startsWith('http')) {
              imageUrl = `${environment.signalRUrl}${imageUrl}`;
            }
            const updatedUser = { ...this.currentUserValue, profileImageUrl: imageUrl };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            this.currentUserSubject.next(updatedUser);
          }
        })
      );
  }

  removeProfilePicture(): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/users/profile-picture`)
      .pipe(
        tap(() => {
          if (this.currentUserValue) {
            const updatedUser = { ...this.currentUserValue, profileImageUrl: undefined };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            this.currentUserSubject.next(updatedUser);
          }
        })
      );
  }
}