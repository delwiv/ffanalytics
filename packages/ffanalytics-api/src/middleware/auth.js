import Client from '../models/client.js'
import redis from '../lib/redis.js'

export const authMiddleware = async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next()
  }

  const clientId = req.headers['ffanalytics-client-id']
  if (!clientId) {
    return res.status(401).json({ error: 'bad or missing client id' })
  }

  const client = await Client.findOne({ clientId })

  if (!client) {
    return res.status(401).json({ error: 'bad or missing client id' })
  }

  req.client = client

  if (req.path === '/api/auth/request-token' && req.method === 'POST') {
    const ffaPublicKey = req.body?.ffaPublicKey
    if (!ffaPublicKey) {
      return res.status(400).json({ error: 'missing client public key' })
    }
    if (client.publicKey !== ffaPublicKey) {
      return res.status(401).json({ error: 'bad client public key' })
    }
    return next()
  }

  const auth = req.headers['ffanalytics-token']
  if (!auth) {
    return res.status(401).json({ error: 'bad or missing token' })
  }
  const token = auth.replace('Bearer ', '')
  const redisToken = await redis.get(`token-${client._id}`)
  // check validity
  if (token !== redisToken) {
    return res.status(401).json({ error: 'bad or missing token' })
  }

  // req.clientId = clientId
  req.token = token
  next()
}
