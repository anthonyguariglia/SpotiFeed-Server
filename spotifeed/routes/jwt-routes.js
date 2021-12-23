const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const router = express.Router()
const User = require('../model/user-model')
const store = require('../../store')
const { apiUrl } = require('../../config')
const axios = require('axios')
const $ = require('jquery')
const cors = require('cors')

const errors = require('../../lib/custom_errors')



router
	.use(express.static(__dirname + '../../public'))
	.use(cors())

router.post('/signup',
  // function() {},
	passport.authenticate('signup', { session: false }),
	async (req, res, next) => {
    try{ 
      // console.log('made it here at least', req.user)
      // if (!req.user.confirm_password || req.user.password !== req.user.confirm_password) {
      //   console.log(req.user)
			// 	throw new BadParamsError()
			// }
      // User.create({
      //   email: req.user.email,
      //   password: req.user.password
      // })
      res.json({
        message: 'Signup successful',
        user: req.user,
      })
    } catch(error) {
      next(error)
    }
	}
)

router.post('/login', async (req, res, next) => {
	passport.authenticate('login', async (err, user, info) => {
		try {
      console.log(user)
			if (err || !user) {
				const error = new Error('An error occurred.')

				return next(error)
			}

			req.login(user, { session: false }, async (error) => {
				if (error) return next(error)

				const body = { _id: user._id, email: user.email }
				const token = jwt.sign({ user: body }, 'TOP_SECRET')

	      store.id = req.user._id

        // console.log(response)
				return res.json({ token })
			})
      
      // console.log(response)

		} catch (error) {
      console.log(error)
			return next(error)
		}
	})(req, res, next)
})

router.get('/users', (req, res, next) => {
	passport.authenticate('login', async (err, user, info) => {
		try {
			if (err || !user) {
				const error = new Error('An error occurred.')

				return next(error)
			}
			return res.json()
		} catch (error) {
			return next(error)
		}
	})(req, res, next)
})

module.exports = router
