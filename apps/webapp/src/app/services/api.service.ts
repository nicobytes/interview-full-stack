import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Message } from '@models/message.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private http = inject(HttpClient);

  createSimulation(data: { role: string }) {
    return this.http.post<{ id: string }>(`${environment.apiUrl}/simulations`, data);
  }

  createQuestion(simulationId: string, message: string) {
    return this.http.post<Message>(`${environment.apiUrl}/questions`, {
      message,
      simulationId,
    });
  }

  createFeedback(simulationId: string, question: string, answer: string) {
    return this.http.post<Message>(`${environment.apiUrl}/feedback`, {
      question,
      answer,
      simulationId,
    });
  }

  createTranscript(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Message>(`${environment.apiUrl}/transcript`, formData)
    .pipe(
      map((response) => ({
        ...response,
        file: URL.createObjectURL(file),
      })),
    );
  }
}
