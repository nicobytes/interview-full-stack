import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import { prettyJSON } from 'hono/pretty-json';

import { dbMiddleware } from '@src/middlewares/db.middleware';

import createSimulation from '@src/routes/createSimulation';
import createQuestion from '@src/routes/createQuestion';
import createFeedback from '@src/routes/createFeedback';
import createTranscript from '@src/routes/createTranscript';
import { App } from "@src/types";

const app = new OpenAPIHono<App>();
app.use("*", cors());
app.use('*', prettyJSON());
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404));

app.use('/api/v1/*', dbMiddleware);

app.route('/api/v1/simulations', createSimulation);
app.route('/api/v1/questions', createQuestion);
app.route('/api/v1/feedback', createFeedback);
app.route('/api/v1/transcript', createTranscript);

/*
import { Ai } from '@cloudflare/ai';

app.post('/api/v1/demo1', async (c) => {
  const ai = new Ai(c.env.AI);
  const arrayBuffer = await c.req.arrayBuffer();
  const audio = [...new Uint8Array(arrayBuffer)];
  const { text } = await ai.run("@cf/openai/whisper", {audio });
  return c.json({text});
});

app.post('/api/v1/demo2', async (c) => {
  const ai = new Ai(c.env.AI);
  const data = await c.req.formData();
  const file = data.get('file') as unknown as File;
  const arrayBuffer = await file.arrayBuffer();
  const audio = [...new Uint8Array(arrayBuffer)];
  const { text } = await ai.run("@cf/openai/whisper", { audio });
  return c.json({text});
});

app.post('/api/v1/demo3', async (c) => {
  const data = await c.req.formData();
  const file = data.get('file') as unknown as File;
  const text = await generateTranscription(file, c.env.OPENAI_API_KEY);
  return c.json({text});
});

app.post('/api/v1/demo4', async (c) => {
  const data = await c.req.formData();
  const file = data.get('file') as unknown as File;
  const arrayBuffer = await file.arrayBuffer();
  const response = await fetch('https://gateway.ai.cloudflare.com/v1/b2bb1719bede14df8732870a3974b263/gateway/workers-ai/@cf/openai/whisper', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${c.env.CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/octet-stream',
    },
    body: arrayBuffer,
  });
  const result = await response.json();
  return c.json({result});
});
*/

app.get("/", swaggerUI({ url: "/docs" }));
app.doc("/docs", {
  info: {
    title: "Interviews API",
    version: "v1",
  },
  openapi: "3.1.0",
});

export default app;
