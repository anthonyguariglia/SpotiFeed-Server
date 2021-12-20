router.patch('/change-password', requireToken, (req, res, next) => {
	// declare user to access in the promise chain
	let user
	// find user by their id
	User.findById(req.user.id)
		// if we find a record save to our user variable
		.then((record) => {
			user = record
			// compare old password and stored password
			return bcrypt.compare(req.body.passwords.old, user.hashedPassword)
		})
		.then((correctPassword) => {
			// if the password is incorrect or there is no new password
			if (!correctPassword || !req.body.passwords.new) {
				throw new Error('A required parameter was omitted or invalid')
			}
			// if password is correct then encrypt new password
			return bcrypt.hash(req.body.passwords.new, 10)
		})
		.then((hash) => {
			// add new has as hashed password for user
			user.hashedPassword = hash
			// save user
			return user.save()
		})
		// respond with 204
		.then(() => res.sendStatus(204))
		.catch(next)
})
