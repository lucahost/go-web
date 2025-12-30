import pino, { Logger as PinoLogger } from 'pino'
import { trace, context } from '@opentelemetry/api'
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
            pinoInstance.trace({ ...getTraceContext(), ...data }, msg)
        },
        debug(msg: string, data?: object) {
            pinoInstance.debug({ ...getTraceContext(), ...data }, msg)
        },
        info(msg: string, data?: object) {
            pinoInstance.info({ ...getTraceContext(), ...data }, msg)
        },
        warn(msg: string, data?: object) {
            pinoInstance.warn({ ...getTraceContext(), ...data }, msg)
        },
        error(msg: string, error?: Error | unknown, data?: object) {
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
            pinoInstance.error(
                { ...getTraceContext(), ...errorData, ...data },
                msg
            )
        },
        fatal(msg: string, error?: Error | unknown, data?: object) {
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
            pinoInstance.fatal(
                { ...getTraceContext(), ...errorData, ...data },
                msg
            )
        },
        child(bindings: object): Logger {
            return createLogger(pinoInstance.child(bindings))
        },
    }
}

export const logger = createLogger(baseLogger)
