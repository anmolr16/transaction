const mongoose = require('mongoose');
const schema = mongoose.Schema;

const walletSchema = new mongoose.Schema({
    'userName': String,
    'firstName': String,
    'lastName': String,
    'walletPin': String,
    'amount': { type: Number, default: 0 },
    'bankAccountNumber': { type: schema.Types.ObjectId, ref: 'banks', default: null },
    'email': String,
    'contactNumber': String,
    'dateCreated': { type: Date, default: Date.now },
    'lastModified': { type: Date, default: Date.now },
    'visible': { type: Boolean, default: true }
});

module.exports = mongoose.model('wallets', walletSchema);