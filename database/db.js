const mongoose = require('mongoose');

const watchSchema = new mongoose.Schema({
    line1: String,
    line2: String,
    line3: String
})

const Line = mongoose.model('Line', watchSchema);

module.exports = {
    Line
}
