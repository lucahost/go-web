import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const databaseUrl = process.env.DATABASE_URL ?? 'file:./prisma/db/go.db'

function createPrismaClient(): PrismaClient {
    const adapter = new PrismaBetterSqlite3({ url: databaseUrl })
    // Note: Prisma tracing is handled by @prisma/instrumentation in telemetry/index.ts
    return new PrismaClient({ adapter })
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
    prisma = createPrismaClient()
} else {
    if (!global.prisma) {
        global.prisma = createPrismaClient()
    }
    prisma = global.prisma
}
export default prisma
