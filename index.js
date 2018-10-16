const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');


global.checkEmpty = function(arg) {
    if (typeof(arg) == 'undefined' || arg == null || arg == '') {
        return true;
    } else {
        return false;
    }
};

const options = {
    connectTimeoutMS: 300000,
    socketTimeoutMS: 300000,
    keepAlive: 1,
    poolSize: 5,
    reconnectTries: 30,
    useMongoClient: true
};

const url = 'mongodb://app:service@localhost:27017/transaction';

// database connection.
mongoose.connect(url, options)
    .then(() => {
        console.log('Database Connected');
        const app = express();
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({
            extended: true
        }))

        //ROUTES
        app.use('/user', require('./routes/userRoutes'));
        app.use('/bank', require('./routes/bankRoutes'));
        app.use('/wallet', require('./routes/walletRoutes'));
        app.use('/transaction', require('./routes/transactionRoutes'));

        const port = 9009;
        app.listen(port, function() {
            console.log('Server listening at -->  ' + port);
        });
    }).catch(error => {
        console.error(error);
    });