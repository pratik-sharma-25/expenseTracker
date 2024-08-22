const express = require('express');
const router = express.Router();

const UserController = require('../controllers/UserController');

// Route to login user
router.post('/login', UserController.loginUser);

// Route to create a new user
router.post('/create-account', UserController.createUser);

module.exports = router;
