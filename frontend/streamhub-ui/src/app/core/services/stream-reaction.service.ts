import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReactionRequestDto {
  reactionType: 'LIKE' | 'DISLIKE';
}

export interface StreamReactionResponseDto {
  likes: number;
  dislikes: number;
  userReaction: 'LIKE' | 'DISLIKE' | 'NONE';
}

@Injectable({
  providedIn: 'root'
})
export class StreamReactionService {
  private readonly apiUrl = `${environment.apiUrl}/streams`;

  constructor(private http: HttpClient) {}

  toggleReaction(streamId: number, reactionType: 'LIKE' | 'DISLIKE'): Observable<StreamReactionResponseDto> {
    const payload: ReactionRequestDto = { reactionType };
    return this.http.post<StreamReactionResponseDto>(`${this.apiUrl}/${streamId}/reaction`, payload);
  }

  getReactions(streamId: number): Observable<StreamReactionResponseDto> {
    return this.http.get<StreamReactionResponseDto>(`${this.apiUrl}/${streamId}/reaction`);
  }
}
