const mongoose = require('mongoose');
const schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    'userName': String,
    'password': String,
    'firstName': String,
    'lastName': String,
    'email': String,
    'contactNumber': String,
    'dateCreated': { type: Date, default: Date.now },
    'lastModified': { type: Date, default: Date.now }
});

module.exports = mongoose.model('users', userSchema);