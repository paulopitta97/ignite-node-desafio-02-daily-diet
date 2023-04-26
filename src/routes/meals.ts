import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const user = await knex('users')
        .where({
          session_id: sessionId,
        })
        .first()

      if (!user) {
        throw new Error(`User with this session ID [${sessionId}] not found.`)
      }

      const meals = await knex('meals').where('user_id', user.id).select('*')

      return {
        meals,
      }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const user = await knex('users')
        .where({
          session_id: sessionId,
        })
        .first()

      if (!user) {
        throw new Error(`User with this session ID [${sessionId}] not found.`)
      }

      const meal = await knex('meals')
        .where({
          user_id: user.id,
          id,
        })
        .first()

      return {
        meal,
      }
    },
  )

  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string().optional(),
        createdAt: z.string().datetime(),
        belongsDiet: z.boolean().default(false),
      })

      const { name, description, createdAt, belongsDiet } =
        createMealBodySchema.parse(request.body)

      const { sessionId } = request.cookies

      const user = await knex('users')
        .where({
          session_id: sessionId,
        })
        .first()

      if (!user) {
        throw new Error(`User with this session ID [${sessionId}] not found.`)
      }

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        belongs_diet: belongsDiet,
        created_at: createdAt,
        user_id: user.id,
      })

      return reply.status(201).send()
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const user = await knex('users')
        .where({
          session_id: sessionId,
        })
        .first()

      if (!user) {
        throw new Error(`User with this session ID [${sessionId}] not found.`)
      }

      await knex('meals')
        .where({
          user_id: user.id,
          id,
        })
        .delete()

      return reply.status(204).send()
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getMealParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const user = await knex('users')
        .where({
          session_id: sessionId,
        })
        .first()

      if (!user) {
        throw new Error(`User with this session ID [${sessionId}] not found.`)
      }

      const updateMealBodySchema = z.object({
        name: z.string(),
        description: z.string().optional(),
        createdAt: z.string().datetime(),
        belongsDiet: z.boolean().default(false),
      })

      const { name, description, createdAt, belongsDiet } =
        updateMealBodySchema.parse(request.body)

      await knex('meals')
        .where({
          user_id: user.id,
          id,
        })
        .update({
          name,
          description,
          belongs_diet: belongsDiet,
          created_at: createdAt,
        })

      return reply.status(204).send()
    },
  )
}
