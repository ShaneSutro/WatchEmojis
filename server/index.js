const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { response } = require('express');
let { connect, methods } = require('../database/model')

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.send('<h1>Setup</h1>')
})

app.get('/read', async (req, res) => {
    const response = await methods.read()
    res.send(response)
})

app.get('/send', async (req, res) => {
    const response = await methods.updateDisplay()
    res.send(response)
})

app.post('/new', async (req, res) => {
    const document = req.body
    const response = await methods.create(document)
    res.send(response)
})

app.delete('/delete', async (req, res) => {
    const criteria = req.body;
    const dbres = await methods.delete(criteria);
    res.send(dbres);
})

const handleInboundSms = async (req, res) => {
    const params = Object.assign(req.query, req.body)
    const code = await methods.add(params.text)
    res.status(code).send()
}

app
    .route('/webhooks/inbound-sms')
    .get(handleInboundSms)
    .post(handleInboundSms)

connect().then(async () => {
    app.listen(process.env.PORT || 3000);
    console.log("Connected and listening!")
})
    .catch(err => console.error(err))
