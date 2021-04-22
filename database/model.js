const mongoose = require('mongoose');
const { Line } = require('./db')
const emojiRegex = require('emoji-regex');
const regex = emojiRegex();

const connect = () => {
    return mongoose.connect(process.env.MONGODB_URI)
}

const methods = {
    read : async (line, string) => {
        const data = await Line.find({})
        console.log(data)
    },

    add: async (string) => {
        const all = string.match(regex)
        console.log(all.length)
        Line.find({})
    },

    findEmojis: (string) => {
        const all = string.match(regex);
        return all
    }
}

module.exports = {
    connect,
    Line,
    methods
};
