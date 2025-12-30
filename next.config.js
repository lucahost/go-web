module.exports = {
    compiler: {
        styledComponents: true,
    },
    serverExternalPackages: [
        'better-sqlite3',
        '@prisma/adapter-better-sqlite3',
        '@opentelemetry/api',
        '@opentelemetry/sdk-node',
        '@opentelemetry/sdk-trace-node',
        '@opentelemetry/sdk-metrics',
        '@opentelemetry/exporter-trace-otlp-grpc',
        '@opentelemetry/exporter-metrics-otlp-grpc',
        '@opentelemetry/auto-instrumentations-node',
        '@opentelemetry/instrumentation-http',
        '@prisma/instrumentation',
        'pino',
    ],
}
