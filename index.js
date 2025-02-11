const express = require('express');
// const ejs = require('ejs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser());

app.get('/', (req, res) => {
    const {email, username, password} = req.body;
    const token = jwt.sign({email, username}, process.env.ACCESS_TOKEN_SECRET);
    res.cookie('token', token, {maxAge:900000, httpOnly: true});
    // res.render('index');
});

app.listen(8080,  () => {
    console.log('Server is running on port https://8080/');
});