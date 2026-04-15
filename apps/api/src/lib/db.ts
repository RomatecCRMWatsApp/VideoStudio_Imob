import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
import * as schema from './schema'

let dbInstance: any = null

export const db = new Proxy({}, {
  get: (target, prop) => {
    if (!dbInstance) {
      if (!process.env.DATABASE_URL) {
        throw new Error('[DB] DATABASE_URL environment variable not set')
      }
      process.stdout.write('[DB] Initializing database connection...\n')
      const pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
      })
      dbInstance = drizzle(pool, { schema, mode: 'default' })
      process.stdout.write('[DB] Database connection initialized ✓\n')
    }
    return (dbInstance as any)[prop as string]
  }
} as any)
