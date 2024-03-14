import mongoose from 'mongoose'

const Event = new mongoose.Schema(
  {
    name: String,
    type: String,
    userAgent: String,
    date: {
      type: Date,
      default: Date.now,
    },
    payload: {},
    ip: String,
    url: String,
    pathname: String,
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
    },
  },
  {
    strict: false,
  }
)

export default mongoose.model('Event', Event)
