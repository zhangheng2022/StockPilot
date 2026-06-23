import type { WorkerEnv } from '../env'

export type AppVariables = {
  requestId: string
  userId: string
}

export type AppBindings = {
  Bindings: WorkerEnv
  Variables: AppVariables
}
