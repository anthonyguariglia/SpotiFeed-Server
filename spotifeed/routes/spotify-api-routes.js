const { application } = require('express')
const express = require('express')
const axios = require('axios')
const router = express.Router()
const store = require('../../store')

const User = require('../model/user-model')
const Artist = require('../model/artist')
const Album = require('../model/album')
const RecentUploads = require('../model/recent_upload_list')

// process a 'get latest tracks' request
router.get('/get-data', async (req, res, next) => {
  
	try {

    // remove existing album and artist data
    Artist.find()
      .then(artists => {
        artists.forEach(artist => {
          artist.remove()})
        })
    Album.find()
      .then(albums => {
        albums.forEach(album => {
          album.remove()})
        })
    RecentUploads.find()
      .then(uploads => {
        uploads.forEach(upload => {
          upload.remove()
        })
      })

    // create request instance in axios for later calls to spotify
    const axiosInstance = axios.create({
			baseURL: 'https://api.spotify.com/v1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + store.access_token,
				'Access-Control-Allow-Methods': 'GET, OPTIONS',
				'Access-Control-Allow-Origin': 'http://localhost:7165',
			},
		})

    // obtain data for artists followed by this user, up to 50 artists followed (most allowed by this type of call) - in the future, I can chain these calls by adding a start=50 parameter. For now 50 artists followed is sufficient for proof of concept
		const response = await axiosInstance.get(
			'/me/following?type=artist&limit=50'
		)

    // log the array of all artist data into a variable
    const artistData = response.data.artists.items
    
    let albumArray = []
    let artistArray = []

    // Essentially a forEach() method on artistData. This structure is used because code after it will not execute until it all completes. this is very important because these next operations need to be performed sequentially
    await Promise.all(artistData.map(async (artistFollowed) => {
      
      // obtain latest 2 artist albums from spotify api, albums only
      const albumData = await axiosInstance.get(
				`/artists/${artistFollowed.id}/albums?include_groups=album&limit=2`
			)

      // create an 'album' with only the desirable parameters for each album returned by axios call
      albumData.data.items.forEach(async (albumShown) => {

        try {
          // create mongodb album with latest artist data
          Album.create({
            artists: albumShown.artists,
            id: albumShown.id,
            name: albumShown.name,
            release_date: albumShown.release_date,
            type: albumShown.album_type,
            images: albumShown.images,
          })
          // also create a local album that will be used for playlist storage
          const album = {
            artists: albumShown.artists,
            id: albumShown.id,
            name: albumShown.name,
            release_date: albumShown.release_date,
            type: albumShown.album_type,
            images: albumShown.images,
          }
          // push each album to an array
          albumArray.push(album)
        } catch {
          next()
        }
      })

      try {
        // create an artist in database
        Artist.create({
          name: artistFollowed.name,
          id: artistFollowed.id,
        }).then(artist => {
          if (artist) {
            // push this artist to local storage
            artistArray.push(artist._id)
          }
        })
      } catch {
        next()
      }
      
    }))

    // code here will now execute with the `artist` object populated
    await Promise.all(artistData.map(async (artistFollowed) => {
			
			// obtain latest 3 artist singles from spotify api
			const singleData = await axiosInstance.get(
				`/artists/${artistFollowed.id}/albums?include_groups=single&limit=3`
			)

			// create an 'album' with only desirable parameters for each single returned by axios call
      singleData.data.items.forEach((singleShown) => {
        let artistSingles = []
        try {
          // create mongodb single with latest artist data
          Album.create({
            artists: singleShown.artists,
            id: singleShown.id,
            name: singleShown.name,
            release_date: singleShown.release_date,
            type: singleShown.album_type,
            images: singleShown.images,
          })
          // also create local version to be used by playlists
          const single = {
            artists: singleShown.artists,
            id: singleShown.id,
            name: singleShown.name,
            release_date: singleShown.release_date,
            type: singleShown.album_type,
            images: singleShown.images,
          }
          albumArray.push(single)
        } catch {
          next()
        }
			})
      

		}))

    let sortedAlbumsByDate = []
    let sortedAlbumsId = []

    // sort albums received by date
    sortedAlbumsByDate = albumArray.sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
    
    // for each album of the sorted albums array, find and push their mongoose IDs
    await Promise.all(sortedAlbumsByDate.map(async (album) => {

      // find each album by their Spotify ID
      await Album.find({ id: album.id }, async (err, id) => {
        
        // album will be returned as a 1-element array
        const albumObj = await id[0]
        try {
          // if the album exists and has a mongoose ID, push that to new sorted albums array of only mongoose IDs
          if (albumObj) {
            if (albumObj._id !== null) {
							sortedAlbumsId.push(albumObj._id)
            }
          }
        } catch {
          next()
        }

      })
    }))

    // create database model that stores all recent albums in descending chronological order
    RecentUploads.create({
      albums: sortedAlbumsId,
      owner: store.id
    })

    // find the current user and push all of their artists to their database model - unused feature at this point
    User.findById(store.id, async (err, user) => {
      try {
        
        if (user !== null) {    
          user['artists'] = artistArray
          return user.save()
        } 
      } catch {
        next()
      }
		})

    // send back the full album data of the most recent albums for use by the front end
    res.status(201).json(sortedAlbumsByDate)
	} catch {
    next()
	}
})

module.exports = router
