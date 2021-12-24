'use strict'
const express = require('express')
const router = express.Router()
const store = require('../../store')
const Playlist = require('../model/playlist')
const Artist = require('../model/artist')
const Album = require('../model/album')
const User = require('../model/user-model')


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
	console.log(store.id)
	store.id = ''
	// req.query.secret_token = null
	console.log(req.user)
	res.json({
		message: 'signed out successfully',
		user: req.user,
		id: store.id,
		// token: req.query.secret_token,
	})
})

// Create playlist
router.post('/playlists/:name', (req, res, next) =>  {
	try {
		const name = req.params.name
		console.log(name, store.artists)
		Playlist.create({
			name: name,
			// albums: store.albums,
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
		// console.log(req.params.name)
		let name
		Playlist.find({ name: req.params.name })
			.then((playlist) => {
				console.log(playlist)
				if (playlist[0]) {
					name = playlist[0].name
					playlist[0].deleteOne()
				} else {
					res.status(404)
				}
				res.json(`${name}`)
				}
			)
	} catch(error) {
		console.log(error)
		next()
	}
})

// Add album to playlist
router.post('/playlists/:name/albums/:id', (req, res, next) => {
	try {
		const paramId = req.params.id
		const paramName = req.params.name
		let albumIds = []
		let albumIndex = -1
		let albums
		let albumName
		let albumInPlaylist
		Playlist.find({ name: req.params.name })
			.then((playlist) => {
				// console.log(playlist)
				albums = playlist[0].albums
				albums.forEach(album => {
					albumIds.push(album.id)
				})
				console.log(albumIds)
			})
			.then(() => {
				Album.find({ id: paramId }).then((album) => {
					// console.log(album)
					if (album[0]) {
						// console.log(album[0])
						const albumId = album[0].id
						albumIndex = albumIds.indexOf(albumId)
					}
					// console.log(albums, albumName)
					console.log(albumIndex)
					if (albumIndex > -1) {
						res.status(409).json('album is already in playlist')
					} else {
						// console.log(albumName, paramId)
						Album.find({ id: paramId })
							.then((album) => {
								// console.log(album)
								albumName = album[0].name
								albumInPlaylist = album[0]
							})
							.then(() => {
								store.albums.push(albumInPlaylist)
								Playlist.find({ name: paramName })
									.then((playlist) => {
										// console.log(albumInPlaylist)
										playlist[0].albums.push(albumInPlaylist)
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
router.patch('/playlists/:name/albums/:albumName', async (req, res, next) => {
	try {
		let albumIds = []
		let albumName
		let deletedIndex
		let albums 
		Playlist.find({ name: req.params.name })
			.then((playlist) => {
				if (playlist[0]) {
					albums = playlist[0].albums
					albums.forEach(album => {
						albumIds.push(album.id)
					})
					console.log(albumIds)
				}
			})
			.then(() => {
				Album.find({ name: req.params.albumName })
					.then((album) => {
						const albumId = album[0].id
						deletedIndex = albumIds.indexOf(albumId)
					})
					.then(() => {
						console.log(deletedIndex)
						if (deletedIndex === -1) {
							return console.log('album is not in playlist')
						} else {
						Playlist.find({ name: req.params.name }).then((playlist) => {
							playlist[0].albums.splice(deletedIndex, 1)
							return playlist[0].save()
						})
					}})
					.then((playlist) => {
						console.log(playlist)
					})
			})
			res.status(201).json()
	} catch (error) {
		return error
	}
})

// Display playlist data
router.get('/playlists/:name', (req, res, next) => {
	try {
		let playlistData
		Playlist.find({ name: req.params.name })
			// .populate('albums')
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
		Playlist.find({ owner: store.id })
			.populate('owner')
			.populate('albums')
			.then(playlists => {
				playlistData = playlists
			})
			.then(() => res.status(200).json(playlistData))
	} catch(error) {
		next(error)
	}
})

// Return user's followed artists
router.get('/artists', function (req, res, next) {
	try {
		console.log(req.user.email)
		const email = req.user.email
		 let artistData = []
		 User.find({ email: email })
				.populate('artists')
				.then((user) => {
					user[0].artists.forEach((artist) => {
						// console.log(artist.name)
						artistData.push(artist.name)
					})
				})
				.then(() => res.status(200).json(artistData))
	} catch(error) {
		next(error)
	}
})

module.exports = router
