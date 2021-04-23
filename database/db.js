const mongoose = require('mongoose');

const watchSchema = new mongoose.Schema({
    name: String,
    line1: String,
    line2: String,
    line3: String,
    lastUpdated: Date
})

const Line = mongoose.model('Line', watchSchema);

module.exports = {
    Line
}
