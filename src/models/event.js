import mongoose from 'mongoose'

const Event = mongoose.model('Event', {
  name: String,
  type: String,

  date: {
    type: Date,
    default: Date.now,
  },
  payload: {},
})

export default Event
