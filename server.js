const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const jwtRoutes = require('./spotifeed/routes/jwt-routes')
const spotifyApiRoutes = require('./spotifeed/routes/spotify-api-routes')
const spotifyAuthRoutes = require('./spotifeed/routes/spotify-auth-routes')
const secureRoute = require('./spotifeed/routes/secure-routes')
const cors = require('cors')
require('./spotifeed/jwt-auth/jwt-auth')

// connect to atlas database
mongoose.connect('mongodb+srv://anthonyguariglia:tony@cluster0.3vskp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
	}
)
mongoose.set('useCreateIndex', true)
mongoose.connection.on('error', (error) => console.log(error))
mongoose.Promise = global.Promise

const app = express()

// middleware
app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*')
	next()
})
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(jwtRoutes)
app.use(spotifyApiRoutes)
app.use(spotifyAuthRoutes)

// authenticate any requests sent to the '/user' endpoint
app.use('/user', passport.authenticate('jwt', { session: false }), secureRoute)

// Handle errors.
app.use(function (err, req, res, next) {
	res.status(err.status || 500)
	res.json({ error: err })
})

// start server on either heroku or localhost port
app.listen(process.env.PORT || 3000, () => {
	console.log('Server started.')
})
