const express = require('express');
const { default: mongoose } = require('mongoose');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const Order = require('../models/order');
const orderController = require('../controllers/orders');

router.get('/', checkAuth, orderController.getAllOrders);

router.post('/', checkAuth, orderController.createOrder);

router.get('/:orderId', checkAuth, orderController.getOrderById);

router.delete('/:orderId', checkAuth, orderController.deleteOrder);

module.exports = router;