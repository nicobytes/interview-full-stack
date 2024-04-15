import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { MessageSchema } from '@src/dtos/message.dto';
import { generateTranscription } from '@src/services/whisper.service';
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
  const body = await c.req.parseBody();
  const file = body.file as File;
  const answer = await generateTranscription(file, c.env.AI);

  return c.json({
    id: `${Date.now()}`,
    from: 'user',
    text: answer,
    type: 'transcription'
  },);
});

export default app;
