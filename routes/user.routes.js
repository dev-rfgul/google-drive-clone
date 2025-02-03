const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt')
const userModel = require('../modals/user.model');
const { render } = require('ejs');
const jwt = require('jsonwebtoken');

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
router.post('/login', [
    body('email').trim().isEmail().isLength({ min: 8 }),
    body('password').trim().isLength({ min: 5 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: errors.array(),
            message: "Invalid data",
        });
    }

    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: "No user registered with this email" });
        }

        console.log("Entered Password:", password);
        console.log("Stored Hashed Password:", user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password Match:", isMatch);

        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        console.log("JWT Secret:", process.env.JWT_SECRET);
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: "Server error: JWT_SECRET not defined" });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});



router.get('/login', (req, res) => res.render('login'));
module.exports = router;
