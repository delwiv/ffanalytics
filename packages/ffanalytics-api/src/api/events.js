import express from 'express'
import Event from '../models/event.js'

const events = express.Router()

events.post('/', async (req, res) => {
  try {
    const { client } = req
    const { events } = req.body

    const eventsToCreate = events.map((event) => ({
      ...event,
      client,
    }))

    const result = await Event.create(eventsToCreate)

    return res.json({ events: result, client: client._id })
  } catch (error) {
    return res.json({ error })
  }
})

export default events
