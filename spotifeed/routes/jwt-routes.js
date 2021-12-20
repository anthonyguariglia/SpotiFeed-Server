const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const router = express.Router()
const User = require('../model/user-model')
const store = require('../../store')

router.post('/signup',
	passport.authenticate('signup', { session: false }),
	async (req, res, next) => {
    User.create({
      email: req.user.email,
      password: req.user.password
    })
		res.json({
			message: 'Signup successful',
			user: req.user,
		})
	}
)

router.post('/login', async (req, res, next) => {
	passport.authenticate('login', async (err, user, info) => {
		try {
			if (err || !user) {
				const error = new Error('An error occurred.')

				return next(error)
			}

			req.login(user, { session: false }, async (error) => {
				if (error) return next(error)

				const body = { _id: user._id, email: user.email }
				const token = jwt.sign({ user: body }, 'TOP_SECRET')

	      store.id = req.user._id

				return res.json({ token })
			})
		} catch (error) {
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
