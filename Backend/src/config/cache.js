const Redis = require("ioredis")

let redis = null

if (process.env.REDIS_HOST) {
    redis = new Redis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        retryStrategy: (times) => {
            if (times > 5) {
                console.warn("Redis: Max connection retries reached, running with fallback.");
                return null; // Stop retrying
            }
            return Math.min(times * 200, 2000);
        },
        maxRetriesPerRequest: 2,
        enableOfflineQueue: false
    })

    redis.on("connect", () => {
        console.log("Server is connected to Redis")
    })

    redis.on("error", (err) => {
        console.warn("Redis connection warning:", err.message)
    })
} else {
    console.log("Redis not configured, running without external cache");
    // Mock minimal redis interface
    redis = {
        get: async () => null,
        set: async () => 'OK',
        del: async () => 1,
        status: 'disabled'
    }
}

module.exports = redis