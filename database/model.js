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
        return data;
    },

    add: async (string) => {
        const all = methods.findEmojis(string)
        if (all) {
            const toSave = all[0]
            console.log(toSave)
            const current = Line.find({ name: 'display' })
            const lastSent = Line.find({ name: 'lastSent' })
        } else {
            console.log("No emojis sent")
        }
    },

    updateDisplay: async (fields) => {
        await Line.findOneAndUpdate({name: "display"}, {line1: 'Current Mood', line2: fields.line2, line3: fields.line3})
    },

    create: async (document) => {
        const verification = await Line.create(document)
        return verification
    },

    delete: async (criteria) => {
        const verification = await Line.deleteOne(criteria)
        return verification
    },

    findEmojis: (string) => {
        const all = string.match(regex);
        return all
    }
}

const sendToWatch = async (fields) => {
    // TODO: Send to watch here after verification
}

module.exports = {
    connect,
    Line,
    methods
};
