const express = require('express');
const router = express.Router();

const userRouter = require('./user');
const expenseRouter = require('./expense');
const { authenticateToken } = require('../helper');

router.use('/user', userRouter);
router.use('/expense', authenticateToken,  expenseRouter);

module.exports = router;