import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express'

import { prisma } from './lib/prisma.js'
import jwt from 'jsonwebtoken'
import type { PubSubEngine } from 'graphql-subscriptions'
import type { AuthUser, Context } from './types/types.js'

export function getUserFromAccessToken(auth?: string): AuthUser | null {
  if (!auth?.startsWith('Bearer ')) return null

  try {
    const payload = jwt.verify(
      auth.slice(7),
      process.env.JWT_SECRET!,
    ) as jwt.JwtPayload

    if (
      typeof payload.id !== 'string' ||
      typeof payload.email !== 'string' ||
      typeof payload.role !== 'string'
    ) {
      return null
    }

    return {
      id: payload.id,
      email: payload.email,
      role: payload.role as 'USER' | 'ADMIN',
      lastName: payload.lastName,
      firstName: payload.firstName,
      displayName: payload.displayName,
      emailVerified: payload.emailVerified,
      createdAt: payload.createdAt,
      updatedAt: payload.updatedAt,
    }
  } catch {
    return null
  }
}

export function buildContext(
  req: ExpressRequest,
  res: ExpressResponse,
  pubsub: PubSubEngine,
): Context {
  return {
    req,
    res,
    user: req ? getUserFromAccessToken(req.headers.authorization) : null,
    pubsub,
    prisma,
  }
}

export function buildHttpContext(
  req: ExpressRequest,
  res: ExpressResponse,
  pubsub: PubSubEngine,
): Context {
  return {
    req,
    res,
    pubsub,
    prisma,
    user: getUserFromAccessToken(req.headers.authorization),
  }
}

export function buildWsContext(
  authHeader: string | undefined,
  pubsub: PubSubEngine,
  ip: string,
): Context {
  return {
    pubsub,
    prisma,
    user: getUserFromAccessToken(authHeader),
    ip,
  }
}
