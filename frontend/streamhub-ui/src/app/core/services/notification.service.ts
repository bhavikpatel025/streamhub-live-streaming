import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';
import { NotificationItem, StreamStartedNotification } from '../models/notification.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly notificationsSubject = new BehaviorSubject<NotificationItem[]>([]);
  readonly notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  get notifications(): NotificationItem[] {
    return this.notificationsSubject.value;
  }

  loadNotifications(): Observable<NotificationItem[]> {
    return this.http.get<NotificationItem[]>(`${environment.apiUrl}/notifications`).pipe(
      map((notifications) => this.sortNotifications(notifications)),
      tap((notifications) => this.notificationsSubject.next(notifications))
    );
  }

  addStreamStartedNotification(notification: StreamStartedNotification): void {
    const notifications = this.notifications.filter((item) => item.id !== notification.id);
    this.notificationsSubject.next(this.sortNotifications([notification, ...notifications]));
  }

  markAllAsRead(): Observable<void> {
    const previousNotifications = this.notifications;
    const updatedNotifications = this.notifications.map((notification) => ({
      ...notification,
      isRead: true
    }));

    this.notificationsSubject.next(updatedNotifications);

    return this.http.put<void>(`${environment.apiUrl}/notifications/read-all`, {}).pipe(
      catchError((error) => {
        this.notificationsSubject.next(previousNotifications);
        return this.rethrow(error);
      })
    );
  }

  remove(notificationId: number): Observable<void> {
    const previousNotifications = this.notifications;
    this.notificationsSubject.next(previousNotifications.filter((notification) => notification.id !== notificationId));

    return this.http.delete<void>(`${environment.apiUrl}/notifications/${notificationId}`).pipe(
      catchError((error) => {
        this.notificationsSubject.next(previousNotifications);
        return this.rethrow(error);
      })
    );
  }

  clearAll(): Observable<void> {
    const previousNotifications = this.notifications;
    this.notificationsSubject.next([]);

    return this.http.delete<void>(`${environment.apiUrl}/notifications`).pipe(
      catchError((error) => {
        this.notificationsSubject.next(previousNotifications);
        return this.rethrow(error);
      })
    );
  }

  clear(): void {
    this.notificationsSubject.next([]);
  }

  private sortNotifications(notifications: NotificationItem[]): NotificationItem[] {
    return [...notifications].sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    );
  }

  private rethrow(error: unknown): Observable<never> {
    return throwError(() => error);
  }
}
