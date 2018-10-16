const express = require('express');
const router = express.Router();
const wallet = require('../models/walletModel');
const bank = require('../models/bankModel');
const support = require('../support');

router.get('/', (request, response) => (response.send('Wallet Working Fine.')));

router.post('/register', (request, response) => {
    try {
        var data = request.body;
        if (checkEmpty(data)) {
            support.log("Invalid Data");
            support.invalidData(response);
        } else {
            var newWallet = new wallet(data);
            newWallet.save((error, result) => {
                if (error) {
                    support.log("Error");
                    support.log(error.errmsg);
                    support.error(response, error.errmsg);
                } else {
                    support.log("Success");
                    support.log("Wallet Created successfully.");
                    support.success(response, result);
                }
            });
        }
    } catch (error) {
        support.log('Bad Request');
        support.log(error);
        support.badRequest(response);
    }
});

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

router.put('/linkBankAccount', (request, response) => {
    try {
        var data = request.body;
        if (checkEmpty(data)) {
            support.log("Invalid Data");
            support.invalidData(response);
        } else {
            verifyBankDetail(data, function(bankCallback) {
                if (bankCallback) {
                    var walletQuery = { "_id": data._id };
                    var update = { $currentDate: { lastModified: true }, $set: data };
                    var options = { new: true };
                    wallet.findOneAndUpdate(walletQuery, update, options, (error, result) => {
                        if (error) {
                            support.log("error");
                            support.log(error);
                            support.error(response, error);
                        } else {
                            support.log("Success");
                            support.success(response, result);
                        }
                    });
                } else {
                    support.noDataFound(response);
                }
            });
        }
    } catch (e) {
        support.log("Bad Request");
        support.badRequest(response);
    }
});



module.exports = router;