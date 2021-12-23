const express = require('express')
const mongoose = require('mongoose')
const passport = require('passport')
const bodyParser = require('body-parser')
const jwtRoutes = require('./routes/jwt-routes')
const spotifyApiRoutes = require('./routes/spotify-api-routes')
const spotifyAuthRoutes = require('./routes/spotify-auth-routes')
const secureRoute = require('./routes/secure-routes')
const cors = require('cors')
require('./jwt-auth/jwt-auth')

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




const clientDevPort = 7165

app.use(
	cors({
		origin: process.env.CLIENT_ORIGIN || `http://localhost:${clientDevPort}`,
	})
)
app.use(bodyParser.urlencoded({ extended: false }))
app.use(jwtRoutes)
app.use(spotifyApiRoutes)
app.use(spotifyAuthRoutes)
// app.use(cors(corsOptions))

// Plug in the JWT strategy as a middleware so only verified users can access this route.


app.use('/user', passport.authenticate('jwt', { session: false }), secureRoute)

// Handle errors.
app.use(function (err, req, res, next) {
	res.status(err.status || 500)
	res.json({ error: err })
})

app.listen(3000, () => {
	console.log('Server started.')
})
