import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { MessageSchema } from '@src/dtos/message.dto';
import { GenerateFeedbackSchema } from '@src/dtos/feedback.dto';
import { generateFeedback } from '@src/services/llm.service';
import { App } from "@src/types";
import { HTTPException } from "hono/http-exception";
import { getSimulationById } from '@src/services/simulation.service';
import { generateAudio } from '@src/services/openai.service';

const app = new OpenAPIHono<App>();

const route = createRoute({
  tags: ['simulation'],
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': {
          schema: GenerateFeedbackSchema,
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
      description: 'Retrieve new feedback',
    },
  },
  public: true,
});

app.openapi(route, async (c) => {
  const db = c.get('db');
  const { question, answer, simulationId } = c.req.valid('json');
  const entity = await getSimulationById(db, +simulationId);

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

  return c.json({
    id: `${Date.now()}`,
    from: 'bot',
    text: content,
    type: 'feedback'
  },);
});

export default app;
