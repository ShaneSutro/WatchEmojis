const mongoose = require('mongoose');
const Line = require('./db')

const connect = () => {
    return mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/27017')
}

const models = { Line }

module.exports = { 
    connect,
    models
};
