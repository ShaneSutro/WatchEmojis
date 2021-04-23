const mongoose = require('mongoose');

const watchSchema = new mongoose.Schema({
    name: String,
    line1: String,
    line2: String,
    line3: String,
    lastUpdated: Date
})

const counterSchema = new mongoose.Schema({
    name: String,
    count: Number,
    lastUpdated: Date
})

const Counter = mongoose.model('Counter', counterSchema);
const Line = mongoose.model('Line', watchSchema);

module.exports = {
    Line,
    Counter
}
