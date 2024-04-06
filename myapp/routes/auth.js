/* inspired by: https://www.youtube.com/watch?v=jBKqA8FFpIM&ab_channel=JeremiahLynnDev */
/* inspired by: https://www.split.io/blog/introduction-to-building-a-crud-api-with-node-js-and-express/*/

var crypto = require('crypto');
var passport = require('passport');
var express = require('express');
var localStrategy = require('passport-local');
var User = require('../models/user');

var router = express.Router();

passport.use(new localStrategy(async function verify(username, password, done) {
    try {
        const user = await User.findOne({where: {username: username}})
        if (!user) {
            return done(null, false, { message: 'Incorrect username or password'})
        }

        crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', async function(err, hashedPassword) {
        if (err) { return done (err)}

        if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
            return done(null, false, {message: 'Incorrect username or password.' });
        } 
        
        return done(null, user);

        }) 

    } catch (e){
        return done(e);
    }
} ))

/* registers function to serialise user objects into a session */
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done){
    User.findByPk(id).then(function(user) { done(null,user); });
});

router.post('/login', passport.authenticate('local', {
    /*
    Login uses the passprt local strategy on lines 9 to 30 to securely retrieve a user using sequelize and crypto hashing.
    */
    successRedirect: '/',
    failureRedirect: 'auth/login?failed=1'
}));

router.get('/login', (req, res, next) => {
    const failed = req.query.failed
    res.render('login', {failed:failed})
});

router.post('/signup', (req, res, next) => {

    let salt = crypto.randomBytes(16);
    crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', async function(err, hashedPassword){
        /* parameter if hashing fails */
        if (err) {res.redirect('/auth/signup?failed=1')}

        try {
            
            const user = await User.create({ username: req.body.username, password: hashedPassword, salt:salt})

            req.login(user, function(err){
                if (err) {res.redirect('/auth/signup?failed=3')}
                res.redirect('/');
            })
        } catch (e) {
            console.log(e);
            res.redirect('/auth/signup?failed=2');
        }
    })
})

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
            msg = 'Failed to login'
            break
    }
    res.render('signup', {failed:failed,msg:msg})
})

router.post('/logout', (req, res, next) => {
    req.logout(function(err){
        if (err) {return next(err)}
        res.redirect('/')
    })
})

module.exports = router;