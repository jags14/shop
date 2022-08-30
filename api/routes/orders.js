const express = require('express');
const { default: mongoose } = require('mongoose');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const Order = require('../models/order')

router.get('/', checkAuth, (req, res, next) => {
    
    Order.find()
        .populate('product', 'name')
        .exec()
        .then((data) => {
            // const totalOrders = data.length;
            // console.log("orders list: ", data);
            res.status(200).json({
                totalOrders: data.length,
                orders: data.map(order => {
                    return {
                        order: order,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/orders/' + order._id
                        }
                    }
                })

            });
        })
        .catch((err) => {
            res.status(404).json({error: err})
        })
});

router.post('/', checkAuth, (req, res, next) => {
    const order = new Order({
        _id: mongoose.Types.ObjectId(),
        product: req.body.productId,
        quantity: req.body.quantity
    });
    order.save()
        .then((data) => {
            console.log(data);
            res.status(201).json({
                message: "created a new order",
                createdOrder: data,
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/orders/' + data._id
                }
            });
        })
        .catch((err) => {
            res.status(500).json(err);
        })
});

router.get('/:orderId', checkAuth, (req, res, next) => {
    const id = req.params.orderId;
    Order.findById(id)
        .populate('product')
        .then((data) => {
            
            if(!data){
                res.status(404).json({message: "Order not found"});
            } else {
                console.log(data);
                res.status(200).json(data)
            }
        })
        .catch((err) => {
            res.status(500).json(err);
        })
});

router.delete('/:orderId', checkAuth, (req, res, next) => {
    res.status(201).json({
        message: 'Order deleted',
        Id: req.params.orderId
    });
});

module.exports = router;