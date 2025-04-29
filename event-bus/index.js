import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

app.post('/events', (req, res) => {
    const event = req.body;

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

    console.log('received event', event.type);

    res.send({ status: 'OK' });
});

app.listen(4005, () => {
    console.log('Listening on 4005')
});