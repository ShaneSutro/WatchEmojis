const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { response } = require('express');
let models, { connect } = require('../database/model')

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.send('<h1>Hello World</h1>')
})

const handleInboundSms = (req, res) => {
    const params = Object.assign(req.query, req.body)
    console.log(params)
    res.status(200).send()
}

app
    .route('/webhooks/inbound-sms')
    .get(handleInboundSms)
    .post(handleInboundSms)

connect().then(async () => {
    app.listen(process.env.PORT || 3000);
    console.log("Connected and listening!")
})
