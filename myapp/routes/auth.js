var passport = require('passport');
var express = require('express');
var localStrategy = require('passport-local');

var router = express.Router();
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('my-db');

passport.use(new localStrategy(async function verify(username, password, done) {

    /*
    This function is essential in logging in a user. It searches for a user by the username and password they entered from
    the SQLLite3 database. 

    However, user input is allowed to be directly concatenated into the SQL query string without proper sanitization. 
    This allows the possibility of an SQL injection attack.

    Username is not escaped or sanitized leaving it open for an XSS attack because it is directly displayed on 
    home page after signup succeeds. Because the username is stored in the database
    this kind of XSS attack is known as a Stored XSS vulnerability.
    */

    let sql = `SELECT * FROM user WHERE username = '${username}' AND password = '${password}'`;

    db.get(sql, function(err, user) {
        if (err) {
            console.log(err);
            return done(null, false, { message: 'Incorrect username or password'});
        }

        return done(null, user);

    });

} ));

/* 
This serializes a user object into a session after successful login or signup.
It creates a session token by the user id. 
*/
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

/*
This uses the session token i.e user id to deserialize a user. In other words,
to retrieve the user's details from SQL using the serialized user id.
*/
passport.deserializeUser(function(userId, done) {
    let sql = `SELECT * FROM user WHERE id = ${userId}`;
    db.get(sql, function(err, user) {
        if (err) {
            return done(null, false, { message: 'Serialization issue'})
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false, { message: 'Serialization issue.' });
        }
    });
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: 'auth/login?failed=1'
}));

router.get('/login', (req, res, next) => {
    const failed = req.query.failed
    res.render('login', {failed:failed})
});

router.post('/signup', (req, res, next) => {

    /*
    This is where signup is processed after the user clicks on the submit button.

    This function is essential in logging in a user. It searches for a user by the username and password they entered from
    the SQLLite3 database. 

    However, user input is allowed to be directly concatenated into the SQL query string without proper sanitization. 
    This allows the possibility of an SQL injection attack.

    No password hashing is used leaving password in plain text. This is a senstive data exposure.

    Username is not escaped or sanitized leaving it open for an XSS attack because it is directly displayed on 
    home page after signup succeeds. Because the username is stored in the database
    this kind of XSS attack is known as a Stored XSS vulnerability.
    */

    let sql = `INSERT INTO user (username, password) VALUES ('${req.body.username}', '${req.body.password}')`;
    db.run(sql, function(err) {
        if (err) {
            console.error(err);
            return res.redirect('/auth/signup?failed=2');
        }
        req.login({ id: this.lastID, username: req.body.username, password: req.body.password }, function(err) {
            if (err) {
                console.error(err);
                return res.redirect('/auth/signup?failed=3');
            }
            res.redirect('/');
        });
    });

})

//get signup page
router.get('/signup', (req, res, next) => {
    const failed = req.query.failed
    let msg = ''
    switch (failed) {
        case '1':
            msg = 'Something went wrong on our side'
            break;
        case '2':
            msg = 'Username taken'
            break
        case '3':
            msg = 'Failed to signup'
            break
    }
    res.render('signup', {failed:failed,msg:msg})
});

router.post('/logout', (req, res, next) => {
    req.logout(function(err){
        if (err) {return next(err)}
        res.redirect('/')
    })
});

module.exports = router;