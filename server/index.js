const express = require('express');
const app = express();
const http = require('http');
const bodyParser = require('body-parser');
const { response } = require('express');
let { connect, methods } = require('../database/model');
const Mustache = require('mustache');
const path = require('path');
const fs = require('fs');

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
// app.use(require('cors'))
const server = http.createServer(app);
const io = require('socket.io')(server);

io.on('connection', client => {
    console.log('New connection')
    client.on('update', data => {
        console.log('New datat!')
    })
})

app.get('/', async (req, res) => {
    let doc = await methods.read();
    let counter = await methods.getCounter();
    let userCount = await methods.userCount();
    let template = fs.readFileSync(path.resolve(__dirname, './template.html')).toString()
    res.send(Mustache.render(template, {doc, counter, userCount}))
})

const handleInboundSms = async (req, res) => {
    let code = 400; // Default status code
    const params = Object.assign(req.query, req.body)
    console.log('Incoming request:', params)
    code = await methods.add(params.text || params.Text, params.From)
    res.status(code).send()
    socketUpdate()
}

app.route('/webhooks/inbound-sms')
    .get(handleInboundSms)
    .post(handleInboundSms)

connect().then(async () => {
    server.listen(process.env.PORT || 3000);
    console.log("Connected and listening!")
})
    .catch(err => console.error(err))

const socketUpdate = async () => {
    let doc = await methods.read();
    let counter = await methods.getCounter();
    let userCount = await methods.userCount();
    io.sockets.emit('update', {doc, counter, userCount})
}
