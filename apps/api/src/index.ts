import { OpenAPIHono } from '@hono/zod-openapi';
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import { prettyJSON } from 'hono/pretty-json';

import { dbMiddleware } from '@src/middlewares/db.middleware';

import createSimulation from '@src/routes/createSimulation';
import createQuestion from '@src/routes/createQuestion';
import createFeedback from '@src/routes/createFeedback';
import createTranscript from '@src/routes/createTranscript';

const app = new OpenAPIHono();
app.use("*", cors());
app.use('*', prettyJSON());
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404));

app.use('/api/v1/*', dbMiddleware);

app.route('/api/v1/simulations', createSimulation);
app.route('/api/v1/questions', createQuestion);
app.route('/api/v1/feedback', createFeedback);
app.route('/api/v1/transcript', createTranscript);

app.get("/", swaggerUI({ url: "/docs" }));
app.doc("/docs", {
  info: {
    title: "Interviews API",
    version: "v1",
  },
  openapi: "3.1.0",
});

export default app;
