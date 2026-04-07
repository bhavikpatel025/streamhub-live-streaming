import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Stream, StreamListItem, CreateStreamRequest, StreamKeyResponse } from '../models/stream.model';

export interface StreamStats {
  viewers: number;
  likes: number;
  dislikes: number;
}

@Injectable({
  providedIn: 'root'
})
export class StreamService {
  private apiUrl = `${environment.apiUrl}/streams`;

  constructor(private http: HttpClient) {}

  private normalizeImageUrl<T extends { profileImageUrl?: string }>(item: T): T {
    if (item.profileImageUrl && !item.profileImageUrl.startsWith('http')) {
      return {
        ...item,
        profileImageUrl: `${environment.signalRUrl}${item.profileImageUrl}`
      };
    }
    return item;
  }

  getLiveStreams(): Observable<StreamListItem[]> {
    return this.http.get<StreamListItem[]>(this.apiUrl).pipe(
      map(streams => streams.map(stream => this.normalizeImageUrl(stream)))
    );
  }

  getStreamById(id: number): Observable<Stream> {
    return this.http.get<Stream>(`${this.apiUrl}/${id}`).pipe(
      map(stream => this.normalizeImageUrl(stream))
    );
  }

  getStreamStats(id: number): Observable<StreamStats> {
    return this.http.get<StreamStats>(`${this.apiUrl}/${id}/stats`);
  }

  getStreamByKey(streamKey: string): Observable<Stream> {
    return this.http.get<Stream>(`${this.apiUrl}/key/${streamKey}`).pipe(
      map(stream => this.normalizeImageUrl(stream))
    );
  }

  getMyStreams(): Observable<Stream[]> {
    return this.http.get<Stream[]>(`${this.apiUrl}/my-streams`).pipe(
      map(streams => streams.map(stream => this.normalizeImageUrl(stream)))
    );
  }

  createStream(request: CreateStreamRequest): Observable<Stream> {
    return this.http.post<Stream>(this.apiUrl, request).pipe(
      map(stream => this.normalizeImageUrl(stream))
    );
  }

  getStreamKey(streamId: number): Observable<StreamKeyResponse> {
    return this.http.get<StreamKeyResponse>(`${this.apiUrl}/${streamId}/stream-key`);
  }

  startStream(streamId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${streamId}/start`, {});
  }

  stopStream(streamId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${streamId}/stop`, {});
  }

  deleteStream(streamId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${streamId}`);
  }
}
