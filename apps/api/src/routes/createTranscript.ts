import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { MessageSchema } from '@src/dtos/message.dto';
import { generateTranscription } from '@src/services/openai.service';
import { App } from "@src/types";

const app = new OpenAPIHono<App>();

const route = createRoute({
  tags: ['simulation'],
  method: 'post',
  path: '/',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: MessageSchema,
        },
      },
      description: 'Retrieve new simulation',
    },
  },
  public: true,
});

app.openapi(route, async (c) => {
  const data = await c.req.formData();
  const file = data.get('file') as unknown as File;
  const answer = await generateTranscription(file, c.env.OPENAI_API_KEY, c.env.CLOUDFLARE_AI_GATEWAY_URL);

  return c.json({
    id: `${Date.now()}`,
    from: 'user',
    text: answer,
    type: 'transcription'
  },);
});

export default app;
