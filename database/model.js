const mongoose = require('mongoose');
const { Line } = require('./db')

const connect = () => {
    return mongoose.connect(process.env.MONGODB_URI)
}

const methods = {
    read : async (line, string) => {
        const data = await Line.find({})
        console.log(data)
    },
    
    add : async (document) => {
        const doc = Line.create(document);
        return doc
    }
}

module.exports = { 
    connect,
    Line,
    methods
};
