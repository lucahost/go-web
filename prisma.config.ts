import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  migrate: {
    async adapter() {
      const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3')
      const dbPath = process.env.DATABASE_URL ?? 'file:./prisma/db/go.db'
      return new PrismaBetterSqlite3({ url: dbPath })
    },
  },
})
