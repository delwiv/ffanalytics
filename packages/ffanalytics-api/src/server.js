import express from 'express'
import morgan from 'morgan'

import { connectMongo } from './lib/mongo.js'
import './lib/redis.js'
import api from './api/api.js'
import { authMiddleware } from './middleware/auth.js'

const app = express()

app.use(express.json())
app.use(morgan('tiny'))

app.use(authMiddleware)

// app.use((req, res, next) => {
//   if (req.method === 'OPTIONS') {
//     return res.sendStatus(200)
//   }
//   console.log(req.method, req.url)
//   next()
// })

app.use('/api', api)

const startApp = async () => {
  console.log('starting app...')
  console.log('mongo connection...')
  await connectMongo()
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`)
  })
}

startApp()
