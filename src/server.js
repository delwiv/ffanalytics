import express from 'express'
import morgan from 'morgan'
import 'dotenv/config'

import { connect } from './lib/mongo.js'
import api from './api/index.js'

const app = express()

app.use(express.json())
app.use(morgan('tiny'))

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  console.log(req.method, req.url)
  next()
})

app.use('/api', api)

const startApp = async () => {
  await connect()
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`)
  })
}

startApp()
