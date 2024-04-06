/* inspired by: https://www.youtube.com/watch?v=jBKqA8FFpIM&ab_channel=JeremiahLynnDev */
/* inspired by: https://www.split.io/blog/introduction-to-building-a-crud-api-with-node-js-and-express/*/


var express = require('express');
var router = express.Router();
const User = require('../models/user'); 
var crypto = require('crypto');

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('my-db');

/* GET home page. */
/* If user is signed in, I will render the index page if not, the user will be sent back to the login page  */
router.get('/', function(req, res, next) {
  if(req.user) {
    res.render('index', { username: req.user.username });
  } else {
    res.redirect('/auth/login');
  }
});

// Update a user's information
router.post('/users/:id/edit', async (req, res) => {
  console.log("Attempting to update a user");
  try {
    const { username } = req.body;
    const [updated] = await User.update({ username }, { where: { id: req.params.id }});
    if (updated) {
      res.redirect('/users');
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send(error.message);
  }
});

router.post('/users', async (req, res) => {
  try {
    const { username, password } = req.body;
    let salt = crypto.randomBytes(16);
    crypto.pbkdf2(password, salt, 310000, 32, 'sha256', async function(err, hashedPassword) {
      try {
        const user = await User.create({username: username, password: hashedPassword, salt:salt});
        res.redirect('/users');
    } catch (e) {
        console.log(e);

    }
      //res.status(201).json(newUser);
    })
  } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).send(error.message);
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.render('users', { users: users });
    //res.json(users);
  } catch (error) {
    console.log("Error getting users");
    console.error('Error fetching users:', error);
    res.status(500).send(error.message);
  }
});

// Get a single user by ID
router.get('/users/:id/edit', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      //res.json(user);
      res.render('userDetail', { username: user.username, userId: req.params.id });
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send(error.message);
  }
});

// Delete a user
router.delete('/users/:id/delete', async (req, res) => {
  console.log("attempting to delete");
  try {
    const deleted = await User.destroy({ where: { id: req.params.id } });
    if (deleted) {
      res.status(204).send('User deleted');
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send(error.message);
  }
});

module.exports = router;
