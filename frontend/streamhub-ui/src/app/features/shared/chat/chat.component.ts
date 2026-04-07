import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, Output, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { SignalRService } from '../../../core/services/signalr.service';
import { ChatMessage } from '../../../core/models/chat.model';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AvatarModule, ButtonModule, InputTextModule, TagModule, UserAvatarComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() streamId!: number;
  @Output() hideChat = new EventEmitter<void>();
  @ViewChild('chatMessages') chatMessages?: ElementRef<HTMLDivElement>;

  messages: ChatMessage[] = [];
  messageForm: FormGroup;
  sending = false;
  errorMessage = '';
  private subscriptions: Subscription[] = [];
  private isNearBottom = true;

  constructor(
    private fb: FormBuilder,
    private signalRService: SignalRService
  ) {
    this.messageForm = this.fb.group({
      message: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.signalRService.chatHistory$.subscribe((messages) => {
        this.messages = messages;
        this.scrollToBottom();
      }),
      this.signalRService.chatMessage$.subscribe((message) => {
        this.messages = [...this.messages, message];
        this.scrollToBottom();
      }),
      this.signalRService.hubError$.subscribe((error) => {
        this.errorMessage = error;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  sendMessage(): void {
    if (this.messageForm.invalid || this.sending) {
      return;
    }

    const messageText = this.messageForm.get('message')?.value?.trim();
    if (!messageText) {
      return;
    }

    this.errorMessage = '';
    this.sending = true;

    this.signalRService.sendChatMessage(this.streamId, messageText)
      .then(() => {
        this.messageForm.reset();
      })
      .catch((error) => {
        this.errorMessage = error?.message ?? 'Failed to send message.';
        console.error('Failed to send message:', error);
      })
      .finally(() => {
        this.sending = false;
      });
  }

  onHideChat(): void {
    this.hideChat.emit();
  }

  getUserInitial(username: string): string {
    return username.charAt(0).toUpperCase();
  }

  trackByMessageId(index: number, message: ChatMessage): number {
    return message.id;
  }

  isOwnMessage(message: ChatMessage): boolean {
    return false;
  }

  onScroll(): void {
    const container = this.chatMessages?.nativeElement;
    if (container) {
      const threshold = 100;
      const position = container.scrollTop + container.offsetHeight;
      const height = container.scrollHeight;
      this.isNearBottom = position > height - threshold;
    }
  }

  private scrollToBottom(): void {
    if (!this.isNearBottom) return;

    setTimeout(() => {
      const container = this.chatMessages?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 80);
  }
}
