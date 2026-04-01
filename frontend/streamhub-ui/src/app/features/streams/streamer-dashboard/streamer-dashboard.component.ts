import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StreamService } from '../../../core/services/stream.service';
import { SignalRService } from '../../../core/services/signalr.service';
import { Stream, StreamKeyResponse } from '../../../core/models/stream.model';

@Component({
  selector: 'app-streamer-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container mt-4">
      <h2>Streamer Dashboard</h2>

      <!-- Create Stream Section -->
      @if (!selectedStream) {
        <div class="card mt-4">
          <div class="card-body">
            <h4>Create New Stream</h4>
            <form [formGroup]="createStreamForm" (ngSubmit)="createStream()">
              <div class="mb-3">
                <label for="title" class="form-label">Stream Title</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="title" 
                  formControlName="title"
                  placeholder="Enter stream title">
              </div>

              <div class="mb-3">
                <label for="description" class="form-label">Description</label>
                <textarea 
                  class="form-control" 
                  id="description" 
                  formControlName="description"
                  rows="3"
                  placeholder="Describe your stream"></textarea>
              </div>

              <button 
                type="submit" 
                class="btn btn-primary" 
                [disabled]="createStreamForm.invalid || creating">
                @if (creating) {
                  <span class="spinner-border spinner-border-sm me-2"></span>
                }
                Create Stream
              </button>
            </form>
          </div>
        </div>
      }

      <!-- My Streams -->
      <div class="card mt-4">
        <div class="card-body">
          <h4>My Streams</h4>
          @if (loadingStreams) {
            <div class="text-center py-3">
              <div class="spinner-border spinner-border-sm"></div>
            </div>
          } @else if (myStreams.length === 0) {
            <p class="text-muted">No streams yet. Create your first stream above!</p>
          } @else {
            <div class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Viewers</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (stream of myStreams; track stream.id) {
                    <tr>
                      <td>{{ stream.title }}</td>
                      <td>
                        @if (stream.isLive) {
                          <span class="badge bg-success">Live</span>
                        } @else {
                          <span class="badge bg-secondary">Offline</span>
                        }
                      </td>
                      <td>{{ stream.viewerCount }}</td>
                      <td>{{ stream.createdAt | date: 'short' }}</td>
                      <td>
                        <button 
                          class="btn btn-sm btn-primary me-2" 
                          (click)="selectStream(stream)">
                          Manage
                        </button>
                        <button 
                          class="btn btn-sm btn-danger" 
                          (click)="deleteStream(stream.id)">
                          Delete
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>

      <!-- Stream Management -->
      @if (selectedStream) {
        <div class="card mt-4">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4>Manage Stream: {{ selectedStream.title }}</h4>
              <button class="btn btn-sm btn-secondary" (click)="deselectStream()">
                Close
              </button>
            </div>

            <!-- Stream Key Section -->
            @if (streamKey) {
              <div class="alert alert-info">
                <h5>Stream Configuration</h5>
                <div class="mb-2">
                  <strong>RTMP URL:</strong>
                  <div class="input-group mt-1">
                    <input 
                      type="text" 
                      class="form-control" 
                      [value]="streamKey.rtmpUrl" 
                      readonly>
                    <button 
                      class="btn btn-outline-secondary" 
                      (click)="copyToClipboard(streamKey.rtmpUrl)">
                      Copy
                    </button>
                  </div>
                </div>
                <div class="mb-2">
                  <strong>Stream Key:</strong>
                  <div class="input-group mt-1">
                    <input 
                      type="password" 
                      class="form-control" 
                      [value]="streamKey.streamKey" 
                      readonly>
                    <button 
                      class="btn btn-outline-secondary" 
                      (click)="copyToClipboard(streamKey.streamKey)">
                      Copy
                    </button>
                  </div>
                </div>
                <p class="mb-0 mt-2">
                  <small class="text-muted">
                    Configure these settings in OBS Studio to start streaming
                  </small>
                </p>
              </div>
            }

            <!-- Stream Controls -->
            <div class="d-flex gap-2">
              @if (!selectedStream.isLive) {
                <button 
                  class="btn btn-success" 
                  (click)="startStream()"
                  [disabled]="starting">
                  @if (starting) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                  }
                  Start Stream
                </button>
              } @else {
                <button 
                  class="btn btn-danger" 
                  (click)="stopStream()"
                  [disabled]="stopping">
                  @if (stopping) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                  }
                  Stop Stream
                </button>
              }

              @if (!streamKey) {
                <button 
                  class="btn btn-primary" 
                  (click)="loadStreamKey()">
                  Show Stream Key
                </button>
              }
            </div>

            @if (selectedStream.isLive) {
              <div class="alert alert-success mt-3">
                <i class="bi bi-broadcast"></i> 
                Stream is live with {{ selectedStream.viewerCount }} viewers
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class StreamerDashboardComponent implements OnInit {
  createStreamForm: FormGroup;
  myStreams: Stream[] = [];
  selectedStream?: Stream;
  streamKey?: StreamKeyResponse;
  
  creating = false;
  loadingStreams = true;
  starting = false;
  stopping = false;

  constructor(
    private fb: FormBuilder,
    private streamService: StreamService,
    private signalRService: SignalRService
  ) {
    this.createStreamForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadMyStreams();
  }

  loadMyStreams(): void {
    this.loadingStreams = true;
    this.streamService.getMyStreams().subscribe({
      next: (streams) => {
        this.myStreams = streams;
        this.loadingStreams = false;
      },
      error: (error) => {
        console.error('Failed to load streams:', error);
        this.loadingStreams = false;
      }
    });
  }

  createStream(): void {
    if (this.createStreamForm.valid) {
      this.creating = true;
      this.streamService.createStream(this.createStreamForm.value).subscribe({
        next: (stream) => {
          this.myStreams.unshift(stream);
          this.createStreamForm.reset();
          this.creating = false;
          this.selectStream(stream);
        },
        error: (error) => {
          console.error('Failed to create stream:', error);
          this.creating = false;
          alert('Failed to create stream');
        }
      });
    }
  }

  selectStream(stream: Stream): void {
    this.selectedStream = stream;
    this.streamKey = undefined;
  }

  deselectStream(): void {
    this.selectedStream = undefined;
    this.streamKey = undefined;
  }

  loadStreamKey(): void {
    if (this.selectedStream) {
      this.streamService.getStreamKey(this.selectedStream.id).subscribe({
        next: (key) => {
          this.streamKey = key;
        },
        error: (error) => {
          console.error('Failed to load stream key:', error);
          alert('Failed to load stream key');
        }
      });
    }
  }

  startStream(): void {
    if (this.selectedStream) {
      this.starting = true;
      this.streamService.startStream(this.selectedStream.id).subscribe({
        next: () => {
          if (this.selectedStream) {
            this.selectedStream.isLive = true;
            this.starting = false;
            this.signalRService.notifyStreamStarted(this.selectedStream.id);
          }
        },
        error: (error) => {
          console.error('Failed to start stream:', error);
          this.starting = false;
          alert('Failed to start stream');
        }
      });
    }
  }

  stopStream(): void {
    if (this.selectedStream) {
      this.stopping = true;
      this.streamService.stopStream(this.selectedStream.id).subscribe({
        next: () => {
          if (this.selectedStream) {
            this.selectedStream.isLive = false;
            this.stopping = false;
            this.signalRService.notifyStreamEnded(this.selectedStream.id);
          }
        },
        error: (error) => {
          console.error('Failed to stop stream:', error);
          this.stopping = false;
          alert('Failed to stop stream');
        }
      });
    }
  }

  deleteStream(streamId: number): void {
    if (confirm('Are you sure you want to delete this stream?')) {
      this.streamService.deleteStream(streamId).subscribe({
        next: () => {
          this.myStreams = this.myStreams.filter(s => s.id !== streamId);
          if (this.selectedStream?.id === streamId) {
            this.deselectStream();
          }
        },
        error: (error) => {
          console.error('Failed to delete stream:', error);
          alert('Failed to delete stream');
        }
      });
    }
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }
}