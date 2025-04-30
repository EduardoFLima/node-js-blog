const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const moderate = (data) => {
    if (data.content.includes('orange')) {
        return { ...data, status: 'REJECTED' }
    }

    return { ...data, status: 'ACCEPTED' }
}

app.post('/events', async (req, res) => {
    const event = req.body;
    console.log('received event', event.type);

    if (event.type == 'CommentCreated') {
        const moderatedComment = moderate(event.data);

        await axios.post('http://localhost:4005/events', {
            type: 'CommentModerated',
            data: {
                ...moderatedComment
            }
        });
    }

    res.send({ status: 'OK' });
});

app.listen(4003, () => {
    console.log('Listening on 4003')
});