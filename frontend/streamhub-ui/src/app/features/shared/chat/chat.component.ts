import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SignalRService } from '../../../core/services/signalr.service';
import { ChatMessage } from '../../../core/models/chat.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="chat-container">
      <div class="chat-header">
        <h5>Live Chat</h5>
        <span class="badge bg-success">{{ messages.length }} messages</span>
      </div>

      <div class="chat-messages" #chatMessages>
        @for (message of messages; track message.id) {
          <div class="chat-message">
            <span class="username">{{ message.username }}:</span>
            <span class="message">{{ message.message }}</span>
            <span class="timestamp">{{ message.sentAt | date: 'short' }}</span>
          </div>
        }

        @if (messages.length === 0) {
          <div class="text-center text-muted p-3">
            No messages yet. Be the first to chat!
          </div>
        }
      </div>

      @if (errorMessage) {
        <div class="alert alert-danger m-3 mb-0">
          {{ errorMessage }}
        </div>
      }

      <div class="chat-input">
        <form [formGroup]="messageForm" (ngSubmit)="sendMessage()">
          <div class="input-group">
            <input
              type="text"
              class="form-control"
              formControlName="message"
              placeholder="Type a message..."
              maxlength="500">
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="messageForm.invalid || sending">
              @if (sending) {
                <span class="spinner-border spinner-border-sm"></span>
              } @else {
                Send
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 600px;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
    }

    .chat-header {
      padding: 15px;
      background: #f8f9fa;
      border-bottom: 1px solid #ddd;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 15px;
      background: #fff;
    }

    .chat-message {
      margin-bottom: 10px;
      padding: 8px;
      border-radius: 4px;
      background: #f8f9fa;
    }

    .username {
      font-weight: bold;
      color: #007bff;
      margin-right: 5px;
    }

    .message {
      color: #333;
    }

    .timestamp {
      font-size: 0.75rem;
      color: #999;
      margin-left: 10px;
    }

    .chat-input {
      padding: 15px;
      border-top: 1px solid #ddd;
      background: #f8f9fa;
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input() streamId!: number;

  messages: ChatMessage[] = [];
  messageForm: FormGroup;
  sending = false;
  errorMessage = '';
  private subscriptions: Subscription[] = [];

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

  private scrollToBottom(): void {
    setTimeout(() => {
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }, 100);
  }
}
