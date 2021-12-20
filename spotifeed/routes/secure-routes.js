const express = require('express')
const router = express.Router()
const store = require('../../store')

router.get('/profile', (req, res, next) => {
	res.json({
		message: 'You made it to the secure route',
		user: req.user,
		token: req.query.secret_token,
	})
})

router.delete('/logout', (req, res, next) => {
	console.log(req.user)
	req.logout(req.user, { session: false }, async (error) => {
		if (error) return next(error)
	})
	req.query.secret_token = null
	console.log(req.user)
	res.json({
		message: 'signed out successfully',
		user: req.user,
		token: req.query.secret_token,
	})
})

module.exports = router
