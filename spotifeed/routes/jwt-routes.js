const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const router = express.Router()
const User = require('../model/user-model')
const store = require('../../store')
const axios = require('axios')
const $ = require('jquery')
const cors = require('cors')
const cookieParser = require('cookie-parser')
require('dotenv').config()

// add cors and cookie support
router
	.use(express.static(__dirname + '/../../public'))
	.use(cors())
	.use(cookieParser())

// on sign up
router.post('/signup',
  async (req, res, next) => {
    // check if  email exists already
    User.find({ email: req.body.email })
      .then((user) => {
        if (user[0]) {
          // if user exists, report that back to front end
          res.status(400).json('User already exists')
        } else if (!req.body.confirm_password || req.body.password !== req.body.confirm_password) {
					// check if passwords match
					res.status(400).json('Passwords do not match')
				} else {
          next()
        }
      })
    
    
	},
  // authenticate login info
	passport.authenticate('signup', { session: false }),
	async (req, res, next) => {
    try{ 
      console.log('request: ', req)
      // report status upon successful authentication
      res.json({
        message: 'Signup successful',
        user: req.user,
      })
    } catch {
      next()
    }
	}
)

// on log in
router.post('/login', async (req, res, next) => {
  // authenticate credentials
	passport.authenticate('login', async (err, user, info) => {
		try {
      // check if user exists
			if (err || !user) {
				const error = new Error('An error occurred.')

				return next(error)
			}

      // log user in and note their mongoose id and email
			req.login(user, { session: false }, async (error) => {
				if (error) return next(error)

        // assign a secret token to be used in authentication
				const body = { _id: user._id, email: user.email }
				const token = jwt.sign({ user: body }, 'TOP_SECRET')

        // store user id locally to authenticate requests on front end
				store.id = req.user._id
				
				return res.json({ token })
			})
		} catch {
			next()
		}
	})(req, res, next)
})
/*
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
*/
// Change Password
router.post('/change-password', (req, res, next) => {
		// check if passwords match and are present
  if (
    !req.body.confirm_new_password ||
    !req.body.new_password ||
    req.body.new_password !== req.body.confirm_new_password
  ) {

    res.status(400).json('passwords do not match')

  } else {
    // authenticate credentials once all information is present
    passport.authenticate('change-password', async (err, user, info) => {
      try {
        // check if a user can be found
        if (err || !user) {
          const error = new Error('An error occurred.')
          console.log(error)
          return next(error)
        }

        // once authenticated, assign user new password
        user.password = req.body.new_password
        res.json('Password Changed Successfully')

        // save user so that password can be hashed
        return user.save()
        
      } catch {
        next() 
      }
    })(req, res, next)
  }
})

module.exports = router
