'use strict'

const assert = require('node:assert/strict')
const { spawn } = require('node:child_process')
const { mkdtempSync, mkdirSync, rmSync } = require('node:fs')
const { tmpdir } = require('node:os')
const path = require('node:path')
const { createRequire } = require('node:module')

function parseArgs(argv) {
  const values = new Map()
  for (let index = 0; index < argv.length; index += 2) {
    const name = argv[index]
    const value = argv[index + 1]
    if (!name?.startsWith('--') || !value || value.startsWith('--')) {
      throw new Error(`invalid argument near ${name || '<end>'}`)
    }
    values.set(name.slice(2), value)
  }
  const required = (name) => {
    const value = values.get(name)
    if (!value) throw new Error(`--${name} is required`)
    return value
  }
  const timeoutMs = Number(values.get('timeout-ms') || '90000')
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 100) {
    throw new Error('--timeout-ms must be an integer of at least 100')
  }
  const shutdownGraceMs = Number(values.get('shutdown-grace-ms') || '20000')
  if (!Number.isSafeInteger(shutdownGraceMs) || shutdownGraceMs < 100) {
    throw new Error('--shutdown-grace-ms must be an integer of at least 100')
  }
  return {
    expectedVersion: required('expected-version'),
    packageRoot: path.resolve(required('package-root')),
    target: required('target'),
    timeoutMs,
    shutdownGraceMs
  }
}

function operationTimeout(name, promise, timeoutMs) {
  let timer
  return Promise.race([
    Promise.resolve(promise),
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${name} exceeded ${timeoutMs}ms`)), timeoutMs)
    })
  ]).finally(() => clearTimeout(timer))
}

async function runChild(options) {
  const projectRequire = createRequire(path.join(options.packageRoot, 'package.json'))
  const sdk = projectRequire('@mesh-llm/sdk')
  assert.equal(sdk.currentMeshVersion(), options.expectedVersion)
  assert.equal(typeof sdk.generateOwnerKeypairHex, 'function')
  assert.equal(typeof sdk.Node?.create, 'function')
  assert.equal(typeof options.smokeRoot, 'string')

  const smokeRoot = options.smokeRoot
  const cacheDir = path.join(smokeRoot, 'cache')
  const runtimeDir = path.join(smokeRoot, 'runtime')
  mkdirSync(cacheDir, { recursive: true })
  mkdirSync(runtimeDir, { recursive: true })
  let node
  let cleanupPromise
  const cleanup = () => {
    if (!cleanupPromise) {
      cleanupPromise = (async () => {
        try {
          if (node) await operationTimeout('node.stop()', node.stop(), 15000)
        } finally {
          rmSync(smokeRoot, { recursive: true, force: true })
        }
      })()
    }
    return cleanupPromise
  }
  const terminate = () => {
    void cleanup().then(
      () => process.exit(0),
      (error) => {
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(1)
      }
    )
  }
  process.once('SIGTERM', terminate)
  try {
    node = sdk.Node.create({
      ownerKeypairHex: sdk.generateOwnerKeypairHex(),
      inviteToken: `packaging-smoke-${options.target}-${process.pid}-${Date.now()}`,
      cacheDir,
      runtimeDir,
      servingEnabled: false
    })
    await operationTimeout('node.start()', node.start(), 45000)
    const status = await operationTimeout('node.status()', node.status(), 15000)
    assert.ok(status && typeof status === 'object', 'node.status() must return an object')
    process.stdout.write(`${JSON.stringify({ target: options.target, status })}\n`)
  } finally {
    await cleanup()
  }
}

function supervise(options) {
  return new Promise((resolve, reject) => {
    const smokeRoot = mkdtempSync(path.join(tmpdir(), `mesh-llm-node-sdk-${options.target}-`))
    const childOptions = { ...options, smokeRoot }
    const child = spawn(process.execPath, [__filename, '--child-options', JSON.stringify(childOptions)], {
      cwd: options.packageRoot,
      env: process.env,
      stdio: 'inherit'
    })
    let timedOut = false
    let killTimer
    const clearTimers = () => {
      clearTimeout(timer)
      if (killTimer) clearTimeout(killTimer)
    }
    const timer = setTimeout(() => {
      timedOut = true
      child.kill('SIGTERM')
      killTimer = setTimeout(() => {
        if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL')
      }, options.shutdownGraceMs)
    }, options.timeoutMs)
    child.once('error', (error) => {
      clearTimers()
      rmSync(smokeRoot, { recursive: true, force: true })
      reject(error)
    })
    child.once('exit', (code, signal) => {
      clearTimers()
      rmSync(smokeRoot, { recursive: true, force: true })
      if (timedOut) {
        reject(new Error(`Node SDK smoke did not exit normally within ${options.timeoutMs}ms`))
      } else if (code !== 0 || signal) {
        reject(new Error(`Node SDK smoke child exited with code=${code} signal=${signal || 'none'}`))
      } else {
        resolve()
      }
    })
  })
}

async function main() {
  if (process.argv[2] === '--child-options') {
    await runChild(JSON.parse(process.argv[3]))
    return
  }
  const options = parseArgs(process.argv.slice(2))
  await supervise(options)
  process.stdout.write(`Node SDK runtime smoke passed for ${options.target}\n`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
