const mongoose = require('mongoose')

const playlistSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	albums: [
		{
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
			images: [
				{
					height: {
						type: Number,
					},
					url: {
						type: String,
					},
					width: {
						type: String,
					},
				},
			],
		},
	],
	owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
})

module.exports = mongoose.model('Playlist', playlistSchema)
