import { z } from '@hono/zod-openapi';

export const NewMessageSchema = z.object({
  message: z
    .string()
    .min(3)
    .openapi({
      example: 'Message',
    }),
  simulationId: z.string().openapi({
      example: '1',
    }),
});

export const MessageSchema = z
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
    type: z.string().openapi({
      example: 'feedback',
    }),
    file: z.any().optional()
  })
  .openapi('Message');

export const MessageListSchema = z.array(MessageSchema);
