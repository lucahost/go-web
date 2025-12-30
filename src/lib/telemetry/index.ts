import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc'
import { resourceFromAttributes } from '@opentelemetry/resources'
import {
    ATTR_SERVICE_NAME,
    ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import {
    BatchLogRecordProcessor,
    ConsoleLogRecordExporter,
} from '@opentelemetry/sdk-logs'
import { PrismaInstrumentation } from '@prisma/instrumentation'
import { config } from './config'

let sdk: NodeSDK | null = null

export function initTelemetry(): void {
    if (!config.enabled) {
        // eslint-disable-next-line no-console
        console.log('OpenTelemetry disabled')
        return
    }

    if (sdk) {
        // eslint-disable-next-line no-console
        console.log('OpenTelemetry already initialized')
        return
    }

    const resource = resourceFromAttributes({
        [ATTR_SERVICE_NAME]: config.serviceName,
        [ATTR_SERVICE_VERSION]: config.serviceVersion,
        'deployment.environment': config.deploymentEnvironment,
        'host.name': config.hostName,
    })

    // Create log processors - use BatchLogRecordProcessor for better performance
    const logProcessors = [
        new BatchLogRecordProcessor(
            new OTLPLogExporter({ url: config.otlpEndpoint })
        ),
    ]

    // Add console exporter in development for debugging
    if (config.deploymentEnvironment === 'development') {
        logProcessors.push(
            new BatchLogRecordProcessor(new ConsoleLogRecordExporter())
        )
    }

    sdk = new NodeSDK({
        resource,
        traceExporter: new OTLPTraceExporter({
            url: config.otlpEndpoint,
        }),
        metricReader: new PeriodicExportingMetricReader({
            exporter: new OTLPMetricExporter({
                url: config.otlpEndpoint,
            }),
            exportIntervalMillis: 60000,
        }),
        logRecordProcessors: logProcessors,
        instrumentations: [
            getNodeAutoInstrumentations({
                '@opentelemetry/instrumentation-fs': { enabled: false },
                '@opentelemetry/instrumentation-dns': { enabled: false },
                '@opentelemetry/instrumentation-net': { enabled: false },
            }),
            new PrismaInstrumentation(),
        ],
    })

    sdk.start()
    // eslint-disable-next-line no-console
    console.log(
        `OpenTelemetry initialized for ${config.serviceName} -> ${config.otlpEndpoint}`
    )

    const shutdown = () => {
        sdk?.shutdown()
            // eslint-disable-next-line no-console
            .then(() => console.log('OpenTelemetry shut down'))
            // eslint-disable-next-line no-console
            .catch(err => console.error('OpenTelemetry shutdown error', err))
            .finally(() => process.exit(0))
    }

    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)
}

export { config } from './config'
export { logger, type Logger } from './logging'
export {
    gamesCreatedCounter,
    gamesDeletedCounter,
    movesMadeCounter,
    passesMadeCounter,
    usersCreatedCounter,
    gameJoinsCounter,
    pushNotificationsSentCounter,
    pushNotificationsFailedCounter,
    httpRequestDurationHistogram,
    databaseQueryDurationHistogram,
} from './metrics'
export {
    withTelemetry,
    createSpan,
    tracer,
    type TelemetryOptions,
} from './middleware'
