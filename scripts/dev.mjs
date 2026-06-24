import { spawn } from 'node:child_process'

const commands = {
  migrate: 'npm run db:migrate:local',
  nuxt: 'npm run dev:nuxt',
  worker: 'npm run dev:worker',
}

const children = new Set()
let shuttingDown = false

await runScript('db:migrate:local')

startScript('dev:nuxt')
startScript('dev:worker')

await new Promise(() => {})

function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    const command = `npm run ${scriptName}`
    const child = spawnCommand(command)

    child.on('exit', (code) => {
      if (code === 0) {
        resolve()
        return
      }

      reject(new Error(`${command} exited with code ${code ?? 'unknown'}`))
    })
  })
}

function startScript(scriptName) {
  const child = spawnCommand(`npm run ${scriptName}`)

  children.add(child)

  child.on('exit', (code, signal) => {
    children.delete(child)

    if (shuttingDown) {
      return
    }

    shuttingDown = true
    stopChildren()
    const label = scriptName === 'dev:nuxt' ? commands.nuxt : commands.worker
    const exitReason = signal ?? code ?? 'unknown'
    console.error(`${label} exited with ${exitReason}`)
    process.exit(typeof code === 'number' ? code : 1)
  })
}

function stopChildren() {
  for (const child of children) {
    child.kill()
  }
}

function spawnCommand(command) {
  return spawn(command, {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      FORCE_COLOR: '1',
    },
  })
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    shuttingDown = true
    stopChildren()
    process.exit(signal === 'SIGINT' ? 130 : 143)
  })
}
