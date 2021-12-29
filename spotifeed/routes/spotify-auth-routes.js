const express = require('express')
const request = require('request')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const querystring = require('querystring')
const store = require('../../store')
require('dotenv').config()
const axios = require('axios')

// start router
const router = express.Router()

// identify production vs. development API URLs
const production = 1;
const apiUrl = production ? 'https://pure-harbor-08948.herokuapp.com' : 'http://localhost:3000'

// client specific information
const redirect_uri = apiUrl + '/callback'
const client_id = process.env.CLIENT_ID //
const client_secret = process.env.CLIENT_SECRET //
const stateKey = 'spotify_auth_state'
let user_access_token = ''

// user model
const User = require('../model/user-model')

// function used to generate state key for spotify authentication
const generateRandomString = function (length) {
	let text = ''
	const possible =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length))
	}
	return text
}

// identify middleware for router to use
router.use(express.static(__dirname + '/../../public'))
	.use(cors())
	.use(cookieParser())

// handle spotify authentication
router.get('/loginSpotify', async function (req, res) {
  try {

    // clear stored variables
    store.state = null
    store.access_token = null

    // generate state key
    var state = generateRandomString(16)

    // cookie and store state key for later reference
    res.cookie(stateKey, state)
    store.state = state

    // identify parameters of user you wish to gain access to
    var scope = 'user-follow-read'

    // create axios instance of spotify base URL and CORS parameters
    const axiosInstance = axios.create({
			baseURL: 'https://accounts.spotify.com',
			headers: {
				method: 'GET, OPTIONS',
				'Access-Control-Allow-Origin': 'http://localhost:7165',
			},
		})

    // make a GET request to spotify API with all required credentials
		const response = await axiosInstance.get(
			'/authorize?' +
				querystring.stringify({
					response_type: 'code',
					client_id: client_id,
					scope: scope,
					redirect_uri: redirect_uri,
					state: state,
				})
		)
		// log the redirect URL that is passed back to give back to front end
		const redirectUrl = 'https://accounts.spotify.com' + response.request.path
		return res.json({ redirectUrl })

  } catch {
    next()
  }
})

// this route is used by the Spotify API. Upon initial authorization, it will redirect back here to verify client secret, state key, and authorization code. If all 3 are valid, it will then pass back an access_token and refresh_token
router.get('/callback', function (req, res) {
	// your application requests refresh and access tokens
	// after checking the state parameter
	var code = req.query.code || null
	var state = req.query.state || null

  // pull state from store.js. Cookie will not be available after redirect from front end
	var storedState = store.state

  // check that state received is valid and matches saved value
	if (state === null || state !== storedState) {
		res.redirect(
			'/#' +
				querystring.stringify({
					error: 'state_mismatch',
				})
		)
	} else {
    // once state is validated, clear it from cookies - deprecated as of 12/29
		res.clearCookie(stateKey)
    // authorize user based on code returned, client id, and client secret
		var authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			form: {
				code: code,
				redirect_uri: redirect_uri,
				grant_type: 'authorization_code',
			},
			headers: {
				Authorization:
					'Basic ' +
					new Buffer(client_id + ':' + client_secret).toString('base64'),
				'Access-Control-Allow-Origin': 'http://localhost:7165',
			},
			json: true,
		}

    // authorize user
		request.post(authOptions, function (error, response, body) {
			if (!error && response.statusCode === 200) {
				var access_token = body.access_token,
					refresh_token = body.refresh_token

        // store tokens once they are given
				store.access_token = body.access_token
        store.refresh_token = body.refresh_token

        // package options data for initial request
				var options = {
					url: 'https://api.spotify.com/v1/me',
					headers: {
						Authorization: 'Bearer ' + access_token,
					},
					json: true,
				}

				// use the access token to access the Spotify Web API
				request.get(options, function (error, response, body) {
					console.log(body)
				})

        // close popup window once all operations have completed
        res.send("<script>window.close();</script > ")
        return (0)
			} else {
        // report if token is invalid
				res.redirect(
					'/#' +
						querystring.stringify({
							error: 'invalid_token',
						})
				)
			}
		})
	}
})

module.exports = router
