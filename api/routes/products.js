const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product');
const multer = require('multer');
const checkAuth = require('../middlewares/check-auth');

const storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, "uploads/");
	},
	filename: function(req, file, cb) {
		console.log(file);
		cb(null, Date.now() + file.originalname);
	},
})

const fileFilter = function(req, file, cb) {
	/*
		cb(null, true) --> accept file
		cb(null, false) --> reject file
		cb(new Error('message'), false) --> reject with error
	*/

	if(file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
		cb(null, true);
	} else {
		cb(null, false);
	}
}

const upload = multer({ 
	storage: storage,
	limits: {
		fileSize: 1024*1024*5
	},
	fileFilter: fileFilter
});

router.get('/', (req, res, next) => {
	Product.find()
		.select('_id name price')
		.then(docs => {
			const response = {
				count: docs.length, 
				products: docs.map(doc => {
					return {
						_id: doc._id,
						name: doc.name,
						price: doc.price,
						productImage: doc.productImage,
						request: {
							type: "GET",
							url: "http://localhost:3000/products/" + doc._id
						}
					}
				})
			}
			res.status(200).json(response);
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({ error: err });
		})
})

router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {
	const product = new Product({
		_id: new mongoose.Types.ObjectId(),
		name: req.body.name,
		price: req.body.price,
		productImage: req.file.path
	});

	product.save()
		.then(result => {
			res.status(201).json({
				message: "Created product",
				createdProduct: {
					_id: result._id,
					name: result.name,
					price: result.price,
					productImage: req.file.path,
					request: {
						type: "GET",
						url: "http://localhost:3000/products/" + result._id
					}
				}
			})
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({ error: err });
		});
})

router.get('/:productId', (req, res, next) => {
	const id = req.params.productId;
	Product.findById(id)
		.select('_id name price')
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

router.patch('/:productId', checkAuth, (req, res, next) => {
	const id = req.params.productId;
	let updateOps = {};
	for(const ops of req.body) {
		updateOps[ops.propName] = ops.value;
	}
	
	Product.update({ _id: id }, {
		$set: updateOps
	})
		.then(result => {
			res.status(200).json({
				message: "Product updated",
				request: {
					type: "GET",
					url: "http://localhost:3000/products/" + id
				}
			});
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({ error: err });
		});
})

router.delete('/:productId', checkAuth, (req, res, next) => {
	const id = req.params.productId;
	Product.remove({ _id: id })
		.then(result => {
			res.status(200).json({
				message: "Product deleted"
			});
		})
		.catch(err => {
			console.log(err);
			res.status(500).json({ error: err });
		});
})

module.exports = router;