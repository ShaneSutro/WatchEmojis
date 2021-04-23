const mongoose = require('mongoose');
const { Line } = require('./db')
const emojiRegex = require('emoji-regex');
const regex = emojiRegex();
const fetch = require('node-fetch');
var timeout;
var rateLimit = 10;

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
            const current = await Line.findOne({ name: 'display' })
            const allEmojis = methods.findEmojis(all[0].concat(current.line1, current.line2, current.line3))
            const line1 = allEmojis.slice(0, 8).join('')
            const line2 = allEmojis.slice(8, 16).join('')
            const line3 = allEmojis.slice(16, 24).join('')
            const newDoc = await Line.findOneAndUpdate({ name: 'display' }, { line1, line2, line3, })
            console.log(line1, line2, line3)
            const difference = new Date() - current.lastUpdated
            const minutes = Math.ceil(difference / (1000 * 60))
            console.log(minutes)
            if (minutes >= rateLimit) {
                console.log('Sending...')
                methods.updateDisplay()
                await Line.findOneAndUpdate({name: 'display'}, {lastUpdated: new Date()})
            } else {
                if (!timeout) {
                    console.log('Setting timeout...')
                    timeout = setTimeout(async () => {
                        console.log('Sending queued message')
                        methods.updateDisplay()
                        await Line.findOneAndUpdate({name: 'display'}, {lastUpdated: new Date()})
                    }, ((rateLimit - minutes) * (1000 * 60))
                )} else {
                    console.log('Schedule already running')
                }
            }
            return 201
        } else {
            console.log("No emojis sent")
            return 304
        }
    },

    updateDisplay: async () => {
        const fields = await Line.findOne({name: "display"})
        sendToWatch(fields)
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
    const data = {
        token: process.env.PO_KEY, // Fill this out in .env_template
        user: process.env.USER_KEY, // Don't forget to change the name from .env_template to .env
        title: fields.line1, // Line 1
        text: fields.line2, // Line 2
        subtext: fields.line3, // Line 3
        // count: 48, // Dial inner number
        // percent: 82.5 // Dial outer gauge
    }

    console.log(process.env.GLANCE_URL)
    fetch(process.env.GLANCE_URL, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json'}
    })
}

module.exports = {
    connect,
    Line,
    methods
};
