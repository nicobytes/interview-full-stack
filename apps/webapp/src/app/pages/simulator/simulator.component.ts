import { Component, inject, input, signal, OnInit } from '@angular/core';
import { Dialog, DialogModule} from '@angular/cdk/dialog';
import { Message } from '@models/message.model';
import { ApiService } from '@services/api.service';
import { ModalRecordingComponent } from '@components/modal-recording/modal-recording.component';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-simulator',
  standalone: true,
  imports: [DialogModule, MarkdownModule],
  templateUrl: './simulator.component.html',
})
export default class SimulatorComponent implements OnInit {

  id = input.required<string>();
  messages = signal<Message[]>([]);
  mode = signal<'recording' | 'question' | 'loading'>('recording');
  answer = signal<string | null>(null);
  private apiService = inject(ApiService);
  private dialog = inject(Dialog);

  ngOnInit() {
    const message = 'Please ask me the first question.';
    this.createQuestion(message);
  }

  openModalRecording() {
    const lastMessage = this.messages().slice(-1)[0];
    const dialogRef = this.dialog.open<{file: Blob}>(ModalRecordingComponent, {
      minWidth: '300px',
      data: {
        message: lastMessage,
      },
    });
    dialogRef.closed
    .subscribe((response) => {
      if (response) {
        this.sendFile(lastMessage.text, response.file);
      }
    });
  }

  sendFile(question: string, file: Blob) {
    const id = this.id();
    this.mode.set('loading');
    this.apiService.createFeedback(id, file, question).subscribe((newMessages) => {
      if (newMessages.length > 0) {
        this.answer.set(newMessages[0].text);
      }
      this.messages.update((messages) => [...messages, ...newMessages]);
      this.mode.set('question');
    });
  }

  createQuestion(message: string | null) {
    if (message) {
      const id = this.id();
      this.mode.set('loading');
      this.apiService.createQuestion(id, message).subscribe((response) => {
        this.messages.update((messages) => [...messages, response]);
        this.mode.set('recording');
        this.answer.set(null);
      });
    }
  }

}
