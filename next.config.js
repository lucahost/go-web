module.exports = {
    // The image (Dockerfile) builds with NEXT_OUTPUT=standalone and runs
    // .next/standalone/server.js. Without it (CI, `npm run dev`/`start` locally) the
    // build has no standalone copy.
    output: process.env.NEXT_OUTPUT === 'standalone' ? 'standalone' : undefined,
    compiler: {
        styledComponents: true,
    },
    serverExternalPackages: [
        'better-sqlite3',
        '@prisma/adapter-better-sqlite3',
        '@opentelemetry/api',
        '@opentelemetry/sdk-node',
        '@opentelemetry/sdk-metrics',
        '@opentelemetry/sdk-logs',
        '@opentelemetry/exporter-trace-otlp-grpc',
        '@opentelemetry/exporter-metrics-otlp-grpc',
        '@opentelemetry/exporter-logs-otlp-grpc',
        '@opentelemetry/auto-instrumentations-node',
        '@opentelemetry/instrumentation-http',
        '@prisma/instrumentation',
        'pino',
    ],
}
