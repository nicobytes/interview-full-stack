import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { Message } from '@models/message.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private http = inject(HttpClient);

  createSimulation(data: { role: string }) {
    return this.http.post<{id: string}>(`${environment.apiUrl}/simulations`, data);
  }

  createQuestion(simulationId: string, message: string) {
    return this.http.post<Message>(`${environment.apiUrl}/questions`, {
      message,
      simulationId,
    });
  }

  createFeedback(simulationId: string, file: Blob, question: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('question', question);
    formData.append('simulationId', simulationId);
    return this.http.post<Message[]>(`${environment.apiUrl}/feedback`, formData);
  }
}
