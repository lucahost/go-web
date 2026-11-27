// The web container's entrypoint in the VPS cluster (Dockerfile, vps.yaml):
//  1. the empty-DB guard: refuse to start without the SQLite file the cutover copied;
//  2. `prisma migrate deploy`, on every start (the old pm2 deploy ran it before every restart);
//  3. Next's standalone server.
//
// Why the guard: better-sqlite3 (and `prisma migrate deploy`) create a missing database file.
// A pod started on an empty /data would come up healthy with a fresh, empty database and every
// user gone, without an error. A missing or empty file stops the pod instead, and `vps cutover`
// rolls back. GO_WEB_FRESH_DB=true lets a deliberately new database start (never at a cutover).
import { spawnSync } from 'node:child_process'
import { accessSync, closeSync, constants, openSync, readSync, statSync } from 'node:fs'
import path from 'node:path'

const die = msg => {
    console.error(`start: ${msg}`)
    process.exit(1)
}

const url = process.env.DATABASE_URL ?? ''
if (!/^file:\//.test(url)) die(`DATABASE_URL must be an absolute file: URL, not '${url}'`)
const db = url.slice('file:'.length)

let st = null
try {
    st = statSync(db)
} catch {
    st = null
}
if (process.env.GO_WEB_FRESH_DB === 'true') {
    console.log(`start: GO_WEB_FRESH_DB=true: ${db} ${st ? 'exists' : 'will be created'}`)
} else {
    if (!st) die(`${db} doesn't exist: refusing to start on a fresh, empty database (GO_WEB_FRESH_DB=true allows it)`)
    if (!st.isFile() || st.size === 0) die(`${db} isn't a non-empty file: refusing to start`)
    const head = Buffer.alloc(16)
    const fd = openSync(db, 'r')
    readSync(fd, head, 0, 16, 0)
    closeSync(fd)
    if (head.toString('latin1') !== 'SQLite format 3\0') die(`${db} isn't an SQLite database: refusing to start`)
}
// SQLite writes its journal next to the database, so the directory must be writable.
try {
    accessSync(path.dirname(db), constants.W_OK)
} catch {
    die(`${path.dirname(db)} isn't writable (SQLite keeps its journal there)`)
}

const migrate = '/app/migrate'
const r = spawnSync(
    process.execPath,
    [`${migrate}/node_modules/prisma/build/index.js`, 'migrate', 'deploy', '--config', `${migrate}/prisma.config.ts`],
    { cwd: migrate, stdio: 'inherit', env: process.env }
)
if (r.status !== 0) die(`prisma migrate deploy failed (${r.error ?? `exit ${r.status ?? r.signal}`})`)

await import('/app/server.js')
