const mongoose = require('mongoose')

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  albums: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album'
    }
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

module.exports = mongoose.model('Playlist', playlistSchema)
