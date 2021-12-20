const mongoose = require('mongoose')

const artistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  },
  albums: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album'
    }
  ]
})

module.exports = mongoose.model('Artist', artistSchema)
