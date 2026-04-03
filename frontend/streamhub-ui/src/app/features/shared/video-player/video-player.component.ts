import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import Hls from 'hls.js';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule, CardModule, ProgressSpinnerModule, TagModule],
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.scss']
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  @Input() streamKey!: string;
  @Input() posterUrl?: string;

  hls?: Hls;
  loading = true;
  errorMessage = '';
  private manifestRetryTimer?: ReturnType<typeof setTimeout>;
  private manifestRetryCount = 0;
  private readonly maxManifestRetries = 10;

  ngOnInit(): void {
    this.initializePlayer();
  }

  ngOnDestroy(): void {
    this.destroyPlayer();
  }

  private initializePlayer(): void {
    const video = this.videoElement.nativeElement;
    const streamUrl = `${environment.hlsBaseUrl}/${this.streamKey}.m3u8`;

    this.loading = true;
    this.errorMessage = '';

    if (Hls.isSupported()) {
      this.hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        manifestLoadingMaxRetry: 6,
        manifestLoadingRetryDelay: 1000,
        levelLoadingMaxRetry: 6,
        levelLoadingRetryDelay: 1000,
        fragLoadingMaxRetry: 6,
        fragLoadingRetryDelay: 1000
      });

      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        this.hls?.loadSource(streamUrl);
      });

      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.loading = false;
        this.errorMessage = '';
        this.manifestRetryCount = 0;

        video.play().catch((err) => {
          console.error('Autoplay failed:', err);
        });
      });

      this.hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error('HLS error:', data);

        if (!data.fatal) {
          return;
        }

        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            this.handleNetworkError(streamUrl);
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            this.errorMessage = 'Playback issue detected. Recovering stream...';
            this.hls?.recoverMediaError();
            break;
          default:
            this.loading = false;
            this.errorMessage = 'We could not render this stream.';
            this.destroyPlayer();
            break;
        }
      });

      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        this.loading = false;
        this.errorMessage = '';
        void video.play();
      });
      video.addEventListener('error', () => {
        this.loading = false;
        this.errorMessage = 'Error loading stream.';
      });
      return;
    }

    this.loading = false;
    this.errorMessage = 'HLS is not supported in this browser.';
  }

  private handleNetworkError(streamUrl: string): void {
    if (!this.hls) {
      return;
    }

    if (this.manifestRetryCount >= this.maxManifestRetries) {
      this.loading = false;
      this.errorMessage = 'Stream is not available right now. Please try again shortly.';
      return;
    }

    this.manifestRetryCount += 1;
    this.errorMessage = 'Waiting for the live feed to become available...';

    clearTimeout(this.manifestRetryTimer);
    this.manifestRetryTimer = setTimeout(() => {
      this.hls?.stopLoad();
      this.hls?.loadSource(streamUrl);
      this.hls?.startLoad();
    }, 1500);
  }

  private destroyPlayer(): void {
    clearTimeout(this.manifestRetryTimer);

    if (this.hls) {
      this.hls.destroy();
      this.hls = undefined;
    }
  }
}
