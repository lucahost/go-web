import path from 'node:path'
import { defineConfig } from 'prisma/config'

const dbUrl = process.env.DATABASE_URL ?? 'file:./prisma/db/go.db'

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: dbUrl,
  },
  migrate: {
    async adapter() {
      const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3')
      return new PrismaBetterSqlite3({ url: dbUrl })
    },
  },
})
