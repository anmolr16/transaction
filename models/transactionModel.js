const mongoose = require('mongoose');
const schema = mongoose.Schema;

const transactionSchema = new mongoose.Schema({
    'user': String,
    'from': { type: schema.Types.ObjectId },
    'to': { type: schema.Types.ObjectId },
    'type': String,
    'refund': { type: Number, default: 0 },
    'dateCreated': { type: Date, default: Date.now },
    'amount': Number
});

module.exports = mongoose.model('transactions', transactionSchema);