const express = require('express');
const router = express.Router();
const bank = require('../models/bankModel');
const support = require('../support');


router.get('/', (request, response) => (response.send('User Working Fine.')));

router.get('/getBankDetails', (request, response) => {
    try {
        var data = request.query;
        if (checkEmpty(data)) {
            support.log("Invalid Data");
            support.invalidData(response);
        } else {
            var query = [];
            query.push({ 'userName': data.userName });
            query.push({ 'accountPin': data.accountPin });
            bank.findOne({ $and: query }, (error, result) => {
                if (error) {
                    support.log("Error");
                    support.log(error.errmsg);
                    support.error(response, error.errmsg);
                } else {
                    support.log("Success");
                    support.log("Bank Details Fetched successfully.");
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

module.exports = router;