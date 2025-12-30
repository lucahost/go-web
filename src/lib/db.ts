import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { databaseQueryDurationHistogram } from './telemetry/metrics'
import { logger } from './telemetry/logging'

const databaseUrl = process.env.DATABASE_URL ?? 'file:./prisma/db/go.db'

function createPrismaClient(): PrismaClient {
    const adapter = new PrismaBetterSqlite3({ url: databaseUrl })
    const client = new PrismaClient({ adapter })

    client.$use(async (params, next) => {
        const startTime = performance.now()
        const model = params.model ?? 'unknown'
        const action = params.action

        try {
            const result = await next(params)
            return result
        } catch (error) {
            logger.error(`Prisma query failed: ${model}.${action}`, error)
            throw error
        } finally {
            const duration = (performance.now() - startTime) / 1000
            databaseQueryDurationHistogram.record(duration, {
                model,
                operation: action,
            })
        }
    })

    return client
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
