const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt')
const userModel = require('../modals/user.model');
const { render } = require('ejs');

const router = express.Router();

router.get('/test', (req, res) => {
    res.send("hello world, this is user test route");
});

router.get('/register', (req, res) => {
    res.render('register');
});

// Corrected POST /register route with proper validation middleware
router.post(
    '/register',
    [
        body('email').trim().isEmail().isLength({ min: 8 }).withMessage('Invalid email format'),
        body('password').trim().isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
        body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        console.log(req.body);


        const { name, email, password } = req.body;
        const hashPassword = await bcrypt.hash(password, 10)
        const newUser = await userModel.create({
            name: name,
            email: email,
            password: hashPassword,
        })
        res.send(newUser)

    }
);
router.post('/login', (req, res) => {
    body('email'.trim().isEmail().isLength({ min: 12 }));
    body('password'.trim().isLength({ min: 5 }));

    async(req,res)=>{
        const errors = validationResult(req)
    }
})
router.get('/login', (req, res) => res.render('login'));
module.exports = router;
