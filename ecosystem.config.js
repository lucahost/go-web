module.exports = {
    apps: [{
        name: "FWebT GO",
        script: "node_modules/next/dist/bin/next",
        args: "start",
        instances: 1,
        exec_mode: "fork"
    }]
}
