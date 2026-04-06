import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { SignalRService } from '../../../core/services/signalr.service';
import { Stream, StreamKeyResponse } from '../../../core/models/stream.model';
import { StreamService } from '../../../core/services/stream.service';
import { UserAvatarComponent } from '../../shared/user-avatar/user-avatar.component';

@Component({
  selector: 'app-streamer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToolbarModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputTextarea,
    TableModule,
    TagModule,
    DialogModule,
    ConfirmDialogModule,
    AvatarModule,
    ProgressSpinnerModule,
    UserAvatarComponent
  ],
  templateUrl: './streamer-dashboard.component.html',
  styleUrls: ['./streamer-dashboard.component.scss']
})
export class StreamerDashboardComponent implements OnInit {
  createStreamForm: FormGroup;
  myStreams: Stream[] = [];
  selectedStream?: Stream;
  streamKey?: StreamKeyResponse;
  streamKeyDialogVisible = false;

  creating = false;
  loadingStreams = true;
  starting = false;
  stopping = false;

  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
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

  get totalViewers(): number {
    return this.myStreams.reduce((sum, stream) => sum + stream.viewerCount, 0);
  }

  get liveStreams(): number {
    return this.myStreams.filter((stream) => stream.isLive).length;
  }

  loadMyStreams(): void {
    this.loadingStreams = true;
    this.streamService.getMyStreams().subscribe({
      next: (streams) => {
        this.myStreams = streams;
        this.loadingStreams = false;

        if (this.selectedStream) {
          this.selectedStream = streams.find((stream) => stream.id === this.selectedStream?.id);
        }
      },
      error: (error) => {
        console.error('Failed to load streams:', error);
        this.loadingStreams = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Dashboard unavailable',
          detail: 'We could not load your streams.'
        });
      }
    });
  }

  createStream(): void {
    if (this.createStreamForm.invalid) {
      this.createStreamForm.markAllAsTouched();
      return;
    }

    this.creating = true;
    this.streamService.createStream(this.createStreamForm.getRawValue()).subscribe({
      next: (stream) => {
        this.myStreams = [stream, ...this.myStreams];
        this.createStreamForm.reset();
        this.creating = false;
        this.selectStream(stream);
        this.messageService.add({
          severity: 'success',
          summary: 'Stream created',
          detail: `${stream.title} is ready to configure.`
        });
      },
      error: (error) => {
        console.error('Failed to create stream:', error);
        this.creating = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Creation failed',
          detail: error.error?.message || 'Unable to create stream.'
        });
      }
    });
  }

  selectStream(stream: Stream): void {
    this.selectedStream = stream;
    this.streamKey = undefined;
  }

  loadStreamKey(): void {
    if (!this.selectedStream) {
      return;
    }

    this.streamService.getStreamKey(this.selectedStream.id).subscribe({
      next: (key) => {
        this.streamKey = key;
        this.streamKeyDialogVisible = true;
      },
      error: (error) => {
        console.error('Failed to load stream key:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Key unavailable',
          detail: 'We could not fetch your stream key.'
        });
      }
    });
  }

  startStream(): void {
    if (!this.selectedStream) {
      return;
    }

    this.starting = true;
    this.streamService.startStream(this.selectedStream.id).subscribe({
      next: () => {
        if (this.selectedStream) {
          this.selectedStream.isLive = true;
          this.signalRService.notifyStreamStarted(this.selectedStream.id).catch(() => undefined);
        }

        this.starting = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Stream is live',
          detail: 'Your audience can now join the broadcast.'
        });
      },
      error: (error) => {
        console.error('Failed to start stream:', error);
        this.starting = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Start failed',
          detail: error.error?.message || 'Unable to start the stream.'
        });
      }
    });
  }

  stopStream(): void {
    if (!this.selectedStream) {
      return;
    }

    this.stopping = true;
    this.streamService.stopStream(this.selectedStream.id).subscribe({
      next: () => {
        if (this.selectedStream) {
          this.selectedStream.isLive = false;
          this.signalRService.notifyStreamEnded(this.selectedStream.id).catch(() => undefined);
        }

        this.stopping = false;
        this.messageService.add({
          severity: 'warn',
          summary: 'Stream stopped',
          detail: 'Your live session has ended.'
        });
      },
      error: (error) => {
        console.error('Failed to stop stream:', error);
        this.stopping = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Stop failed',
          detail: error.error?.message || 'Unable to stop the stream.'
        });
      }
    });
  }

  deleteStream(streamId: number): void {
    this.confirmationService.confirm({
      header: 'Delete stream?',
      message: 'This action removes the stream and its chat history.',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.streamService.deleteStream(streamId).subscribe({
          next: () => {
            this.myStreams = this.myStreams.filter((stream) => stream.id !== streamId);
            if (this.selectedStream?.id === streamId) {
              this.selectedStream = undefined;
              this.streamKey = undefined;
            }
            this.messageService.add({
              severity: 'success',
              summary: 'Stream deleted',
              detail: 'The stream has been removed.'
            });
          },
          error: (error) => {
            console.error('Failed to delete stream:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Delete failed',
              detail: error.error?.message || 'Unable to delete this stream.'
            });
          }
        });
      }
    });
  }

  copyToClipboard(text: string, label: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: `${label} copied`,
        detail: 'Copied to your clipboard.'
      });
    }).catch((error) => {
      console.error('Failed to copy:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Copy failed',
        detail: 'Clipboard access is not available.'
      });
    });
  }

  getUserInitial(username: string): string {
    return username.charAt(0).toUpperCase();
  }

  getStatusSeverity(stream: Stream): 'success' | 'secondary' {
    return stream.isLive ? 'success' : 'secondary';
  }
}
