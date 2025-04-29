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

    comments.push({ id: commentId, content })

    commentsByPostId[postId] = comments;

    res.status(201).send(comments);

    axios.post("http://localhost:4005/events",
        {
            type: 'CommentCreated',
            data: {
                id: commentId,
                content,
                postId
            }
        }
    );
});

app.post('/events', (req, res) => {
    const event = req.body;
    console.log('received event', event.type)

    res.send({ status: 'OK' });
});

app.listen(4001, () => {
    console.log('listening on 4001');
});