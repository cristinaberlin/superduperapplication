var express = require('express');
var path = require('path');
var passport = require('passport');
var session = require('express-session');
var sequelize = require('./database') //require file I made
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('my-db');

db.run(`CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
)`, (err) => {
    if (err) {
        console.error('Error creating table', err);
    } else {
        console.log('Table "user" is ready');
    }
});

sequelize.sync(
 // {force: true} //If I want data to be deleted after every time 
).then(()=> console.log('db is ready!')) 

var indexRouter = require('./routes/index');
var authRouter = require('./routes/auth');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'SECRETKEY', resave: true, saveUninitialized:true}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/auth', authRouter);
//app.use('/users', usersRouter);

module.exports = app;
