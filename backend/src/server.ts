import 'dotenv/config'
import express from 'express'
import http from 'http'
import cors from 'cors'
import bodyParser from 'body-parser'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/use/ws'
import healthRouter from './health.js'
import { createApolloMiddleware, schema } from './app.js'
import { pubsub } from './pubsub.js'
import { buildWsContext } from './context.js'
import cookieParser from 'cookie-parser'
import path from 'path'

const PORT = parseInt(process.env.PORT || '4000', 10)

// const allowedOrigins = [
//     'http://localhost:5173',
//     'http://localhost:4173',
//     'http://localhost:4000',
//     'http://10.0.20.50:4000',
//     'http://10.0.20.50:5173',
//     'http://10.0.20.50:4173',
//     'http://10.0.20.202:4173',
//     'http://10.0.20.202:5173',
//     'http://127.0.0.1:5173',
//     'http://frontend:5173',
//     'http://frontend',
//     'https://frontend',
//     'https://192.168.112.187',
//     'http://192.168.112.187',
//     'http://10.0.30.187',
//     'https://10.0.30.187',
// ]
const allowedOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

console.log('🌐 CORS allowed origins:', allowedOrigins)

let activeConnections = 0

const FAVICON_DIR = path.resolve(process.env.FAVICON_DIR ?? './data/favicons')

async function start() {
  const app = express()
  // app.use(cors(), bodyParser.json())
  // 🔥 STATIC FILES
  app.use(
    '/favicons',
    express.static(FAVICON_DIR, {
      fallthrough: false, // 404 statt weiterleiten
      immutable: true, // Cache-freundlich
      maxAge: '365d', // Browser-Caching
    }),
  )
  app.use(
    cors({
      origin(origin, callback) {
        // Allow server-to-server / curl / same-origin
        if (!origin) {
          return callback(null, true)
        }

        if (allowedOrigins.includes(origin)) {
          return callback(null, true)
        }

        console.warn('❌ CORS blocked origin:', origin)
        return callback(new Error('Not allowed by CORS'))
      },
      credentials: true,
    }),
    bodyParser.json(),
  )
  app.use(cookieParser())
  app.use(bodyParser.json({ limit: '10mb' })) // oder '20mb'

  const apolloMiddleware = await createApolloMiddleware()
  app.use('/graphql', apolloMiddleware)

  app.use('/', healthRouter)

  const httpServer = http.createServer(app)

  const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' })
  // const cleanup = useServer({schema, context: () => ({pubsub})}, wsServer)

  const cleanup = useServer(
    {
      schema,
      context: (ctx) => {
        const auth =
          (ctx.connectionParams?.Authorization as string | undefined) ??
          (ctx.connectionParams?.authorization as string | undefined)

        const ip = ctx.extra.request?.socket?.remoteAddress ?? 'unknown'

        return buildWsContext(auth, pubsub, ip)
      },

      // 🟢 Verbindung aufgebaut
      onConnect: () => {
        activeConnections++
        console.log('WS clients:', activeConnections)
      },

      // 🔴 Verbindung getrennt
      onDisconnect: () => {
        activeConnections--
        console.log('🔴 WS DISCONNECT', {
          activeConnections,
        })
      },
    },
    wsServer,
  )
  //     context:
  //         async ({ req, res }) =>
  //             buildHttpContext(req, res, pubsub),
  //
  //
  // //         (ctx, req, res) => {
  // //         const auth =
  // //             (ctx.connectionParams?.Authorization as string | undefined) ??
  // //             (ctx.connectionParams?.authorization as string | undefined)
  // //
  // //         const fakeReq = {
  // //             headers: {authorization: auth}
  // //         } as any
  // //
  // //         return buildContext(req, res, pubsub, fakeReq )
  // //     }
  // },

  httpServer.listen(PORT, () => {
    console.log(`GraphQL HTTP:  http://localhost:${PORT}/graphql`)
    console.log(`GraphQL WS:    ws://localhost:${PORT}/graphql`)
    console.log(`health-check:  http://localhost:${PORT}/health`)
  })

  const shutdown = async () => {
    await cleanup.dispose()
    httpServer.close(() => process.exit(0))
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

start().catch((e) => {
  console.error(e)
  process.exit(1)
})
