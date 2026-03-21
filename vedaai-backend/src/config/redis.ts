let _cached: any = null

export const getRedisConnection = () => {
  if (!_cached) {
    const redisUrl = new URL(process.env.REDIS_URL as string)
    _cached = {
      host: redisUrl.hostname,
      port: Number(redisUrl.port) || 6379,
      password: redisUrl.password,
      tls: redisUrl.protocol === "rediss:" ? {} : undefined,
      maxRetriesPerRequest: null,
    }
  }
  return _cached
}