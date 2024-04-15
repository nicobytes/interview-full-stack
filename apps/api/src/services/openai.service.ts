import OpenAI from "openai";

export const generateTranscription = async (file: File, key: string) => {
  const openai = new OpenAI({
    apiKey: key,
  });
  console.log('name', file.name);
  console.log('type', file.type);
  const transcription = await openai.audio.transcriptions.create({
    file: file,
    model: "whisper-1",
  });

  return transcription.text;
}

export const generateAudio = async (input: string, key: string, bucket: R2Bucket) => {
  const openai = new OpenAI({
    apiKey: key,
  });
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
