var express = require('express');
var router = express.Router();
const User = require('../models/user'); 

// Create a new user
router.post('/users', async (req, res) => {
    try {
      const { username, password } = req.body;
      const newUser = await User.create({ username });
      res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).send(error.message);
    }
  });
  
  // Get all users
  router.get('/users', async (req, res) => {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      console.log("Error getting users");
      console.error('Error fetching users:', error);
      res.status(500).send(error.message);
    }
  });
  
  // Get a single user by ID
  router.get('/users/:id', async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (user) {
        res.json(user);
      } else {
        res.status(404).send('User not found');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).send(error.message);
    }
  });
  
  // Update a user's information
  router.put('/users/:id', async (req, res) => {
    try {
      const { email } = req.body;
      const [updated] = await User.update({ email }, { where: { id: req.params.id }});
      if (updated) {
        const updatedUser = await User.findByPk(req.params.id);
        res.status(200).json(updatedUser);
      } else {
        res.status(404).send('User not found');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).send(error.message);
    }
  });
  
  // Delete a user
  router.delete('/users/:id', async (req, res) => {
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