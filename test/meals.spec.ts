import { afterAll, beforeAll, it, describe, expect, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Meals routes', () => {
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

  it('user can register a new meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'New Username' })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'X Tudo',
        description: 'Snack at the fast food center',
        createdAt: '2023-04-26 19:00:00',
        belongsDiet: false,
      })
      .expect(201)
  })

  it('should be able to list all meals', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'New Username' })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'X Tudo',
        description: 'Snack at the fast food center',
        createdAt: '2023-04-26 19:00:00',
        belongsDiet: false,
      })
      .expect(201)

    const listAllMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(listAllMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'X Tudo',
        description: 'Snack at the fast food center',
      }),
    ])
  })

  it('should be able to get a specific meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'New Username' })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'X Tudo',
        description: 'Snack at the fast food center',
        createdAt: '2023-04-26 19:00:00',
        belongsDiet: false,
      })
      .expect(201)

    const listAllMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(listAllMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        name: 'X Tudo',
        description: 'Snack at the fast food center',
      }),
    ])

    const mealId = listAllMealsResponse.body.meals[0].id

    const getMealWithIDResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getMealWithIDResponse.body.meal).toEqual(
      expect.objectContaining({
        name: 'X Tudo',
        description: 'Snack at the fast food center',
      }),
    )
  })

  it('should be able to get the meals summary', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'New Username' })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')

    const summaryResponse = await request(app.server)
      .get('/meals/summary')
      .set('Cookie', cookies)
      .expect(200)

    expect(summaryResponse.body).toEqual({
      totalMeals: 0,
      totalMealsOnDiet: 0,
      totalMealsNotOnDiet: 0,
      bestSequenceMealsOnDiet: 0,
    })
  })
})
