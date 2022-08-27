const express = require('express');
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcryptjs');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

router.get('/', (req, res, next) => {
    User.find()
        .exec()
        .then(users => {
            if(users){
                const totalUsers = users.length;
                const response = users;
                res.status(200).json({
                    num_of_users: totalUsers,
                    user: response.map(eachUser => {
                        return {
                            email: eachUser.email,
                            _id: eachUser._id,
                            request: {
                                type: 'GET',
                                url: 'http://localhost:3000/users/' + eachUser._id
                            }

                        }
                    })
                })
            } else {
                res.status(404).json({
                    message: 'Users not found'
                })
            }
        })
        .catch(err => {
            return res.status(404).json({
                error: err
            })
        })

})

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
                    const token = jwt.sign({
                            email: user[0].email,
                            userId: user[0]._id
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: "1h"
                        }
                        );
                    res.status(200).json({
                        message: "User found",
                        user_token: token
                    })
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.delete('/:userId', (req, res, next) => {
    User.deleteOne({_id: req.params.userId})
        .exec()
        .then(result => {
            res.status(200).json({
                message: "User deleted"
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
})

module.exports = router;