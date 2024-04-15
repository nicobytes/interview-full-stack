import { Component, Inject, inject, signal, ViewChild, AfterViewInit, ElementRef, ChangeDetectorRef, computed } from '@angular/core';
import { DIALOG_DATA, DialogModule, DialogRef } from '@angular/cdk/dialog';
import { Message } from '@models/message.model';
import { MatIconModule } from '@angular/material/icon';

interface Data {
  message: Message;
}

@Component({
  selector: 'app-modal-recording',
  standalone: true,
  imports: [DialogModule, MatIconModule],
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
  @ViewChild('videoLive', { static: false }) videoLive!: ElementRef<HTMLVideoElement>;
  @ViewChild('videoRta', { static: false }) videoRta!: ElementRef<HTMLVideoElement>;
  private mediaRecorder!: MediaRecorder;
  status = signal<'init' | 'recording' | 'success' | 'processing' | 'streaming'>('init');
  file = signal<File | null>(null);
  intervalId = signal<number | null>(null);
  duration = signal<number>(0);
  formatDuration = computed(() => {
    const duration = this.duration();
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  });
  recordedChunks = signal<Blob[]>([]);

  constructor(@Inject(DIALOG_DATA) public data: Data) { }

  async ngAfterViewInit() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    this.videoLive.nativeElement.srcObject = stream;
    const mimeType = this.getSupportedMimeTypes();
    if (!mimeType) {
      console.error('No supported mime types');
      return;
    }
    this.mediaRecorder = new MediaRecorder(stream, { mimeType });
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.update((chunks) => [...chunks, event.data]);
      }
    };
    this.status.set('streaming');
  }

  close() {
    this.dialogRef.close();
  }

  sendResponse() {
    this.dialogRef.close({
      file: this.file(),
    });
  }

  previewVideo() {
    const chunks = this.recordedChunks();
    const blob = new Blob(chunks, { type: 'video/webm' });
    const filename = `${Date.now()}.webm`;
    const file = new File([blob], filename, { type: blob.type, lastModified: Date.now() });
    const url = URL.createObjectURL(file);
    this.status.set('success');
    this.file.set(file);
    this.videoRta.nativeElement.src = url;
    this.cdRef.detectChanges();
  }

  startRecording() {
    this.status.set('recording');
    this.mediaRecorder.start();
    const intervalId = window.setInterval(() => {
      this.duration.update((duration) => duration + 1);
    }, 1000);
    this.intervalId.set(intervalId);
  }

  stopRecording() {
    this.status.set('processing');
    this.mediaRecorder.stop();
    setTimeout(() => {
      this.previewVideo();
    }, 100);
    const intervalId = this.intervalId();
    if (intervalId) {
      window.clearInterval(intervalId);
      this.intervalId.set(null);
    }
  }

  getSupportedMimeTypes() {
    const possibleTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm;codecs=av01,opus'
    ];
    const supported = possibleTypes.filter(mimeType => MediaRecorder.isTypeSupported(mimeType));
    console.log('supported', supported);
    if (supported.length > 0) {
      return supported[0];
    }
    return null;
  }

  playAudio(audio: string) {
    const audioElement = new Audio(audio);
    audioElement.play();
  }

}
