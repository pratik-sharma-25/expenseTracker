const express = require('express');
const router = express.Router();

const userRouter = require('../routes/user');
const expenseRouter = require('../routes/expense');
const { authenticateToken } = require('../helper');

router.use('/user', userRouter);
router.use('/expense', authenticateToken,  expenseRouter);

module.exports = router;