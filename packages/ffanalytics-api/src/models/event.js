import mongoose from 'mongoose'

const Event = mongoose.model('Event', {
  name: String,
  type: String,
  userAgent: String,
  date: {
    type: Date,
    default: Date.now,
  },
  payload: {},
  ip: String,
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
  },
})

export default Event
