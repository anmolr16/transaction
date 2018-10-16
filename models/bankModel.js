const mongoose = require('mongoose');
const schema = mongoose.Schema;

const bankSchema = new mongoose.Schema({
    'userName': String,
    'accountPin': String,
    'firstName': String,
    'lastName': String,
    'email': String,
    'contactNumber': String,
    'dateCreated': { type: Date, default: Date.now },
    'lastModified': { type: Date, default: Date.now },
    'amount': { type: Number, default: 10000 },
});

module.exports = mongoose.model('banks', bankSchema);