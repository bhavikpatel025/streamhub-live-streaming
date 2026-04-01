import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Stream, StreamListItem, CreateStreamRequest, StreamKeyResponse } from '../models/stream.model';

@Injectable({
  providedIn: 'root'
})
export class StreamService {
  private apiUrl = `${environment.apiUrl}/streams`;

  constructor(private http: HttpClient) {}

  getLiveStreams(): Observable<StreamListItem[]> {
    return this.http.get<StreamListItem[]>(this.apiUrl);
  }

  getStreamById(id: number): Observable<Stream> {
    return this.http.get<Stream>(`${this.apiUrl}/${id}`);
  }

  getStreamByKey(streamKey: string): Observable<Stream> {
    return this.http.get<Stream>(`${this.apiUrl}/key/${streamKey}`);
  }

  getMyStreams(): Observable<Stream[]> {
    return this.http.get<Stream[]>(`${this.apiUrl}/my-streams`);
  }

  createStream(request: CreateStreamRequest): Observable<Stream> {
    return this.http.post<Stream>(this.apiUrl, request);
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