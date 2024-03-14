import express from 'express'

import redis from '../lib/redis.js'

const auth = express.Router()

// const anonRoutes = ['/status', '/api/auth/access-token']

auth.post('/request-token', async (req, res, next) => {
  const token = crypto.randomUUID()
  const key = `token-${req.client._id}`
  await redis.set(key, token)

  res.status(200).json({ token })
})

export default auth
