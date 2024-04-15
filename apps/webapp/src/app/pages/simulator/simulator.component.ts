import { Component, inject, input, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { Message } from '@models/message.model';
import { ApiService } from '@services/api.service';
import { ModalRecordingComponent } from '@components/modal-recording/modal-recording.component';
import { MarkdownModule } from 'ngx-markdown';
import { MatIconModule } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-simulator',
  standalone: true,
  imports: [DialogModule, MarkdownModule, RouterLink, MatIconModule],
  templateUrl: './simulator.component.html',
})
export default class SimulatorComponent implements OnInit {

  id = input.required<string>();
  messages = signal<Message[]>([]);
  mode = signal<'recording' | 'question' | 'loading'>('recording');
  answer = signal<string | null>(null);
  @ViewChild('scroll', { static: false }) scroll!: ElementRef<HTMLDivElement>;
  private apiService = inject(ApiService);
  private dialog = inject(Dialog);
  private toastr = inject(ToastrService);

  ngOnInit() {
    const message = 'Please ask me the first question.';
    this.createQuestion(message);
  }

  openModalRecording() {
    const lastMessage = this.messages().slice(-1)[0];
    const dialogRef = this.dialog.open<{ file: File }>(ModalRecordingComponent, {
      minWidth: '300px',
      data: {
        message: lastMessage,
      },
    });
    dialogRef.closed
      .subscribe((response) => {
        if (response) {
          this.createTranscript(response.file, lastMessage.text);
        } else {
          this.mode.set('question');
        }
      });
  }

  createFeedback(question: string, transcript: string) {
    const id = this.id();
    this.mode.set('loading');
    this.apiService.createFeedback(id, transcript, question).subscribe({
      next: (newMessage) => {
        this.messages.update((messages) => [...messages, newMessage]);
        this.scrollToBottom();
        this.mode.set('question');
      },
      error: () => {
        this.mode.set('recording');
      },
    });
  }

  createTranscript(file: File, question: string) {
    this.mode.set('loading');
    this.apiService.createTranscript(file).subscribe({
      next: (newMessage) => {
        this.messages.update((messages) => [...messages, newMessage]);
        this.scrollToBottom();
        this.answer.set(newMessage.text);
        this.createFeedback(question, newMessage.text);
      },
      error: () => {
        const messageError = 'Ups, something went wrong with the transcription. Please try again.';
        this.toastr.error(messageError, 'Error!');
        this.mode.set('recording');
      },
    });
  }

  createQuestion(message: string | null) {
    if (message) {
      const id = this.id();
      this.mode.set('loading');
      this.apiService.createQuestion(id, message).subscribe((response) => {
        this.messages.update((messages) => [...messages, response]);
        this.scrollToBottom();
        this.mode.set('recording');
        this.answer.set(null);
      });
    }
  }

  scrollToBottom() {
    if (this.scroll) {
      setTimeout(() => {
        this.scroll.nativeElement.scrollTop = this.scroll.nativeElement.scrollHeight;
      }, 100);

    }
  }

}
