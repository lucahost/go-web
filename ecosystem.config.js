module.exports = {
    apps: [{
        name: "FWebT GO",
        script: "node_modules/next/dist/bin/next",
        args: "start -H 127.0.0.1",
        instances: 1,
        exec_mode: "fork"
    }]
}
