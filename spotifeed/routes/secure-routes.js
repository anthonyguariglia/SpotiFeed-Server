const express = require('express')
const router = express.Router()
const store = require('../../store')
const Playlist = require('../model/playlist')
const Artist = require('../model/artist')
const Album = require('../model/album')


const URL = require('../../config.js')
router.get('/profile', (req, res, next) => {
	res.json({
		message: 'You made it to the secure route',
		user: req.user,
		token: req.query.secret_token,
	})
})

router.delete('/logout', (req, res, next) => {
	console.log(req.user)
	req.logout(req.user, { session: false }, async (error) => {
		if (error) return next(error)
	})
	req.query.secret_token = null
	console.log(req.user)
	res.json({
		message: 'signed out successfully',
		user: req.user,
		token: req.query.secret_token,
	})
})

// Create playlist
router.post('/playlists', (req, res, next) =>  {
	try {
		Playlist.create({
			name: req.body.name,
			artists: store.artists,
		})
		.then(playlist => {
			res.status(201).json(playlist)
		})
		.catch(next())
	} catch(error) {
		next(error)
	}
})

// Delete playlist
router.delete('/playlists/:name', (req, res, next) => {
	try {
		Playlist.find({ name: req.params.name })
			.then((playlist) => {
				playlist.deleteOne()
			})
			.then(res.status(204))
			.catch(next())
	} catch(error) {
		next(error)
	}
})

// add finding name, fix inner data
// Add album to playlist
router.post('/playlists/:name/albums/:id', (req, res, next) => {
	try {
		const albums = store.albums
		Album.find({ id: req.params.id })
			.then((album) => {
				const albumId = album._id
			})
			.then(
				Playlist.find({ name: req.body.name }).then((playlist) => {
					playlist[albums].push(albumId)
					return playlist.save()
				})
			)
			.then(res.status(201).json())
			.catch(next())
	} catch (error) {
		next(error)
	}
})

// remove album from playlist
router.patch('/playlists/:name/albums/:id', (req, res, next) => {
	try {
		const albums = store.albums
		Album.find({ id: req.params.id })
			.then((album) => {
				const albumId = album._id
				const deletedIndex = albums.indexOf(albumId)
			})
			.then(
				Playlist.find({ name: req.body.name })
					.then((playlist) => {
						playlist[albums].splice(deletedIndex, 1)
						return playlist.save()
					})
			)
			.then(res.status(201).json())
			.catch(next())
	} catch (error) {
		next(error)
	}
})

// Display playlist data
router.get('/playlists/:name', (req, res, next) => {
	try {
		Playlist.find({ name: req.params.name })
			.populate('albums')
			.then((playlist) => {
				res.status(200).json(playlist)
			})
			.catch(next())
	} catch(error) {
		next(error)
	}
})

module.exports = router
