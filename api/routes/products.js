const express = require('express');
const { default: mongoose } = require('mongoose');
const router = express.Router();
const Product = require('../models/product');
const checkAuth = require('../middleware/check-auth');
const multer = require('multer');
// const upload = multer({dest: 'uploads/'});

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        console.log(file);
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    } else {
        cb(null, false);
    }
}
const upload = multer({
    storage: storage, 
    limits: {
        fileSize: 1024*1024*10
    },
    fileFilter: fileFilter
});

router.get('/', (req, res, next) => {
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
});
router.post('/', checkAuth, upload.single('productImage') ,(req, res, next) => {
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
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('name price _id productImage')
        .exec()
        .then(data => {
            console.log(data);
            if(data){
                res.status(200).json({
                    message: "Getting product by the given Id",
                    product: data,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/products/' + data._id
                    }
                });
            } else{
                res.status(404).json({message: "No valid object found"});
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        })
});
router.patch('/:productId',checkAuth, (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Product.updateOne({_id: id}, {$set: updateOps})
        .exec()
        .then((doc) => {
            res.status(200).json(doc);
        })
        .catch((err) => {
            res.status(500).json({
                error: err
            })
        })
});

router.delete('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    Product.remove({_id: id})
        .then(()=>{
            res.status(200).json({message: "Document with given Id is deleted"})
        })
        .catch(err => console.log(err))
});

module.exports = router;