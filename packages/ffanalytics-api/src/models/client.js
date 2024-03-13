import mongoose from 'mongoose'

const Client = mongoose.model('Client', {
  name: String,
  clientId: String,
  publicKey: String,
})

export default Client
