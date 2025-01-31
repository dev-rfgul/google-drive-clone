const express = require('express');

const router = express.Router();

router.get('/test', (req, res) => {
    res.send("hello world, this is user test route");
})

router.get('/register', (req, res) => {
    res.render('register');
})
router.post('/register', (req, res) => {
    res.send('user registered');
    console.log(req.body)
})

module.exports = router;