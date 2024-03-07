import express from 'express'

const events = express.Router()

events.use((req, res, next) => {
  if (req.method !== 'POST') {
    return res.status(405).text('method not allowed')
  }

  const clientId = req.headers['ffanalitycs-client-id']
  // check presence,
  // format,
  // existence in DB + valid subscription
  if (false) {
    return res.status(401).text('bad or missing client id')
  }
  const token = req.headers['ffanalytics-token']
  // check validity
  if (false) {
    return res.status(401).text('bad or missing token')
  }

  req.clientId = clientId
  req.token = token
  next()
})

events.post('/', (req, res) => {
  const { clientId } = req
  const { name, payload } = req.body.event
  console.log(req.body)
  const event = { name, date: new Date(), payload }

  return res.json({ event, clientId })
})

export default events
