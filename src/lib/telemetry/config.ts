import os from 'os'

export interface TelemetryConfig {
    serviceName: string
    serviceVersion: string
    deploymentEnvironment: string
    hostName: string
    otlpEndpoint: string
    enabled: boolean
    logLevel: string
}

export function getTelemetryConfig(): TelemetryConfig {
    return {
        serviceName: process.env.OTEL_SERVICE_NAME || 'go-web',
        serviceVersion: process.env.OTEL_SERVICE_VERSION || '0.1.0',
        deploymentEnvironment:
            process.env.OTEL_DEPLOYMENT_ENVIRONMENT ||
            process.env.NODE_ENV ||
            'development',
        hostName: os.hostname(),
        otlpEndpoint:
            process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4317',
        enabled: process.env.OTEL_ENABLED !== 'false',
        logLevel: process.env.OTEL_LOG_LEVEL || 'info',
    }
}

export const config = getTelemetryConfig()
