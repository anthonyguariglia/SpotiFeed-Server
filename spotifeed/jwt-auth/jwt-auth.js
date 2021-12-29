'use strict'

const passport = require('passport')
const localStrategy = require('passport-local').Strategy
const UserModel = require('../model/user-model')

// handle sign-ups
passport.use('signup',
  new localStrategy(
    {
      usernameField: 'email',
      passwordField: 'password'
    },
    async (email, password, done) => {
      try {
        const user = await UserModel.create({ email, password });
        return done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
)

// handle logins
passport.use(
	'login',
	new localStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
		},
		async (email, password, done) => {
			try {
				// find user
				const user = await UserModel.findOne({ email })

				if (!user) {
					return done(null, false, { message: 'User not found' })
				}
				// check password
				const validate = await user.isValidPassword(password)
				
				if (!validate) {
					return done(null, false, { message: 'Wrong Password' })
				}
				// return status
				return done(null, user, { message: 'Logged in Successfully' })
			} catch (error) {
				return done(error)
			}
		}
	)
)

// handle password changes
passport.use(
	'change-password',
	new localStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
		},
		async (email, password, done) => {
			try {
				// find user
				const user = await UserModel.findOne({ email })

				if (!user) {
					return done(null, false, { message: 'User not found' })
				}
				// check password
				const validate = await user.isValidPassword(password)
				
				if (!validate) {
					return done(null, false, { message: 'Wrong Password' })
				}

				return done(null, user, { message: 'Logged in Successfully' })
			} catch (error) {
				return done(error)
			}
		}
	)
)


// strategy constructor for authentication
const JWTstrategy = require('passport-jwt').Strategy
const ExtractJWT = require('passport-jwt').ExtractJwt

passport.use(
	new JWTstrategy(
		{
			secretOrKey: 'TOP_SECRET',
			jwtFromRequest: ExtractJWT.fromHeader('secret_token'),
		},
		async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
		}
	)
)
