type D1Row = Record<string, unknown>

type StatementCall = {
  sql: string
  bindings: unknown[]
}

type QueryHandler = (call: StatementCall) => D1Row[] | D1Row | null

class FakePreparedStatement {
  private bindings: unknown[] = []

  constructor(
    private readonly sql: string,
    private readonly calls: StatementCall[],
    private readonly queryHandler: QueryHandler,
  ) {}

  bind(...bindings: unknown[]) {
    this.bindings = bindings
    return this
  }

  async all<T extends D1Row = D1Row>() {
    const call = this.record()
    const result = this.queryHandler(call)
    return {
      results: Array.isArray(result) ? (result as T[]) : [],
      success: true,
      meta: {},
    }
  }

  async first<T extends D1Row = D1Row>() {
    const call = this.record()
    const result = this.queryHandler(call)
    return (Array.isArray(result) ? result[0] : result) as T | null
  }

  async run() {
    this.record()
    return {
      success: true,
      meta: {
        changes: 1,
      },
    }
  }

  private record() {
    const call = {
      sql: this.sql,
      bindings: this.bindings,
    }
    this.calls.push(call)
    return call
  }
}

export class FakeD1Database {
  readonly calls: StatementCall[] = []

  constructor(private readonly queryHandler: QueryHandler = () => []) {}

  prepare(sql: string) {
    return new FakePreparedStatement(sql, this.calls, this.queryHandler)
  }
}

export function asD1Database(db: FakeD1Database): D1Database {
  return db as unknown as D1Database
}

export function createTestEnv(db = new FakeD1Database(), overrides: Partial<Env> = {}): Env {
  return {
    DB: asD1Database(db),
    ASSETS: {
      fetch: async () => new Response('asset fallback'),
      connect: () => {
        throw new Error('ASSETS.connect is not implemented in tests')
      },
    },
    ENVIRONMENT: 'development',
    POLICY_AUD: 'test-aud',
    TEAM_DOMAIN: 'https://test.cloudflareaccess.com',
    ...overrides,
  }
}
