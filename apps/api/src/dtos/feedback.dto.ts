import { z } from '@hono/zod-openapi';

export const GenerateFeedbackSchema = z.object({
  answer: z
    .string()
    .min(3)
    .openapi({
      example: 'Message',
    }),
  question: z
    .string()
    .min(3)
    .openapi({
      example: 'Message',
    }),
  simulationId: z.string().openapi({
      example: '1',
    }),
});
