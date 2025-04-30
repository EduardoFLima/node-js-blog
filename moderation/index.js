const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const loadEvents = async () => {
    return axios.get('http://localhost:4005/events')
    .then(async res => {
        const events = res.data;
        
        console.log("... recovering events ... ", events.map(({id, type}) => { return { id, type } }));

        events.forEach(async event => {
            await processEvent(event);
        });
    })
    .catch((err) => {
        console.log(err.message);
    });
};

const moderate = (data) => {
    if (data.content.includes('orange')) {
        return { ...data, status: 'REJECTED' }
    }

    return { ...data, status: 'ACCEPTED' }
}

async function processEvent(event) {
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
}

app.post('/events', async (req, res) => {
    const event = req.body;

    await processEvent(event);

    res.send({ status: 'OK' });
});

app.listen(4003, async () => {
    console.log('Listening on 4003')
    await loadEvents();
});