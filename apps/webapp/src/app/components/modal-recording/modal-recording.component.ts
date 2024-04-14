import { Component, Inject, inject, signal, ViewChild, AfterViewInit, ElementRef, ChangeDetectorRef, computed } from '@angular/core';
import { DIALOG_DATA, DialogModule, DialogRef} from '@angular/cdk/dialog';
import { Message } from '@models/message.model';
import { MatIconModule } from '@angular/material/icon';

interface Data {
  message: Message;
}

@Component({
  selector: 'app-modal-recording',
  standalone: true,
  imports: [ DialogModule, MatIconModule ],
  templateUrl: './modal-recording.component.html',
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }
  `]
})
export class ModalRecordingComponent implements AfterViewInit {

  dialogRef = inject(DialogRef);
  cdRef = inject(ChangeDetectorRef);
  @ViewChild('videoLive',  { static: false }) videoLive!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoRta', { static: false }) videoRta!: ElementRef<HTMLVideoElement>;
  private mediaRecorder!: MediaRecorder;
  status = signal<'init' | 'recording' | 'success' | 'processing' | 'streaming'>('init');
  blob = signal<Blob | null>(null);
  urlVideo = computed(() => {
    const blob = this.blob();
    if (blob) {
      return URL.createObjectURL(blob);
    }
    return null;
  });

  constructor(@Inject(DIALOG_DATA) public data: Data) {}

  async ngAfterViewInit() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    this.videoLive.nativeElement.srcObject = stream;
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm',
    });
    this.mediaRecorder.ondataavailable = (event) => {
      const blob = new Blob([event.data], { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      this.status.set('success');
      this.blob.set(blob);
      this.videoRta.nativeElement.src = url;
      this.cdRef.detectChanges();
    };
    this.status.set('streaming');
  }

  close() {
    this.dialogRef.close({
      file: this.blob(),
    });
  }

  startRecording() {
    this.status.set('recording');
    this.mediaRecorder.start();
  }

  stopRecording() {
    this.status.set('processing');
    this.mediaRecorder.stop();
  }

}
