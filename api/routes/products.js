const express = require('express');
const { default: mongoose } = require('mongoose');
const router = express.Router();
const Product = require('../models/product');
const productController = require('../controllers/products');
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

router.get('/', productController.getProducts);
router.post('/', checkAuth, upload.single('productImage') , productController.createProduct);

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