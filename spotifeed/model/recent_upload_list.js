const mongoose = require('mongoose')
const album = require('./album')

const recentUploadSchema = new mongoose.Schema({
  albums: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album',
      required: true
    }
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true
  }

})

module.exports = mongoose.model('RecentUploads', recentUploadSchema)
