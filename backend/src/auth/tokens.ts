import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import type {JwtPayload} from "../types/types.js";

const ACCESS_TTL = '4h'

export function signAccessToken(user: {
    id: string
    email: string
    role: string
}): string {
    const payload: JwtPayload = {
        id: user.id,
        email: user.email,
        role: user.role as 'USER' | 'ADMIN'
    }

    return jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: ACCESS_TTL
    })
}

export function signRefreshToken() {
    const token = crypto.randomBytes(64).toString('hex')

    const hash = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex')

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    return {token, hash, expiresAt}
}