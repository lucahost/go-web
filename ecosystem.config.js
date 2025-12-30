require('dotenv').config()

module.exports = {
    apps: [{
        name: "FWebT GO",
        script: "node_modules/next/dist/bin/next",
        args: "start -H 127.0.0.1",
        instances: 1,
        exec_mode: "fork",
        env: {
            NODE_ENV: "production",
            OTEL_ENABLED: process.env.OTEL_ENABLED || "true",
            OTEL_SERVICE_NAME: process.env.OTEL_SERVICE_NAME || "go-web",
            OTEL_SERVICE_VERSION: process.env.OTEL_SERVICE_VERSION || "0.1.0",
            OTEL_DEPLOYMENT_ENVIRONMENT: "production",
            OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || "http://localhost:4317",
            OTEL_LOG_LEVEL: process.env.OTEL_LOG_LEVEL || "info",
        }
    }]
}
