import { z } from '@hono/zod-openapi';

export const SimulationIdSchema = z.object({
  id: z
    .string()
    .min(1)
    .openapi({
      param: {
        name: 'id',
        in: 'path',
      },
      example: '1',
    }),
});

export const CreateSimulationSchema = z.object({
  role: z
    .string()
    .min(3)
    .openapi({
      example: 'Male',
    }),
  name: z
    .string()
    .min(3)
    .openapi({
      example: 'Nicolas',
    }),
});
export type CreateSimulationDto = z.infer<typeof CreateSimulationSchema>;

export const SimulationSchema = z
  .object({
    id: z.number().openapi({
      example: 1,
    }),
    role: z.string().openapi({
      example: 'John Doe',
    }),
  })
  .openapi('Simulation');

export const SimulationListSchema = z.array(SimulationSchema);


