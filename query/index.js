const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

const posts = {};

const handlePostCreation = (data) => {
    const { id, title } = data;

    posts[id] = { id, title, comments: [] };
}

const handleCommentCreation = (data) => {
    const { id, content, status, postId } = data;

    posts[postId].comments.push({ id, content, status });
}

const handleCommentUpdated = (data) => {
    const { id, content, status, postId } = data;

    posts[postId].comments = posts[postId].comments
        .map(comment => comment.id === id ? { id, content, status } : comment);
}

const processEvent = (event) => {
    console.log('received event', event.type);

    switch (event.type) {
        case 'PostCreated': {
            handlePostCreation(event.data);
            break;
        }
        case 'CommentCreated': {
            handleCommentCreation(event.data);
            break;
        }
        case 'CommentUpdated': {
            handleCommentUpdated(event.data);
            break;
        }
        default:
            console.log(`Received event ${event.type} but no handler available for it`);
    }
}

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

const postsWithoutRejectedComments = () => {
    return Object.values(posts).map(post => {
        post.comments = post.comments.filter(comment => comment.status !== 'REJECTED');
        return post;
    })
}

app.get('/posts', (req, res) => {
    res.send(postsWithoutRejectedComments());
});

app.post('/events', (req, res) => {
    const event = req.body;
    
    processEvent(event);

    // console.log('new posts obj', JSON.stringify(posts))

    res.send({ status: 'OK' });
});

app.listen(4002, async () => {
    console.log('listening on 4002');

    await loadEvents();
});
