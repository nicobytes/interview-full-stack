import { z } from '@hono/zod-openapi';

export const FeedbackSchema = z
  .object({
    id: z.string().openapi({
      example: '1',
    }),
    from: z.string().openapi({
      example: 'user',
    }),
    text: z.string().openapi({
      example: 'message',
    }),
  })
  .openapi('Feedback');
