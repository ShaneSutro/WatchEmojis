const mongoose = require('mongoose');
const { Line, Counter } = require('./db')
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
        const data = await Line.findOne({ name: 'display' })
        return data;
    },

    add: async (string) => {
        const all = methods.findEmojis(string)
        if (all) {
            methods.incrementCounter()
            const current = await Line.findOne({ name: 'display' })
            const allEmojis = methods.findEmojis(all[0].concat(current.line1, current.line2, current.line3))
            const line1 = allEmojis.slice(0, 8).join('')
            const line2 = allEmojis.slice(8, 16).join('')
            const line3 = allEmojis.slice(16, 24).join('')
            const newDoc = await Line.findOneAndUpdate({ name: 'display' }, { line1, line2, line3, })
            const difference = new Date() - current.lastUpdated
            const minutes = Math.ceil(difference / (1000 * 60))
            if (minutes >= rateLimit) {
                console.log('Sending to watch...')
                methods.updateDisplay()
                await Line.findOneAndUpdate({name: 'display'}, {lastUpdated: new Date()})
            } else {
                if (!timeout) {
                    console.log(`Debouncing for ${rateLimit - minutes} more minutes`)
                    timeout = setTimeout(async () => {
                        console.log('Sending queued message')
                        methods.updateDisplay()
                        await Line.findOneAndUpdate({name: 'display'}, {lastUpdated: new Date()})
                    }, ((rateLimit - minutes) * (1000 * 60))
                )} else {
                    console.log('Already debounced, skipping')
                }
            }
            return 201
        } else {
            console.log("No emojis in text")
            return 304
        }
    },

    updateDisplay: async () => {
        const fields = await Line.findOne({ name: "display" })
        sendToWatch(fields)
    },

    incrementCounter: async () => {
        const filter = { name: 'counter' };
        const update = { $inc: { count: 1 } };
        const result = await Counter.findOneAndUpdate(filter, update, {
            new: true,
            upsert: true
        })
        console.log('Increment result:', result)
    },

    getCounter: async () => {
        const result = await Counter.findOne({ name: 'counter' })
        return result;
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
        token: process.env.PO_KEY,
        user: process.env.USER_KEY,
        title: fields.line1,
        text: fields.line2,
        subtext: fields.line3,
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
