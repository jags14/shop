const Order = require('../models/order');

const getAllOrders = (req, res, next) => {
    
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
};


module.exports = getAllOrders;