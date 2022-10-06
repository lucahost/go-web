module.exports = {
    apps: [
        {
            "name": "FWebT GO",
            "script": "node_modules/next/dist/bin/next",
            "args": "start",
            "exec_mode": "cluster",
        }
    ]
}