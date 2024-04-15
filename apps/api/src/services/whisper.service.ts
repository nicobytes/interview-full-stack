import { Ai } from '@cloudflare/ai';
import { HTTPException } from 'hono/http-exception';

export const generateTranscription = async (file: File, binding: any) => {
  console.log('name', file.name);
  console.log('type', file.type);
  const blob = await file.arrayBuffer();
  const input = {
    audio: [...new Uint8Array(blob)],
  };

  const ai = new Ai(binding);

  const response = await ai.run("@cf/openai/whisper", input);

  if (!response.text) {
    throw new HTTPException(500, { message: `Failed processing` })
  }

  return response.text;
}

