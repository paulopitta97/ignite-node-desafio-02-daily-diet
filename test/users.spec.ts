import { afterAll, beforeAll, it, describe, expect, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new user', async () => {
    await request(app.server)
      .post('/users')
      .send({ name: 'New Username' })
      .expect(201)
  })

  it('should not be able to create a new user with existing session id', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'New Username' })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')

    const createNewUserResponse = await request(app.server)
      .post('/users')
      .set('Cookie', cookies)
      .send({ name: 'New Usertest' })
      .expect(403)

    expect(createNewUserResponse.body).toEqual({
      error: expect.stringContaining(
        'User with this session ID already exists and is connected.',
      ),
    })
  })
})
