// Copies the Prisma CLI and everything `prisma migrate deploy` loads (prisma.config.ts imports
// prisma/config and @prisma/adapter-better-sqlite3) from the build's node_modules into
// <target>/node_modules, exactly the versions package-lock.json pins. The standalone server
// doesn't carry the CLI, and a full `npm ci --omit=dev` tree would triple the image.
//
//   node deploy/prisma-cli-closure.mjs <project dir> <target dir>
import { cpSync, existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const [project, target] = process.argv.slice(2)
if (!project || !target) {
    console.error('usage: prisma-cli-closure.mjs <project dir> <target dir>')
    process.exit(2)
}
const roots = ['prisma', '@prisma/adapter-better-sqlite3', 'better-sqlite3']
const lock = JSON.parse(readFileSync(path.join(project, 'package-lock.json'), 'utf8')).packages

// Node's lookup, on the lockfile's paths: <from>/node_modules/<name>, then each parent's.
function resolve(from, name) {
    let dir = from
    for (;;) {
        const key = (dir ? `${dir}/` : '') + `node_modules/${name}`
        if (lock[key]) return key
        if (!dir) return null
        const i = dir.lastIndexOf('/node_modules/')
        dir = i < 0 ? '' : dir.slice(0, i)
    }
}

const seen = new Set()
const queue = roots.map(r => {
    const key = resolve('', r)
    if (!key) throw new Error(`${r} isn't in package-lock.json`)
    return key
})
while (queue.length) {
    const key = queue.pop()
    if (seen.has(key)) continue
    seen.add(key)
    const p = lock[key]
    // Optional peers (prisma's typescript) stay out: the CLI loads prisma.config.ts with jiti.
    const peers = Object.keys(p.peerDependencies ?? {}).filter(n => !p.peerDependenciesMeta?.[n]?.optional)
    const optional = new Set(Object.keys(p.optionalDependencies ?? {}))
    for (const name of new Set([...Object.keys(p.dependencies ?? {}), ...optional, ...peers])) {
        const dep = resolve(key, name)
        if (dep && existsSync(path.join(project, dep))) queue.push(dep)
        else if (!optional.has(name)) throw new Error(`${key} needs ${name}, which isn't installed`)
    }
}

for (const key of [...seen].sort()) {
    const src = path.join(project, key)
    // A package's own files only: nested node_modules come in as packages of the closure.
    cpSync(src, path.join(target, key), {
        recursive: true,
        filter: s => !path.relative(src, s).split(path.sep).includes('node_modules'),
    })
}
console.log(`prisma-cli-closure: ${seen.size} packages → ${target}/node_modules`)
