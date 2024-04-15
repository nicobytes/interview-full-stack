import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

@Component({
  selector: 'app-demo',
  standalone: true,
  imports: [],
  templateUrl: './demo.component.html',
  styles: ``
})
export default class DemoComponent {
  recordedChunks = signal<Blob[]>([]);
  url = signal<string | null>(null);
  private mediaRecorder!: MediaRecorder;

  private http = inject(HttpClient);

  async startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.update((chunks) => [...chunks, event.data]);
      }
    };
    this.mediaRecorder.start();
  }

  stopRecording() {
    this.mediaRecorder.stop();
    setTimeout(() => {
      this.processRecording();
    }, 300);
  }

  processRecording() {
    const chunks = this.recordedChunks();
    console.log(chunks);
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    this.url.set(url);
    this.requestOpenAI(blob).subscribe((rta) => {
      console.log(rta);
      this.recordedChunks.set([]);
      this.url.set(null);
    });
  }

  requestBlob(file: Blob) {
    return this.http.post(`${environment.apiUrl}/demo1`, file);
  }

  requestFormData(file: Blob) {
    const formData = new FormData();
    formData.append('file', file, 'file.webm');
    return this.http.post(`${environment.apiUrl}/demo2`, formData);
  }

  requestOpenAI(file: Blob) {
    const formData = new FormData();
    formData.append('file', file, 'file.webm');
    return this.http.post(`${environment.apiUrl}/demo3`, formData);
  }

  requestGateway(file: Blob) {
    const formData = new FormData();
    formData.append('file', file, 'file.webm');
    return this.http.post(`${environment.apiUrl}/demo4`, formData);
  }

}
