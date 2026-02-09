import pkg from "ioredis";
import {RedisPubSub} from "graphql-redis-subscriptions";

const {default: Redis} = pkg as any

const redisOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
}

export const pubsub = new RedisPubSub({
    publisher: new Redis(redisOptions),
    subscriber: new Redis(redisOptions),
})