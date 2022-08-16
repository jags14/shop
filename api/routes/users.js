const express = require('express');
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const router = express.Router();

const User = require('../models/user');

// sign up route
router.post('/signup', (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if(user.length >=1){
                res.status(409).json({
                    message: "This email id already exists"
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if(err){
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const newUser = new User({
                            _id: mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        newUser
                            .save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: "User created"
                                })
                            })
                            .catch(err => {
                                res.status(500).json({
                                    error: err
                                })
                            })
                    }
                })
            }
        })
});

// sign in route
router.post('/login', (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if(user.length < 1){
                res.status(401).json({
                    message: "Auth Failed"
                })
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if(err){
                    res.status(401).json({
                        message: "Auth Failed"
                    })  
                }
                if(result) {
                    res.status(200).json({
                        message: "User found",
                        user: user
                    })
                }
            })
        })
        .catch()
})

module.exports = router;