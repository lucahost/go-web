module.exports = {
    // The VPS cluster's image (Dockerfile) builds with NEXT_OUTPUT=standalone and runs
    // .next/standalone/server.js. Without it the build is as before, for deploy.yml's
    // `next start` on the host.
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
