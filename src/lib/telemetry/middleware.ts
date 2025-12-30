import { trace, SpanStatusCode, context, SpanKind } from '@opentelemetry/api'
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'
import { logger } from './logging'
import { httpRequestDurationHistogram } from './metrics'
import { config } from './config'

const tracer = trace.getTracer(config.serviceName, config.serviceVersion)

export interface TelemetryOptions {
    operationName: string
    attributes?: Record<string, string | number>
}

export function withTelemetry<T>(
    handler: NextApiHandler<T>,
    options: TelemetryOptions
): NextApiHandler<T> {
    return async (req: NextApiRequest, res: NextApiResponse<T>) => {
        const startTime = performance.now()
        const route = req.url?.split('?')[0] || 'unknown'

        const span = tracer.startSpan(`api.${options.operationName}`, {
            kind: SpanKind.SERVER,
            attributes: {
                'http.method': req.method || 'UNKNOWN',
                'http.url': req.url || '',
                'http.route': route,
                'http.target': req.url || '',
                ...options.attributes,
            },
        })

        return context.with(trace.setSpan(context.active(), span), async () => {
            try {
                await handler(req, res)
                span.setAttribute('http.status_code', res.statusCode)
                if (res.statusCode >= 400) {
                    span.setStatus({
                        code: SpanStatusCode.ERROR,
                        message: `HTTP ${res.statusCode}`,
                    })
                } else {
                    span.setStatus({ code: SpanStatusCode.OK })
                }
            } catch (error) {
                span.setStatus({
                    code: SpanStatusCode.ERROR,
                    message: String(error),
                })
                span.recordException(error as Error)
                logger.error(`${options.operationName} failed`, error as Error, {
                    route,
                    method: req.method,
                })
                throw error
            } finally {
                const duration = (performance.now() - startTime) / 1000
                httpRequestDurationHistogram.record(duration, {
                    method: req.method || 'UNKNOWN',
                    route: options.operationName,
                    status_code: res.statusCode,
                })
                span.end()
            }
        })
    }
}

export function createSpan(
    name: string,
    attributes?: Record<string, string | number | boolean>
) {
    return tracer.startSpan(name, { attributes })
}

export { tracer }
