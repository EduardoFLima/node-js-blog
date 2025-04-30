const express = require('express');
const axios = require('axios');
const { randomBytes } = require('crypto');

const app = express();
app.use(express.json());

const events = [];

app.get('/events', (req, res) => {
    res.send(events);
});

app.post('/events', (req, res) => {
    const eventId = randomBytes(4).toString('hex');
    const event = { id: eventId, ...req.body};
    events.push(event);

    console.log('received event', event.type, JSON.stringify(event.data));

    axios.post('http://localhost:4000/events', event)
        .catch((err) => {
            console.log(err.message);
        });
    axios.post('http://localhost:4001/events', event)
        .catch((err) => {
            console.log(err.message);
        });;
    axios.post('http://localhost:4002/events', event).catch((err) => {
        console.log(err.message);
    });;

    axios.post('http://localhost:4003/events', event).catch((err) => {
        console.log(err.message);
    });;

    res.send({ status: 'OK' });
});

app.listen(4005, () => {
    const now = new Date();

    console.log('Listening on 4005', now.getHours(), now.getMinutes(), now.getSeconds())
});