const mongoose = require('mongoose')

const albumSchema = new mongoose.Schema({
	artists: [
		{
			name: {
				type: String,
				required: true,
			},
			id: {
				type: String,
				required: true,
			},
		},
	],
	id: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	release_date: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
},
{
  toJSON: { virtuals: true }
})

module.exports = mongoose.model('Album', albumSchema)
