const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const posts = {};

const postsWithoutRejectedComments = () => {
    return Object.values(posts).map(post => {
        post.comments = post.comments.filter(comment => comment.status !== 'REJECTED');
        return post;
    })
}

const handlePostCreation = (data) => {
    console.log(`Im handling a new post!`);

    const { id, title } = data;

    posts[id] = { id, title, comments: [] };
}

const handleCommentCreation = (data) => {
    console.log(`Im handling a new comment!`);

    const { id, content, status, postId } = data;

    posts[postId].comments.push({ id, content, status });
}

const handleCommentUpdated = (data) => {
    console.log(`Im handling a comment update!`);

    const { id, content, status, postId } = data;

    posts[postId].comments = posts[postId].comments
        .map(comment => comment.id === id ? { id, content, status } : comment);
}

app.get('/posts', (req, res) => {
    res.send(postsWithoutRejectedComments());
});

app.post('/events', (req, res) => {
    const event = req.body;
    console.log('received event', event.type)

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
            console.log(`Received event ${event.type} but no handler available for it`)
    }

    // console.log('new posts obj', JSON.stringify(posts))

    res.send({ status: 'OK' });
});

app.listen(4002, () => {
    console.log('listening on 4002');
});