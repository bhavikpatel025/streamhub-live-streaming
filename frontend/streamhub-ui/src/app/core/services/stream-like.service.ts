import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StreamLikeResponse {
  totalLikes: number;
  isLikedByCurrentUser: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class StreamLikeService {
  private apiUrl = `${environment.apiUrl}/streams`;

  constructor(private http: HttpClient) {}

  toggleLike(streamId: number): Observable<StreamLikeResponse> {
    return this.http.post<StreamLikeResponse>(
      `${this.apiUrl}/${streamId}/toggle-like`,
      {}
    );
  }

  getLikes(streamId: number): Observable<StreamLikeResponse> {
    return this.http.get<StreamLikeResponse>(
      `${this.apiUrl}/${streamId}/likes`
    );
  }
}
