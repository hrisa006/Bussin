const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json());

const posts = [
    {
        username: 'Hrisi',
        title: 'Post 1'
    },
    {
        username: 'Pisi',
        title: 'Post 2'
    }
];

app.get('/posts', (req, res) => {
    res.json(posts);
});

app.post('/posts', (req, res) => {
    const user = {username: req.body.username, password: req.body.password};
    posts.push(user);
    res.status(201).send();
});


app.listen(8080);