import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
    })

    const { name } = createUserBodySchema.parse(request.body)

    let sessionId = request.cookies.sessionId
    if (!sessionId) {
      sessionId = randomUUID()
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    } else {
      // checar se já existe usuario com este session ID
      const user = await knex('users')
        .where({
          session_id: sessionId,
        })
        .first()
      if (user) {
        return reply.status(403).send({
          error: `User with this session ID already exists and is connected.`,
        })
      }
    }

    await knex('users').insert({
      id: randomUUID(),
      name,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
