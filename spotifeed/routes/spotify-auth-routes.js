const express = require('express')
const request = require('request')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const querystring = require('querystring')
const store = require('../../store')
require('dotenv').config()
const { Http, HttpRequestOptions, Method } = require('node-https')
const apiURL = require('../../config')
const axios = require('axios')

const http = new Http()

const router = express.Router()

// client specific information - NEEDS UPDATING
const redirect_uri = apiURL.apiUrl + '/callback'
const client_id = process.env.CLIENT_ID //
const client_secret = process.env.CLIENT_SECRET //
const stateKey = 'spotify_auth_state'
let user_access_token = ''

// user addition
const User = require('../model/user-model')

const generateRandomString = function (length) {
	let text = ''
	const possible =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

	for (var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length))
	}
	return text
}

router.use(express.static(__dirname + '/../../public'))
	.use(cors())
	.use(cookieParser())

router.get('/loginSpotify', async function (req, res) {
  try {
    // res.setHeader("Access-Control-Allow-Origin", "http://localhost:7165");
    // res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    // res.status(201)
    store.state = null
    store.access_token = null
    console.log('in loginSpotify')
    var state = generateRandomString(16)
    res.cookie(stateKey, state)
    store.state = state
    var scope = 'user-follow-read'
    console.log('redirecting..')
    const axiosInstance = axios.create({
			baseURL: 'https://accounts.spotify.com',
			headers: {
				method: 'GET, OPTIONS',
				'Access-Control-Allow-Origin': 'http://localhost:7165',
			},
		})

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
		console.log('redirecting...')
		const redirectUrl = 'https://accounts.spotify.com' + response.request.path
		return res.json({ redirectUrl })

  } catch(error) {
    console.log(error)
  }
})

router.get('/callback', function (req, res) {
	console.log('in callback')
	// your application requests refresh and access tokens
	// after checking the state parameter
	var code = req.query.code || null
	var state = req.query.state || null
	var storedState = store.state//req.cookies ? req.cookies[stateKey] : null

  console.log(state, storedState)
	if (state === null) {// || state !== storedState) {
		res.redirect(
			'/#' +
				querystring.stringify({
					error: 'state_mismatch',
				})
		)
	} else {
		res.clearCookie(stateKey)
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

		request.post(authOptions, function (error, response, body) {
			if (!error && response.statusCode === 200) {
				var access_token = body.access_token,
					refresh_token = body.refresh_token

				store.access_token = body.access_token
        store.refresh_token = body.refresh_token

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
        res.send("<script>window.close();</script > ")
        return (0)
				// we can also pass the token to the browser to make requests from there
				res.status(204)
			} else {
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
