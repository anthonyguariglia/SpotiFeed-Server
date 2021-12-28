const { application } = require('express')
const express = require('express')
const axios = require('axios')
const router = express.Router()
const store = require('../../store')

const User = require('../model/user-model')
const Artist = require('../model/artist')
const Album = require('../model/album')
const RecentUploads = require('../model/recent_upload_list')

const followerUrl = 'https://api.spotify.com/v1/me/following?type=artist'


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

    // obtain data for artists followed by this user
		const response = await axiosInstance.get(
			'/me/following?type=artist&limit=50'
		)
    const artistData = response.data.artists.items
    console.log(artistData)
    // let artists = []
    let albumArray = []
    let artistArray = []

    await Promise.all(artistData.map(async (artistFollowed) => {
      // console.log(artistFollowed.name)
      let albums = []
      // obtain latest 2 artist albums from spotify api, albums only
      const albumData = await axiosInstance.get(
				`/artists/${artistFollowed.id}/albums?include_groups=album&limit=2`
			)
      // create an 'album' with only desirable parameters for each album returned by axios call
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
          const album = {
            artists: albumShown.artists,
            id: albumShown.id,
            name: albumShown.name,
            release_date: albumShown.release_date,
            type: albumShown.album_type,
            images: albumShown.images,
          }
          albumArray.push(album)
        } catch(error) {
          next(error)
        }
      })

      try {
        // create artist in mongoDB 
        Artist.create({
          name: artistFollowed.name,
          id: artistFollowed.id,
        }).then(artist => {
          if (artist) {
            artistArray.push(artist._id)
            // console.log(artistArray)
          }
        })
      } catch {
        next()
      }
      
    }))

    // code here will now execute with the `artist` object populated
    await Promise.all(artistData.map(async (artistFollowed) => {
			let singles = []
			// obtain latest artist singles from spotify api
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
          // console.log('made it this far')
          const single = {
            artists: singleShown.artists,
            id: singleShown.id,
            name: singleShown.name,
            release_date: singleShown.release_date,
            type: singleShown.album_type,
            images: singleShown.images,
          }
          albumArray.push(single)
        } catch(error) {
          console.log(error)
          next(error)
        }
			})
      

		}))

    let sortedAlbumsByDate = []
    let sortedAlbumsId = []

    sortedAlbumsByDate = albumArray.sort((a, b) => new Date(b.release_date) - new Date(a.release_date))
    
    await Promise.all(sortedAlbumsByDate.map(async (album) => {
      // console.log(album.id)

      await Album.find({ id: album.id }, async (err, id) => {
        // sortedAlbumsId.push(album._id)
        const albumObj = await id[0]
        try {
          if (albumObj) {
            if (albumObj._id !== null) {
							// console.log(albumObj._id)
							sortedAlbumsId.push(albumObj._id)
            }
          }
        } catch(error) {
          next(error)
        }

      })
    }))

    // console.log(sortedAlbumsId)

    RecentUploads.create({
      albums: sortedAlbumsId,
      owner: store.id
    })

    User.findById(store.id, async (err, user) => {
      try {
        
        if (user !== null) {
          // console.log(user, artistArray)
          user['artists'] = artistArray
          // console.log(user)
          return user.save()
        } else if (err) {
          console.log(err)
        } else {
          console.log(err, 'an error has occurred adding artists to user')
        }
      } catch {
        next()
      }
		})

    res.status(201).json(sortedAlbumsByDate)
		// process your data and send back to the user
	} catch {
    next()
		// handle if you got an error
	}
})

module.exports = router
