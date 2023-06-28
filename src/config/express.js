const express = require('express');
const handlebars = require('express-handlebars');
// const session = require('express-session');
const cookieParser = require('cookie-parser');
const { hasToken } = require('../middleware/userSession');
const trimBody = require('../middleware/trimBody');
// const userSession = require('../middleware/userSession');

// change view directory
// const path = require('path');




module.exports = (app) => {
    const hbs = handlebars.create({
        extname: '.hbs'
    });

    // change view directory
    // app.set('views', path.resolve(__dirname, '../views'));
    app.set('views', 'src/views');
    
    app.engine('.hbs', hbs.engine);
    app.set('view engine', '.hbs');
    app.use('/static', express.static('src/static'));

    // SESSION COOKIES
    // app.use(session({
    //     secret: 'secret',
    //     resave: false,
    //     saveUninitialized: true,
    //     cookie: { secure: 'auto' }
    // }));
    // SESSION
    // app.use(userSession());

    app.use(express.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(hasToken);

    // if you don't want to trim password
    app.use(trimBody('password'));
};