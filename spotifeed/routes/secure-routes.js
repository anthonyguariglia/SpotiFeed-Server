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
router.post('/playlists/:name', (req, res, next) =>  {
	try {
		const name = req.params.name
		console.log(name, store.artists)
		Playlist.create({
			name: name,
			albums: store.albums,
			owner: store.id
		})
		.then(() => {
			console.log('successfully created playlist')
			
		})
		res.status(201).json(req.params.name)
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

// Add album to playlist
router.post('/playlists/:name/albums/:id', (req, res, next) => {
	try {
		const paramId = req.params.id
		const paramName = req.params.name
		let albumId
		let albumIndex
		let albums
		Playlist.find({ name: req.params.name })
			.then((playlist) => {
				albums = playlist[0].albums
				console.log(albums)
			})
			.then(() => {
				Album.find({ id: paramId }).then((album) => {
					albumId = album[0]._id
					albumIndex = albums.indexOf(albumId)
					if (albumIndex > -1) {
						res.status(409).json('album is already in playlist')
					} else {
						Album.find({ id: paramId })
							.then((album) => {
								albumId = album[0]._id
							})
							.then(() => {
								store.albums.push(albumId)
								Playlist.find({ name: paramName })
									.then((playlist) => {
										playlist[0].albums.push(albumId)
										return playlist[0].save()
									})
									.then((playlist) => {
										console.log(playlist)
										res.status(201).json('successfully added')
									})
							})
					}
				})
			})

	} catch (error) {
		next(error)
	}
})

// remove album from playlist
router.patch('/playlists/:name/albums/:id', async (req, res, next) => {
	try {
		let albumId
		let deletedIndex
		let albums 
		Playlist.find({ name: req.params.name })
			.then((playlist) => {
				albums = playlist[0].albums
				console.log(albums)
			})
			.then(() => {
				Album.find({ id: req.params.id })
					.then((album) => {
						albumId = album[0]._id
						deletedIndex = albums.indexOf(albumId)
					})
					.then(() => {
						console.log('index to be deleted: ', deletedIndex)
						Playlist.find({ name: req.params.name }).then((playlist) => {
							playlist[0].albums.splice(deletedIndex, 1)
							return playlist[0].save()
						})
					})
					.then((playlist) => {
						console.log(playlist)
					})
			})
			res.status(201).json()
	} catch (error) {
		next(error)
	}
})

// Display playlist data
router.get('/playlists/:name', (req, res, next) => {
	try {
		let playlistData
		Playlist.find({ name: req.params.name })
			.populate('albums')
			.then((playlist) => {
				console.log(playlist[0])
				playlistData = playlist[0]
			})
			.then(() => res.status(200).json(playlistData))
	} catch(error) {
		next(error)
	}
})

// Display all playlists
router.get('/playlists', (req, res, next) => {
	try{
		let playlistData
		Playlist.find({ owner: store.id})
			.populate('owner')
			.populate('artists')
			.then(playlists => {
				playlistData = playlists
			})
			.then(() => res.status(200).json(playlistData))
	} catch(error) {
		next(error)
	}
})

module.exports = router
