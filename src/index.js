const express = require('express');
const ejs = require('ejs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();

app.use(cookieParser());

app.get('/', (req, res) => {
    // res.render('index');
});

app.listen(8080,  () => {
    console.log('Server is running on port https://8080/');
});