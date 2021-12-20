const mongoose = require('mongoose')

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  albums: [
    {
      type: mongoose.Schema.Types.ObjectId
    }
  ]
})

module.exports = mongoose.model('Playlist', playlistSchema)
