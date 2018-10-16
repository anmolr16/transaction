const express = require('express');
const router = express.Router();
const user = require('../models/userModel');
const bank = require('../models/bankModel');
const support = require('../support');

router.get('/', (request, response) => (response.send('User Working Fine.')));

router.post('/register', (request, response) => {
    try {
        var data = request.body;
        if (checkEmpty(data)) {
            support.log("Invalid Data");
            support.invalidData(response);
        } else {
            var newUser = new user(data);
            newUser.save((error, result) => {
                if (error) {
                    support.log("Error");
                    support.log(error.errmsg);
                    support.error(response, error.errmsg);
                } else {
                    support.log("Success");
                    support.log("User Created successfully.");
                    // support.success(response, result);

                    var accountPin = Math.floor(1000 + Math.random() * 9000);
                    var newBank = new bank(data);
                    newBank.accountPin = accountPin;
                    newBank.save((error1, result1) => {
                        if (error) {
                            support.log("Error1");
                            support.log(error1.errmsg);
                            support.error(response, error1.errmsg);
                        } else {
                            support.log("Success");
                            support.log("Bank Account Created successfully.");
                            var finalResult = {
                                userDetail: result,
                                bankDetail: result1
                            };
                            support.success(response, finalResult);
                        }
                    });
                }
            });
        }
    } catch (error) {
        support.log('Bad Request');
        support.log(error);
        support.badRequest(response);
    }
});

router.get('/login', (request, response) => {
    try {
        var data = request.query;
        if (checkEmpty(data)) {
            support.log("Invalid Data");
            support.invalidData(response);
        } else {
            var query = [];
            query.push({ 'userName': data.userName });
            query.push({ 'password': data.password });
            user.findOne({ $and: query }, (error, result) => {
                if (error) {
                    support.log("Error");
                    support.log(error.errmsg);
                    support.error(response, error.errmsg);
                } else {
                    support.log("Success");
                    support.log("User LoggedIn successfully.");
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