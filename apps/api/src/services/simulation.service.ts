import { simulations } from '@src/db/schema';
import { HTTPException } from 'hono/http-exception';
import { CreateSimulationDto } from '@src/dtos/simulation.dto';
import { DB } from '@src/types';
import { eq } from "drizzle-orm";

export const getAllSimulations = (db: DB) => {
  return db.query.simulations.findMany();
}

export const getSimulationById = async (db: DB, id: number) => {
  const entity = await db.query.simulations.findFirst({
    where: eq(simulations.id, id),
  });
  if (!entity) {
    throw new HTTPException(400, { message: `Simulation with id ${id} not found.` })
  }
  return entity;
}

export const createSimulation = async (db: DB, dto: CreateSimulationDto) => {
  const results = await db
    .insert(simulations)
    .values({...dto})
    .returning();

  if (results.length === 0) {
    throw new HTTPException(400, { message: `Error` })
  }
  const [newEntity] = results;
  return newEntity;
}
