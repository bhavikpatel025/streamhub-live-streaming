import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { AuthService } from '../../../core/services/auth.service';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    FileUploadModule,
    UserAvatarComponent
  ],
  template: `
    <p-dialog
      header="Profile Settings"
      [(visible)]="visible"
      [modal]="true"
      [style]="{ width: 'min(90vw, 30rem)' }"
      [draggable]="false"
      [resizable]="false"
      (onHide)="onHide()"
    >
      <div class="profile-settings">
        <div class="profile-settings__current">
          <app-user-avatar
            [username]="authService.currentUserValue?.username || ''"
            [profileImageUrl]="authService.currentUserValue?.profileImageUrl"
            [size]="80"
          ></app-user-avatar>
          <div class="profile-settings__info">
            <h3>{{ authService.currentUserValue?.username }}</h3>
            <p>{{ authService.currentUserValue?.email }}</p>
          </div>
        </div>

        <div class="profile-settings__upload">
          <label>Upload Profile Picture</label>
          <p-fileUpload
            #fileUpload
            mode="basic"
            accept="image/*"
            [maxFileSize]="2097152"
            [auto]="false"
            chooseLabel="Choose Image"
            (onSelect)="onFileSelect($event)"
            (onClear)="onFileClear()"
          ></p-fileUpload>
          <small>Supported formats: JPG, JPEG, PNG. Max size: 2MB</small>
        </div>

        <div class="profile-settings__actions">
          <p-button
            *ngIf="selectedFile"
            label="Upload"
            icon="pi pi-upload"
            [loading]="uploading"
            (onClick)="uploadProfilePicture()"
          ></p-button>

          <p-button
            *ngIf="authService.currentUserValue?.profileImageUrl"
            label="Remove Picture"
            icon="pi pi-trash"
            severity="danger"
            styleClass="p-button-outlined"
            [loading]="removing"
            (onClick)="removeProfilePicture()"
          ></p-button>
        </div>
      </div>
    </p-dialog>
  `,
  styles: [`
    .profile-settings {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .profile-settings__current {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .profile-settings__info h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .profile-settings__info p {
      margin: 0.25rem 0 0 0;
      color: #6c757d;
      font-size: 0.875rem;
    }

    .profile-settings__upload {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .profile-settings__upload label {
      font-weight: 500;
      color: #495057;
    }

    .profile-settings__upload small {
      color: #6c757d;
      font-size: 0.75rem;
    }

    .profile-settings__actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }
  `]
})
export class ProfileSettingsComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  selectedFile: File | null = null;
  uploading = false;
  removing = false;

  constructor(
    public authService: AuthService,
    private messageService: MessageService
  ) {}

  onFileSelect(event: any): void {
    this.selectedFile = event.files[0];
  }

  onFileClear(): void {
    this.selectedFile = null;
  }

  uploadProfilePicture(): void {
    if (!this.selectedFile) return;

    this.uploading = true;
    this.authService.uploadProfilePicture(this.selectedFile).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Profile updated',
          detail: 'Profile picture uploaded successfully.'
        });
        this.selectedFile = null;
        this.uploading = false;
        this.visible = false;
        this.visibleChange.emit(false);
      },
      error: (error) => {
        console.error('Upload failed:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Upload failed',
          detail: error.error?.message || 'Failed to upload profile picture.'
        });
        this.uploading = false;
      }
    });
  }

  removeProfilePicture(): void {
    this.removing = true;
    this.authService.removeProfilePicture().subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Profile updated',
          detail: 'Profile picture removed successfully.'
        });
        this.removing = false;
        this.visible = false;
        this.visibleChange.emit(false);
      },
      error: (error) => {
        console.error('Remove failed:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Remove failed',
          detail: error.error?.message || 'Failed to remove profile picture.'
        });
        this.removing = false;
      }
    });
  }

  onHide(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}