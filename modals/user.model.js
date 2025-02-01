const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        minlength: [3, 'Username must be at least 3 characters long ']
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        minlength: [8, 'Email must be at least 8 characters long ']
    },
    password: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        minlength: [8, 'Username must be at least 8 characters long ']
    }
})


const user = mongoose.model('user', userSchema);

module.exports = user;