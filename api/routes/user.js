const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

router.post('/signup', (req, res, next) => {
	User.find({ email: req.body.email })
		.then(users => {
			if(users.length > 0) {
				res.status(409).json({
					message: "User already exists"
				})
			} else {
				bcrypt.hash(req.body.password, 10, (err, hash) => {
					const user = new User({
						_id: new mongoose.Types.ObjectId(),
						email: req.body.email,
						password: hash
					});

					user.save()
						.then(result => {
							res.status(201).json({
								message: "User created"
							})
						})
						.catch(err => {
							console.log(err);
							res.status(500).json({ error: err });
						});
				});
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({ error: err });
		});
})

router.post('/login', (req, res, next) => {
	User.find({ email: req.body.email })
		.then(users => {
			if(users.length == 0) {
				return res.status(401).json({
					message: "Auth failed"
				});
			}

			bcrypt.compare(req.body.password, users[0].password, async (err, result) => {
				if(err) {
					return res.status(401).json({
						message: "Auth failed"
					});
				}

				if(result) {
					const token = await jwt.sign({
						userId: users[0]._id,
						email: users[0].email
					}, 
					process.env.JWT_KEY, 
					{
						expiresIn: '1h'
					});
					return res.status(200).json({
						message: "Auth successful",
						token: token
					});
				} else {
					return res.status(401).json({
						message: "Auth failed"
					});
				}
			})
		})
})

router.delete('/:userId', (req, res, next) => {
	User.remove({ _id: req.params.userId })
		.then(result => {
			res.status(200).json({
				message: "User removed"
			});
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({ error: err });
		});
})

module.exports = router;