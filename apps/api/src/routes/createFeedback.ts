import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { MessageListSchema } from '@src/dtos/message.dto';
import { generateTranscription } from '@src/services/whisper.service';
import { generateFeedback } from '@src/services/llm.service';
import { App } from "@src/types";
import { HTTPException } from "hono/http-exception";
import { getSimulationById } from '@src/services/simulation.service';

const app = new OpenAPIHono<App>();

const route = createRoute({
  tags: ['simulation'],
  method: 'post',
  path: '/',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: MessageListSchema,
        },
      },
      description: 'Retrieve new simulation',
    },
  },
  public: true,
});

app.openapi(route, async (c) => {
  const db = c.get('db');
  const body = await c.req.parseBody();
  const file = body.file as File;
  const question = body.question as string;
  const simulationId = body.simulationId as string;
  const entity = await getSimulationById(db, +simulationId);

  const answer = await generateTranscription(file, c.env.AI);
  const response = await generateFeedback({
    role: entity.role,
    question,
    answer,
    cloudflareAccountId: c.env.CLOUDFLARE_ACCOUNT_ID,
    cloudflareApiToken: c.env.CLOUDFLARE_API_TOKEN,
  });

  const content = response.content;
  if (typeof content !== 'string') {
    throw new HTTPException(500, { message: `Complex messsage` })
  }

  const messages = [
    {
      id: `${Date.now()}`,
      from: 'user',
      text: answer,
      type: 'response',
    },
    {
      id: `${Date.now() + 1}`,
      from: 'bot',
      text: content,
      type: 'feedback',
    },

  ];

  return c.json(messages);
});

export default app;
