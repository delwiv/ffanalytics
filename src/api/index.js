import express from 'express'
import events from './events/index.js'

const api = express.Router()

api.use('/events', events)

api.get('/status', (req, res) => {
  return res.json({ api: 'up', redis: 'down', mongo: 'down' })
})

export default api
