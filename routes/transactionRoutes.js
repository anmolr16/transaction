const express = require('express');
const router = express.Router();
const wallet = require('../models/walletModel');
const bank = require('../models/bankModel');
const transaction = require('../models/transactionModel');
const support = require('../support');
const ObjectID = require('mongodb').ObjectID;

router.get('/', (request, response) => (response.send('Transaction Working Fine.')));

verifyBankDetail = function(data, callback) {
    var bankQuery = [];
    bankQuery.push({ 'userName': data.userName });
    bankQuery.push({ 'accountPin': data.accountPin });
    bankQuery.push({ '_id': data.bankAccountNumber });

    bank.findOne({ $and: bankQuery })
        .lean()
        .exec((error, result) => {
            if (error) {
                support.log("Error");
                support.log(error.errmsg);
            } else {
                callback(result);
            }
        });
}

checkWalletBalance = function(data, callback) {
    var query = { '_id': data._id };
    wallet.findOne(query, (error, result) => {
        if (error) {
            support.log("error");
            support.log(error);
        } else {
            callback(result);
        }
    });
}

updateBankAmount = function(data, type, response, callback) {
    var updateAmount;
    var amount = data.amount;
    var bankQuery = [];
    bankQuery.push({ 'userName': data.userName });
    bankQuery.push({ 'accountPin': data.accountPin });
    bankQuery.push({ '_id': data.bankAccountNumber });
    verifyBankDetail(data, function(bankCallback) {
        if (bankCallback) {
            if (type === 'AM') {
                var bankBalance = bankCallback.amount;
                if (bankBalance >= amount) {
                    var newBalance = bankBalance - amount;
                    updateAmount = {
                        'amount': newBalance
                    };
                } else {
                    var lessMoney = { "Message": "Insuficient Balance in bank, Please provide appropiate figure to  add in wallet." };
                    support.success(response, lessMoney);
                }
            } else if (type === 'SBM') {
                var bankBalance = bankCallback.amount;
                var newBalance = bankBalance + amount;
                updateAmount = {
                    'amount': newBalance
                };
            }
            var update = { $currentDate: { lastModified: true }, $set: updateAmount };
            var options = { new: true };
            bank.findOneAndUpdate({ $and: bankQuery }, update, options)
                .lean()
                .exec((error, result) => {
                    if (error) {
                        support.log("Error");
                        support.log(error.errmsg);
                    } else {
                        callback(result);
                    }
                });

        } else {
            support.noDataFound(response);
        }
    });
}

transactioEntryFunc = function(data, callback) {
    var newTransaction = new transaction(data);
    newTransaction.save((error, result) => {
        if (error) {
            support.log("error");
            support.log(error);
        } else {
            support.log("Success");
            callback(result);
        }
    });
}

router.put('/addMoney', (request, response) => {
    try {
        var data = request.body;
        var type = 'AM';
        if (checkEmpty(data)) {
            support.log("Invalid Data");
            support.invalidData(response);
        } else {
            updateBankAmount(data, type, response, function(amountCallback) {
                if (amountCallback) {
                    checkWalletBalance(data, function(walletBalanceCallback) {
                        if (walletBalanceCallback) {
                            var walletBalance = walletBalanceCallback.amount;
                            var newBalance = walletBalance + data.amount;
                            var finalAmount = {
                                'amount': newBalance
                            };
                            var walletId = data._id;
                            var walletQuery = { "_id": walletId };
                            var update = { $currentDate: { lastModified: true }, $set: finalAmount };
                            var options = { new: true };
                            wallet.findOneAndUpdate(walletQuery, update, options, (error, result) => {
                                if (error) {
                                    support.log("error");
                                    support.log(error);
                                    support.error(response, error);
                                } else {
                                    support.log("Success");
                                    var transactionEntry = {
                                        'user': data.userName,
                                        'from': data.bankAccountNumber,
                                        'to': data._id,
                                        'type': type,
                                        'amount': data.amount
                                    };
                                    transactioEntryFunc(transactionEntry, function(entryCallback) {
                                        if (entryCallback) {
                                            support.success(response, result);
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });

        }
    } catch (e) {
        support.log("Bad Request");
        support.badRequest(response);
    }
});

refundMoney = function(data, callback) {
    var countTransactionQuery = [];
    countTransactionQuery.push({ 'from': ObjectID(data._id) });
    countTransactionQuery.push({ 'type': 'B' });
    transaction.aggregate([
        { $match: { $and: countTransactionQuery } },
        {
            $group: {
                _id: null,
                totalRefund: { $sum: '$refund' }
            }
        },
        {
            $project: {
                _id: 0,
                totalRefund: '$totalRefund'
            }
        },
    ]).exec((error, result) => {
        if (error) {
            support.log("error");
            support.log(error);
            support.error(response, error);
        } else {
            callback(result[0]);
        }
    });
}

router.put('/sendBackMoney', (request, response) => {
    try {
        var data = request.body;
        var type = 'SBM';
        if (checkEmpty(data)) {
            support.log("Invalid Data");
            support.invalidData(response);
        } else {
            checkWalletBalance(data, function(walletBalanceCallback) {
                if (walletBalanceCallback) {
                    var walletBalance = walletBalanceCallback.amount;
                    refundMoney(data, function(refundCallback) {
                        if (refundCallback) {
                            var totalRefundedMoney = refundCallback.totalRefund;
                            var finalMoneyExcludingRefund = walletBalance - totalRefundedMoney;
                            if (data.amount <= finalMoneyExcludingRefund) {
                                updateBankAmount(data, type, response, function(amountCallback) {
                                    if (amountCallback) {
                                        var newBalance = walletBalance - data.amount;
                                        var finalAmount = {
                                            'amount': newBalance
                                        };
                                        var walletId = data._id;
                                        var walletQuery = { "_id": walletId };
                                        var update = { $currentDate: { lastModified: true }, $set: finalAmount };
                                        var options = { new: true };
                                        wallet.findOneAndUpdate(walletQuery, update, options, (error, result) => {
                                            if (error) {
                                                support.log("error");
                                                support.log(error);
                                                support.error(response, error);
                                            } else {
                                                support.log("Success");
                                                var transactionEntry = {
                                                    'user': data.userName,
                                                    'from': data.bankAccountNumber,
                                                    'to': data._id,
                                                    'type': type,
                                                    'amount': data.amount
                                                };
                                                transactioEntryFunc(transactionEntry, function(entryCallback) {
                                                    if (entryCallback) {
                                                        support.success(response, result);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            } else {
                                support.success(response, lessMoney);
                            }
                        }
                    });
                }
            });
        }
    } catch (e) {
        support.log("Bad Request");
        support.badRequest(response);
    }
});

router.put('/buy', (request, response) => {
    try {
        var data = request.body;
        var amount = data.amount;
        var type = 'B';
        if (checkEmpty(data)) {
            support.log("Invalid Data");
            support.invalidData(response);
        } else {
            checkWalletBalance(data, function(walletBalanceCallback) {
                if (walletBalanceCallback) {
                    var walletBalance = walletBalanceCallback.amount;
                    if (amount <= walletBalance) {
                        if (amount >= 2000) {
                            var refund = (amount * 10) / 100;
                            var newBalance = walletBalance - amount + refund;
                            var transactionEntry = {
                                'user': data.userName,
                                'from': data._id,
                                'to': null,
                                'type': type,
                                'amount': amount,
                                'refund': refund
                            };
                        } else {
                            var newBalance = walletBalance - amount;
                            var transactionEntry = {
                                'user': data.userName,
                                'from': data._id,
                                'to': null,
                                'type': type,
                                'amount': amount,
                                'refund': 0
                            };
                        }
                        var finalAmount = {
                            'amount': newBalance
                        };
                        var walletId = data._id;
                        var walletQuery = { "_id": walletId };
                        var update = { $currentDate: { lastModified: true }, $set: finalAmount };
                        var options = { new: true };
                        wallet.findOneAndUpdate(walletQuery, update, options, (error, result) => {
                            if (error) {
                                support.log("error");
                                support.log(error);
                                support.error(response, error);
                            } else {
                                support.log("Success");
                                transactioEntryFunc(transactionEntry, function(entryCallback) {
                                    if (entryCallback) {
                                        support.success(response, result);
                                    }
                                });
                            }
                        });
                    } else {
                        var lessMoney = { "Message": "Low Balance in wallet, Please Buy things with lesser amount" };
                        support.success(response, lessMoney);
                    }
                }
            });
        }
    } catch (e) {
        support.log("Bad Request");
        support.badRequest(response);
    }
});

module.exports = router;