import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { MessageSchema, NewMessageSchema } from '@src/dtos/message.dto';
import { getSimulationById } from '@src/services/simulation.service';
import { generateQuestion } from '@src/services/llm.service';
import { generateAudio } from '@src/services/openai.service';
import { App } from "@src/types";

const app = new OpenAPIHono<App>();

const route = createRoute({
  tags: ['questions'],
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': {
          schema: NewMessageSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: MessageSchema,
        },
      },
      description: 'Retrieve a new question',
    },
  },
  public: true,
});

app.openapi(route, async (c) => {
  const db = c.get('db');
  const { message, simulationId } = c.req.valid('json');
  const rta = await getSimulationById(db, +simulationId);
  const response = await generateQuestion({
    sessionId: simulationId,
    role: rta.role,
    message,
    cloudflareAccountId: c.env.CLOUDFLARE_ACCOUNT_ID,
    cloudflareApiToken: c.env.CLOUDFLARE_API_TOKEN,
  }, c.env.DB);

  const filename = await generateAudio(response, c.env.OPENAI_API_KEY, c.env.BUCKET);

  return c.json({
    id: `${Date.now()}`,
    from: 'bot',
    text: response,
    type: 'response',
    audio: `${c.env.R2_URL}/${filename}`,
  });
});

export default app;
