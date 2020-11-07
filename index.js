const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');

const port = process.env.PORT || 3000;

// Routes
const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/user');

// DB Connection
mongoose.connect('mongodb://127.0.0.1:27017/node-rest-api', { useNewUrlParser: true, useUnifiedTopology: true })

// Middlewares
app.use(morgan('dev')); 	// Logger
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Handling CORS
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	if(req.method === "OPTIONS") {
		res.headers("Acess-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE");
		res.status(200).json({});
	}
	next();
})

// Forwarding requests
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/user', userRoutes);

// Didn't match any route
app.use((req, res, next) => {
	const error = new Error('Not found');
	error.status = 404;
	next(error);
})

// Handles all errors
app.use((error, req, res, next) => {
	res.status(error.status || 500);
	res.json({
		error: {
			message: error.message
		}
	})
})


app.listen(port, () => console.log(`Server running on port ${port}`));