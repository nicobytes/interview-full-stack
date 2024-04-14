import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { CreateSimulationSchema, SimulationSchema } from '@src/dtos/simulation.dto';
import { createSimulation } from '@src/services/simulation.service';
import { App } from "@src/types";

const app = new OpenAPIHono<App>();

const route = createRoute({
  tags: ['simulation'],
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateSimulationSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SimulationSchema,
        },
      },
      description: 'Retrieve new simulation',
    },
  },
  public: true,
});

app.openapi(route, async (c) => {
  const db = c.get('db');
  const dto = c.req.valid('json');
  const rta = await createSimulation(db, dto);
  return c.json(rta);
});

export default app;
