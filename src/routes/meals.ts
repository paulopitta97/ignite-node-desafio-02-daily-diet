import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.get(
    '/summary',
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

      const totalMeals = await knex('meals')
        .where({
          user_id: user.id,
        })
        .count('id', { as: 'quantity' })
        .then((row) => row[0].quantity)

      const totalMealsOnDiet = await knex('meals')
        .where({
          user_id: user.id,
          belongs_diet: true,
        })
        .count('id', { as: 'quantity' })
        .then((row) => row[0].quantity)

      const totalMealsNotOnDiet = await knex('meals')
        .where({
          user_id: user.id,
          belongs_diet: false,
        })
        .count('id', { as: 'quantity' })
        .then((row) => row[0].quantity)

      const mealsOrdered = await knex('meals')
        .where({
          user_id: user.id,
        })
        .orderBy('created_at', 'asc')

      let bestSequenceMealsOnDiet: number = 0
      let previousCreatedDate: Date | null = null
      mealsOrdered.reduce((accumulator, currentValue) => {
        let timeDiffInHours = 0
        if (previousCreatedDate != null) {
          const currentDate: Date = new Date(currentValue.created_at)
          timeDiffInHours =
            Math.abs(currentDate.getTime() - previousCreatedDate.getTime()) /
            3600000
        }
        if (
          Boolean(currentValue.belongs_diet) === false ||
          timeDiffInHours > 24
        ) {
          previousCreatedDate = null
          return 0
        } else {
          const quantity = accumulator + 1
          if (quantity > bestSequenceMealsOnDiet) {
            bestSequenceMealsOnDiet = quantity
          }
          previousCreatedDate = new Date(currentValue.created_at)
          return quantity
        }
      }, bestSequenceMealsOnDiet)

      return {
        totalMeals,
        totalMealsOnDiet,
        totalMealsNotOnDiet,
        bestSequenceMealsOnDiet,
      }
    },
  )

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
        createdAt: z.string(),
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
        createdAt: z.string(),
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
