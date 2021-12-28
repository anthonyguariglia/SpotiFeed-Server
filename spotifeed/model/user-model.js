'use strict'
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema;

const UserSchema = new Schema(
	{
		email: {
			type: String,
			required: true
		},
		password: {
			type: String,
			required: true,
		},
    token: {
      type: String
    },
    artists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist'
      }
    ]
	},
	{
		toJSON: { virtuals: true },
	}
)

UserSchema.pre('save', async function (req, res, next) {
	const user = this
  console.log(this, req)

  if (this.modifiedPaths().some((path) => path === 'password')) {
		this.password = await bcrypt.hash(this.password, 10)
	}
	// const hash = await bcrypt.hash(this.password, 10)

	// this.password = hash
	next()
})

UserSchema.methods.isValidPassword = async function (password) {
	const user = this
  // console.log(password, user.password)
	const compare = await bcrypt.compare(password, user.password)

	return compare
}

module.exports = mongoose.model('User', UserSchema)