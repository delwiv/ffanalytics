import Redis from 'ioredis'

const SEVEN_DAYS = 60 * 60 * 24 * 7 // 7 days
const TWO_DAYS = 60 * 60 * 24 * 2
const REDIS_HOST = process.env.REDIS_HOST

const redis = new Redis({
  host: REDIS_HOST,
})

console.log(`Connected to redis://${REDIS_HOST}`)

const set = async (key, data, expire = SEVEN_DAYS, title = 'data') => {
  await redis.hmset(
    key,
    title,
    typeof data === 'object' ? JSON.stringify(data) : data
  )
  await redis.expire(key, expire)
}

const rearm = (key, expire = TWO_DAYS) => redis.expire(key, expire)

const get = async (key, title = 'data') => {
  const data = await redis.hget(key, title)
  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}

const del = (key, title = 'data') => {
  return redis.hdel(key, title)
}

export default { set, del, rearm, get }
