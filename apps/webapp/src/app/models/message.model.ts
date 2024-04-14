export interface Message {
  id: string;
  from: 'user' | 'bot';
  type: 'feedback' | 'response';
  text: string;
  file?: Blob;
}
