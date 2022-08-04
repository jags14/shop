const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const productRouter = require('./api/routes/products');
const orderRouter = require('./api/routes/orders');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});

mongoose.connect('mongodb+srv://node-shop:' + process.env.MONGO_ATLAS_PW + '@cluster0.gtko4.mongodb.net/?retryWrites=true&w=majority', {

    useNewUrlParser: true,
    useUnifiedTopology: true
    
});

// use morgan to log incoming requests
app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if(req.method === 'OPTION'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE');
        return res.status(200).json({});
    }

    next();
});

// Handle Incoming requests
app.use('/products', productRouter);
app.use('/orders', orderRouter);

// Handling errors
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })

});

module.exports = app;