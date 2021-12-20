const User = require('../model/user-model')
const spotifyApiUrl = 'https://api.spotify.com/v1'

const getFollowedArtists = () => {
  return $.ajax({
    method: 'GET',
    url: spotifyApiUrl + '/me/following',
    data,
    headers: {
      Authorization: 'Bearer ' + User.spotifyToken
    }
  })
}

const getArtistAlbum = (id) => {
  return $.ajax({
		method: 'GET',
		url: spotifyApiUrl + `/artists/${id}/albums`,
		data,
		headers: {
			Authorization: 'Bearer ' + User.spotifyToken,
		},
	})
}

module.exports = {
  getFollowedArtists
}