import OpenAI from "openai";

export const generateTranscription = async (file: File, apiKey: string, baseURL: string) => {
  const openai = new OpenAI({ apiKey, baseURL: `${baseURL}/openai`});
  console.log('name', file.name);
  console.log('type', file.type);
  const transcription = await openai.audio.transcriptions.create({
    file: file,
    model: "whisper-1",
  });

  return transcription.text;
}

export const generateAudio = async (input: string, apiKey: string, baseURL: string, bucket: R2Bucket) => {
  const openai = new OpenAI({ apiKey });
  const file = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input,
  });
  const blob = await file.blob();
  const fileName = `audios/${Date.now()}.mp3`;
  await bucket.put(fileName, blob);
  return fileName;
}
