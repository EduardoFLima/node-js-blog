const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { randomBytes } = require('crypto');

const app = express();
app.use(express.json());
app.use(cors());

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
    const postId = req.params.id;
    console.log(`post id is ${postId}`);
    res.send(commentsByPostId[postId] || []);
});

app.post('/posts/:id/comments', (req, res) => {
    const commentId = randomBytes(4).toString('hex');
    const postId = req.params.id
    const { content } = req.body;

    console.log(`creating comment on post id ${postId}`);

    const comments = commentsByPostId[postId] || [];
    const status = 'PENDING';

    comments.push({ id: commentId, content, status })

    commentsByPostId[postId] = comments;

    res.status(201).send(comments);

    axios.post("http://localhost:4005/events",
        {
            type: 'CommentCreated',
            data: {
                id: commentId,
                content,
                status,
                postId
            }
        }
    );
});

app.post('/events', async (req, res) => {
    const event = req.body;
    console.log('received event', event.type);

    if (event.type === 'CommentModerated') {
        const { id, content, status, postId } = event.data

        commentsByPostId[postId] = commentsByPostId[postId]
            .map(comment => comment.id === id ? { ...event.data } : comment);

        await axios.post('http://localhost:4005/events', {
            type: 'CommentUpdated',
            data: {
                id, content, status, postId
            }
        });
    }

    res.send({ status: 'OK' });
});

app.listen(4001, () => {
    console.log('listening on 4001');
});