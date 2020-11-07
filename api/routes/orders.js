const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order');
const Product = require('../models/product');

router.get('/', (req, res, next) => {
	Order.find()
		.select("-__v")
		.populate('product', 'name')
		.then(docs => {
			res.status(200).json({
				count: docs.length, 
				orders: docs.map(doc => {
					return {
						_id: doc._id,
						product: doc.product, 
						quantity: doc.quantity,
						request: {
							type: "GET",
							url: "http://localhost:3000/orders/" + doc._id
						}
					}
				})
			})
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({ error: err });
		});
})

router.post('/', (req, res, next) => {
	Product.findById(req.body.product)
		.then(product => {
			if(!product) {
				res.status(404).json({ message: "Product not found" })
			} else {
				const order = new Order({
					_id: new mongoose.Types.ObjectId(),
					product: req.body.product, 
					quantity: req.body.quantity
				})
				return order.save();
			}
		})
		.then(result => {
			res.status(201).json({
				message: "Order created",
				request: {
					type: "GET",
					url: "http://localhost:3000/orders/" + result._id
				}
			})
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({ error: err });
		});	
})

router.get('/:orderId', (req, res, next) => {
	const id = req.params.orderId;
	Order.findById(id)
		.select('-__v')
		.populate('product', '-__v')
		.then(doc => {
			if(doc) {
				res.status(200).json(doc);
			} else {
				res.status(404).json({ message: "No valid entry found for provided ID" })
			}
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({ error: err });
		});
})

router.delete('/:orderId', (req, res, next) => {
	const id = req.params.orderId;
	Order.remove({ _id: id })
		.then(result => {
			res.status(200).json({
				message: "Deleted the order with ID: " + id
			})
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({ error: err });
		});
})

module.exports = router;