const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { randomBytes } = require('crypto');

const app = express();
app.use(express.json());
app.use(cors());

const posts = {};

app.get('/posts', (req, res) => {
    res.send(posts);
});

app.post('/posts', (req, res) => {
    const id = randomBytes(4).toString('hex');
    const { title } = req.body;

    posts[id] = { id, title };

    res.status(201).send(posts[id]);

    axios.post("http://localhost:4005/events",
        { type: 'PostCreated', data: { id, title } }
    );
});

app.post('/events', (req, res) => {
    const event = req.body;
    console.log('received event', event.type)

    res.send({ status: 'OK' });
});

app.listen(4000, () => {
    console.log('listening on 4000');
});