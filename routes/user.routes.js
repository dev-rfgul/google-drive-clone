// const express = require('express');
// const { body, validationResult } = require('express-validator');
// const bcrypt = require('bcrypt')
// const userModel = require('../modals/user.model');
// const { render } = require('ejs');
// const jwt = require('jsonwebtoken');

// const router = express.Router();

// router.get('/test', (req, res) => {
//     res.send("hello world, this is user test route");
// });

// router.get('/register', (req, res) => {
//     res.render('register');
// });

// // Corrected POST /register route with proper validation middleware
// router.post(
//     '/register',
//     [
//         body('email').trim().normalizeEmail().isEmail().withMessage('Invalid email format'),
//         body('password').trim().isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
//         body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
//     ],
//     async (req, res) => {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({ errors: errors.array() });
//         }

//         try {
//             const { name, email, password } = req.body;

//             // Check if user already exists
//             const existingUser = await userModel.findOne({ email });
//             if (existingUser) {
//                 return res.status(400).json({ message: 'Email already in use' });
//             }

//             // Hash password
//             const hashPassword = await bcrypt.hash(password, 10);

//             // Create new user
//             const newUser = await userModel.create({
//                 name,
//                 email,
//                 password: hashPassword,
//             });

//             res.status(201).json({
//                 message: 'User registered successfully',
//                 user: { id: newUser._id, name: newUser.name, email: newUser.email },
//             });
//         } catch (error) {
//             console.error('Error registering user:', error);
//             res.status(500).json({ message: 'Server error' });
//         }
//     }
// );


// router.get('/login', (req, res) => res.render('login'));


// router.post('/login', [
//     body('email').trim().normalizeEmail().isEmail().withMessage('Invalid email format'),
//     body('password').trim().isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
// ], async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({
//             error: errors.array(),
//             message: "Invalid data",
//         });
//     }

//     const { email, password } = req.body;

//     try {
//         const user = await userModel.findOne({ email });

//         if (!user) {
//             return res.status(400).json({ message: "No user registered with this email" });
//         }

//         console.log("Stored Hashed Password:", user.password);

//         const isMatch = await bcrypt.compare(password, user.password);

//         console.log("Password Match:", isMatch); // Debugging

//         if (!isMatch) {
//             return res.status(400).json({ message: "Incorrect password" });
//         }

//         if (!process.env.JWT_SECRET) {
//             console.error("JWT_SECRET is not defined in environment variables.");
//             return res.status(500).json({ message: "Server configuration error" });
//         }

//         const token = jwt.sign(
//             { userId: user._id, email: user.email },
//             process.env.JWT_SECRET,
//             { expiresIn: '1h' }
//         );

//         res.json({
//             message: "Login successful",
//             token,
//             user: { id: user._id, name: user.name, email: user.email }
//         });
//     } catch (error) {
//         console.error("Login error:", error);
//         res.status(500).json({ message: "Server error" });
//     }
// });


// module.exports = router;

const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const userModel = require('../modals/user.model');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.get('/test', (req, res) => {
    res.send("hello world, this is user test route");
});

router.get('/register', (req, res) => {
    res.render('register');
});

// POST /register: Register a new user
router.post(
    '/register',
    [
        body('email').trim().normalizeEmail().isEmail().withMessage('Invalid email format'),
        body('password').trim().isLength({ min: 5 }).withMessage('Password must be at least 5 characters long'),
        body('name').trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { name, email, password } = req.body;

            // Check if user already exists
            const existingUser = await userModel.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }

            // Hash password
            const hashPassword = await bcrypt.hash(password, 10);

            // Create new user
            const newUser = await userModel.create({
                name,
                email,
                password: hashPassword,
            });

            res.status(201).json({
                message: 'User registered successfully',
                user: { id: newUser._id, name: newUser.name, email: newUser.email },
            });
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

router.get('/login', (req, res) => res.render('login'));

// POST /login: Authenticate user
router.post('/login', [
    body('email').trim().normalizeEmail().isEmail().withMessage('Invalid email format'),
    body('password').trim().isLength({ min: 5 }).withMessage('Password must be at least 5 characters long')
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

        // Ensure stored password is a bcrypt hash
        if (!user.password.startsWith('$2b$')) {
            console.error("Stored password is not a valid bcrypt hash");
            return res.status(500).json({ message: "Server error: Password not hashed properly" });
        }

        // Compare hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not defined in environment variables.");
            return res.status(500).json({ message: "Server configuration error" });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: "Login successful",
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
