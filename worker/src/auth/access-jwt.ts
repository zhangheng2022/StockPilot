import { createRemoteJWKSet, jwtVerify } from 'jose'
import type { WorkerEnv } from '../env'
import { HttpError } from '../http/errors'

type AccessJwtPayload = {
  email?: unknown
  sub?: unknown
}

export async function getAccessUserId(request: Request, env: WorkerEnv): Promise<string> {
  const token = request.headers.get('cf-access-jwt-assertion')

  if (!token) {
    throw new HttpError('unauthorized', 'Cloudflare Access token is required', 401)
  }

  if (!env.TEAM_DOMAIN || !env.POLICY_AUD) {
    throw new HttpError('internal_error', 'Cloudflare Access is not configured', 500)
  }

  const teamDomain = normalizeTeamDomain(env.TEAM_DOMAIN)
  const jwks = createRemoteJWKSet(new URL('/cdn-cgi/access/certs', teamDomain))

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: teamDomain,
      audience: env.POLICY_AUD,
    })
    const accessPayload = payload as AccessJwtPayload
    const userId = stringClaim(accessPayload.email) ?? stringClaim(accessPayload.sub)

    if (!userId) {
      throw new HttpError('unauthorized', 'Cloudflare Access identity is missing', 401)
    }

    return userId
  } catch (error) {
    if (error instanceof HttpError) throw error

    throw new HttpError('unauthorized', 'Cloudflare Access token is invalid', 401)
  }
}

function normalizeTeamDomain(teamDomain: string) {
  return teamDomain.endsWith('/') ? teamDomain.slice(0, -1) : teamDomain
}

function stringClaim(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : undefined
}
