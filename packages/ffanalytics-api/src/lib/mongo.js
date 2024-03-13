import mongoose from 'mongoose'

export const connectMongo = async () => {
  const host = process.env.MONGODB_HOST
  const user = process.env.MONGODB_USER
  const password = process.env.MONGODB_PASSWORD
  const database = process.env.MONGODB_DATABASE

  console.log(`Connection to MongoDB on ${host}/${database}`)

  const connection = await mongoose.connect(
    `mongodb://${user}:${password}@${host}/${database}`
  )

  console.log(
    `Connected to MongoDB on ${host}/${database}, version: ${connection.version}`
  )
}
