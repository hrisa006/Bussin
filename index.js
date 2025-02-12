const express = require('express');
const ejs = require('ejs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;

app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.static('public'));

function authenticateToken(req, res, next) {
    const authCookie = req.cookies['auth_cookie'];

    if(!authCookie) {
        res.sendStatus(401);
    }

    jwt.verify(authCookie, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) {
            res.sendStatus(403);
        }
        req.user = user;
        next();
    });
}

app.get('/auth/me', authenticateToken, (req, res) => {
    res.json(req.user);
});

app.post('/auth/register', (req, res) => {
    const {email, username, password} = req.body;



    const token = jwt.sign({email, username}, process.env.ACCESS_TOKEN_SECRET);
    res.cookie('auth_cookie', token, {maxAge:900000, httpOnly: true});

    res.status(201).json({message: 'User created', user: {email, username}});
    // res.render('index');
});

app.get('/auth/login', (req, res) => {
    const {email, password} = req.body;
    const token = jwt.sign({email, username}, process.env.ACCESS_TOKEN_SECRET);
    res.cookie('auth_cookie', token, {maxAge:900000, httpOnly: true});
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) {
            res.sendStatus(403);
        }
        res.json({user});
    });
});

app.listen(PORT,  () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});