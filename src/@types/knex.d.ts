// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    meals: {
      id: string
      name: string
      description: string
      belongs_diet: boolean
      created_at: string
      user_id: string
    }
    users: {
      id: string
      name: string
      session_id: string
    }
  }
}
