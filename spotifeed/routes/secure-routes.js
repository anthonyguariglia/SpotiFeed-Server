'use strict'
const express = require('express')
const router = express.Router()
const store = require('../../store')
const Playlist = require('../model/playlist')
const Artist = require('../model/artist')
const Album = require('../model/album')
const User = require('../model/user-model')

// create way to verify user token
router.get('/profile', (req, res, next) => {
	res.json({
		message: 'You made it to the secure route',
		user: req.user,
		token: req.query.secret_token,
	})
})

// log user out
router.delete('/logout', (req, res, next) => {
	// clear ID from storage, effectively logging them out of front end operations
	store.id = ''
	
	// report status back to user
	res.json({
		message: 'signed out successfully',
		user: req.user,
	})
})

// Create playlist
router.post('/playlists/:name', (req, res, next) =>  {
	try {
		// pull name from parameters
		const name = req.params.name
		
		// create playlist from model
		Playlist.create({
			name: name,
			owner: store.id
		})

		res.status(201).json(req.params.name)
	} catch {
		next()
	}
})

// Delete playlist
router.delete('/playlists/:name', (req, res, next) => {
	try {
		let name
		// find playlist
		Playlist.find({ name: req.params.name })
			.then((playlist) => {
				// playlist object will be first element in array
				if (playlist[0]) {
					// save the name of the playlist to predefined variable to send back to front end
					name = playlist[0].name
					// delete playlist
					playlist[0].deleteOne()
				} else {
					// if no such playlist exists, report 404
					res.status(404)
				}
				// report name of deleted playlist to front end
				res.json(`${name}`)
				}
			)
	} catch {
		next()
	}
})

// Add album to playlist by spotify ID
router.post('/playlists/:name/albums/:id', (req, res, next) => {
	try {
		// pull params, declare variables used in export operations
		const paramId = req.params.id
		const paramName = req.params.name
		let albumIds = []
		let albumIndex = -1
		let albums
		let albumName
		let albumInPlaylist
		// check that playlist exists
		Playlist.find({ name: req.params.name })
			.then((playlist) => {
				// if it exists, pull the spotify IDs of every album in it
				albums = playlist[0].albums
				albums.forEach(album => {
					albumIds.push(album.id)
				})
			})
			// once spotify IDs are obtained, find requested album
			.then(() => {
				Album.find({ id: paramId }).then((album) => {
					// check if album data exists
					if (album[0]) {
						// if it does, log its spotify ID (mongoose ID changes every time 'get-data' is run)
						const albumId = album[0].id
						// reverse-check spotify ID with all IDs in playlist
						albumIndex = albumIds.indexOf(albumId)
					}
					// if album check doesn't come back with 'not found', report that it exists
					if (albumIndex > -1) {
						res.status(409).json('album is already in playlist')
					} else {
						// if it doesn't exist, find its info from its spotify ID
						Album.find({ id: paramId })
							.then((album) => {
								// pull its data to store locally
								albumName = album[0].name
								albumInPlaylist = album[0]
							})
							.then(() => {
								// add album to store.js to build local, accessible version of playlist
								store.albums.push(albumInPlaylist)
								// look up playlist to add song
								Playlist.find({ name: paramName })
									.then((playlist) => {
										// push album to playlist in sequential style
										playlist[0].albums.push(albumInPlaylist)
										// save playlist
										return playlist[0].save()
									})
									.then(() => {
										res.status(201).json('successfully added')
									})
							})
					}
				})
			})

	} catch {
		next()
	}
})

// remove album from playlist
// For context, album name is used when removing albums from playlists because they are easy to document on the front end (in HTML IDs, they are already known), and can be looked up by name (which will not change once uploaded to Spotify). Mongoose IDs change upon reload, so tracks in playlist cannot be referenced afterwards
router.patch('/playlists/:name/albums/:albumName', async (req, res, next) => {
	try {
		// pull params, declare variables used in export operations
		let albumIds = []
		let albumName
		let deletedIndex
		let albums
		// find playlist requested
		Playlist.find({ name: req.params.name })
			.then((playlist) => {
				// check that it has any albums in it
				if (playlist[0]) {
					// pull the spotify IDs of all albums in playlist (mongoose IDs change on reload)
					albums = playlist[0].albums
					albums.forEach((album) => {
						albumIds.push(album.id)
					})
				}
			})
			.then(() => {
				// find requested album by album name
				Album.find({ name: req.params.albumName })
					.then((album) => {
						// if multiple albums have the same name, check all for requested spotify ID against existing playlist IDs
						if (album.length > 1) {
							album.forEach((track) => {
								if (albumIds.indexOf(track.id) > -1) {
									// if it exists, log the index of the array in which it lives
									deletedIndex = albumIds.indexOf(track.id)
								}
							})
						// perform same function for single track
						} else {
							const albumId = album[0].id
							deletedIndex = albumIds.indexOf(albumId)
						}
					})
					.then(() => {
						// if index > -1, track exists in playlist. If not, report it cannot be found
						if (deletedIndex === -1) {
							return console.log('Album is not in playlist')
						} else {
							// find playlist by name and remove the index of the requested track
							Playlist.find({ name: req.params.name }).then((playlist) => {
								playlist[0].albums.splice(deletedIndex, 1)
								// save playlist upon completion
								return playlist[0].save()
							})
						}
					})
			})
		// return ID of deleted resource in the same way the front-end stores it so it can be removed from HTML
		const id = `${req.params.name}-${req.params.albumName}`
		res.status(201).json(id)
	} catch {
		next()
	}
})

// Display playlist data
router.get('/playlists/:name', (req, res, next) => {
	try {
		let playlistData
		// find playlist by name
		Playlist.find({ name: req.params.name })
			// pull playlist data to report back to front end
			.then((playlist) => {
				playlistData = playlist[0]
			})
			.then(() => res.status(200).json(playlistData))
	} catch {
		next()
	}
})

// Display all playlists
router.get('/playlists', (req, res, next) => {
	try{
		let playlistData
		// find all playlists owned by current user
		Playlist.find({ owner: store.id })
			.populate('owner')
			.populate('albums')
			.then(playlists => {
				playlistData = playlists
			})
			.then(() => res.status(200).json(playlistData))
	} catch {
		next()
	}
})

// Return user's followed artists - largely unused, may be useful in longer-term features
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
	} catch {
		next()
	}
})

module.exports = router
