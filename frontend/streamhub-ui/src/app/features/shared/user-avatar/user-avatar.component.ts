import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="profileImageUrl; else avatarLetter">
      <img
        [src]="profileImageUrl"
        [alt]="username + ' avatar'"
        class="user-avatar user-avatar--image"
        [style.width.px]="size"
        [style.height.px]="size"
      />
    </ng-container>

    <ng-template #avatarLetter>
      <div
        class="user-avatar user-avatar--letter"
        [style.width.px]="size"
        [style.height.px]="size"
        [style.font-size.px]="size * 0.4"
      >
        {{ getUserInitial() }}
      </div>
    </ng-template>
  `,
  styles: [`
    .user-avatar {
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: white;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: 2px solid rgba(255, 255, 255, 0.2);
      flex-shrink: 0;
    }

    .user-avatar--image {
      object-fit: cover;
      border-radius: 50%;
    }

    .user-avatar--letter {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      text-transform: uppercase;
    }
  `]
})
export class UserAvatarComponent {
  @Input() username = '';
  @Input() profileImageUrl?: string;
  @Input() size = 40;

  getUserInitial(): string {
    return this.username.charAt(0).toUpperCase();
  }
}