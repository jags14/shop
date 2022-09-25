const Product = require('../models/product');

exports.getProducts = (req, res, next) => {
    Product.find()
        .select('name price _id productImage')
        .exec()
        .then((data) => {
            
            if(data){
                const count = data.length;
                const response = data
                res.status(200).json({
                    count: count,
                    products: response.map(eachRes => {
                        return {
                            name: eachRes.name,
                            price: eachRes.price,
                            _id: eachRes._id,
                            productImage: eachRes.productImage,
                            request: {
                                type: 'GET',
                                url: 'http://localhost:3000/products/' + eachRes._id
                            }
                        }
                    })
                });
            } else {
                res.status(404).json({
                    message: "No documents found"
                });
            }
        })
        .catch((err) => {
            res.status(500).json({
                error: err
            });
        })
}

exports.createProduct = (req, res, next) => {
    console.log(req.file);
    const product = new Product({
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product.save().then((result) => {
        console.log(result);
        res.status(201).json({
            message: "Created a new Product",

            product: {
                name: result.name,
                price: result.price,
                _id: result._id,
                
                request: {
                    type: 'GET',
                    url: 'http://localhost:3000/products' + result._id
                }
            }
        })
    }).catch((err) => {
        console.log(err);
        res.status(501).json({
            error: err
        });
    });
};