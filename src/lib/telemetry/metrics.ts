import { metrics } from '@opentelemetry/api'
import { config } from './config'

const meter = metrics.getMeter(config.serviceName, config.serviceVersion)

// Counters
export const gamesCreatedCounter = meter.createCounter('games_created_total', {
    description: 'Total number of games created',
})

export const movesMadeCounter = meter.createCounter('moves_made_total', {
    description: 'Total number of moves made',
})

export const passesMadeCounter = meter.createCounter('passes_made_total', {
    description: 'Total number of passes made',
})

export const usersCreatedCounter = meter.createCounter('users_created_total', {
    description: 'Total number of users created',
})

export const gameJoinsCounter = meter.createCounter('game_joins_total', {
    description: 'Total number of game joins',
})

export const gamesDeletedCounter = meter.createCounter('games_deleted_total', {
    description: 'Total number of games deleted',
})

export const pushNotificationsSentCounter = meter.createCounter(
    'push_notifications_sent_total',
    {
        description: 'Total number of push notifications sent successfully',
    }
)

export const pushNotificationsFailedCounter = meter.createCounter(
    'push_notifications_failed_total',
    {
        description: 'Total number of push notifications that failed',
    }
)

// Histograms
export const httpRequestDurationHistogram = meter.createHistogram(
    'http_request_duration_seconds',
    {
        description: 'Duration of HTTP requests in seconds',
        unit: 's',
    }
)

export const databaseQueryDurationHistogram = meter.createHistogram(
    'database_query_duration_seconds',
    {
        description: 'Duration of database queries in seconds',
        unit: 's',
    }
)
