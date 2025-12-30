import pino, { Logger as PinoLogger } from 'pino'
import { trace, context } from '@opentelemetry/api'
import { logs, SeverityNumber } from '@opentelemetry/api-logs'
import { config } from './config'

function getTraceContext(): { trace_id?: string; span_id?: string } {
    const span = trace.getSpan(context.active())
    if (span) {
        const spanContext = span.spanContext()
        return {
            trace_id: spanContext.traceId,
            span_id: spanContext.spanId,
        }
    }
    return {}
}

const severityMap: Record<string, SeverityNumber> = {
    trace: SeverityNumber.TRACE,
    debug: SeverityNumber.DEBUG,
    info: SeverityNumber.INFO,
    warn: SeverityNumber.WARN,
    error: SeverityNumber.ERROR,
    fatal: SeverityNumber.FATAL,
}

function emitOtelLog(
    level: string,
    msg: string,
    attributes?: Record<string, unknown>
) {
    const otelLogger = logs.getLogger(config.serviceName)
    otelLogger.emit({
        severityNumber: severityMap[level] ?? SeverityNumber.INFO,
        severityText: level.toUpperCase(),
        body: msg,
        attributes: attributes as Record<string, string | number | boolean>,
    })
}

const baseLogger: PinoLogger = pino({
    level: config.logLevel,
    base: {
        service: config.serviceName,
        version: config.serviceVersion,
        environment: config.deploymentEnvironment,
    },
    transport:
        process.env.NODE_ENV === 'development'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
})

export interface Logger {
    trace(msg: string, data?: object): void
    debug(msg: string, data?: object): void
    info(msg: string, data?: object): void
    warn(msg: string, data?: object): void
    error(msg: string, error?: Error | unknown, data?: object): void
    fatal(msg: string, error?: Error | unknown, data?: object): void
    child(bindings: object): Logger
}

function createLogger(pinoInstance: PinoLogger): Logger {
    return {
        trace(msg: string, data?: object) {
            const ctx = getTraceContext()
            pinoInstance.trace({ ...ctx, ...data }, msg)
            emitOtelLog('trace', msg, { ...ctx, ...data })
        },
        debug(msg: string, data?: object) {
            const ctx = getTraceContext()
            pinoInstance.debug({ ...ctx, ...data }, msg)
            emitOtelLog('debug', msg, { ...ctx, ...data })
        },
        info(msg: string, data?: object) {
            const ctx = getTraceContext()
            pinoInstance.info({ ...ctx, ...data }, msg)
            emitOtelLog('info', msg, { ...ctx, ...data })
        },
        warn(msg: string, data?: object) {
            const ctx = getTraceContext()
            pinoInstance.warn({ ...ctx, ...data }, msg)
            emitOtelLog('warn', msg, { ...ctx, ...data })
        },
        error(msg: string, error?: Error | unknown, data?: object) {
            const ctx = getTraceContext()
            const errorData =
                error instanceof Error
                    ? {
                          error: {
                              message: error.message,
                              name: error.name,
                              stack: error.stack,
                          },
                      }
                    : { error }
            pinoInstance.error({ ...ctx, ...errorData, ...data }, msg)
            emitOtelLog('error', msg, {
                ...ctx,
                ...(error instanceof Error
                    ? {
                          'error.message': error.message,
                          'error.name': error.name,
                          'error.stack': error.stack,
                      }
                    : {}),
                ...data,
            })
        },
        fatal(msg: string, error?: Error | unknown, data?: object) {
            const ctx = getTraceContext()
            const errorData =
                error instanceof Error
                    ? {
                          error: {
                              message: error.message,
                              name: error.name,
                              stack: error.stack,
                          },
                      }
                    : { error }
            pinoInstance.fatal({ ...ctx, ...errorData, ...data }, msg)
            emitOtelLog('fatal', msg, {
                ...ctx,
                ...(error instanceof Error
                    ? {
                          'error.message': error.message,
                          'error.name': error.name,
                          'error.stack': error.stack,
                      }
                    : {}),
                ...data,
            })
        },
        child(bindings: object): Logger {
            return createLogger(pinoInstance.child(bindings))
        },
    }
}

export const logger = createLogger(baseLogger)
