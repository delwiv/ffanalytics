import express from 'express'
import Event from '../models/event.js'

const events = express.Router()

events.post('/', async (req, res) => {
  try {
    const { client } = req
    const { events } = req.body

    const eventsToCreate = events.map((event) => {
      return {
        ...event,
        url: event.url,
        client,
      }
    })

    await Event.create(eventsToCreate)

    return res.status(200).json({ status: 'ok' })
  } catch (error) {
    return res.json({ error })
  }
})

export default events
